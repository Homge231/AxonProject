/**
 * uploadCoreIcons.ts
 *
 * 1. Creates Supabase Storage bucket `core-icons` (if not exists)
 * 2. Uploads all icon JPGs from client/public/icons/cores/{family}/
 * 3. Adds `icon_url` column to `cores` table (if not exists)
 * 4. Updates each core row with the public URL of its icon
 */
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const BUCKET_NAME = 'core-icons'
const ICONS_DIR = path.resolve(__dirname, '../../../client/public/icons/cores')

/** Convert core name to the slug used in filenames */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/\s+/g, '-')
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === BUCKET_NAME)
  
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 1024 * 1024, // 1MB per icon
    })
    if (error) {
      console.error('Failed to create bucket:', error)
      return false
    }
    console.log(`✅ Created bucket: ${BUCKET_NAME}`)
  } else {
    console.log(`✓ Bucket already exists: ${BUCKET_NAME}`)
  }
  return true
}

async function addIconUrlColumn() {
  // Use raw SQL to add column if not exists
  const { error } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE cores ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT NULL;`
  })
  
  if (error) {
    // If the RPC doesn't exist, try direct approach
    console.warn('⚠️  Could not add column via RPC (may need manual SQL):', error.message)
    console.log('📋 Run this SQL manually in Supabase Dashboard if needed:')
    console.log('   ALTER TABLE cores ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT NULL;')
  } else {
    console.log('✅ Added icon_url column to cores table')
  }
}

async function uploadAndUpdateCores() {
  // Get all cores from DB
  const { data: cores, error: fetchErr } = await supabase
    .from('cores')
    .select('id, name')
  
  if (fetchErr || !cores) {
    console.error('Failed to fetch cores:', fetchErr)
    return
  }

  // Get the list of families (subdirectories)
  const families = fs.readdirSync(ICONS_DIR).filter(f => 
    fs.statSync(path.join(ICONS_DIR, f)).isDirectory()
  )

  let uploaded = 0
  let updated = 0
  let missing = 0

  for (const core of cores) {
    const slug = toSlug(core.name)
    
    // Find which family directory contains this icon
    let iconPath: string | null = null
    let family: string | null = null
    
    for (const fam of families) {
      const candidate = path.join(ICONS_DIR, fam, `${slug}.svg`)
      if (fs.existsSync(candidate)) {
        iconPath = candidate
        family = fam
        break
      }
    }

    if (!iconPath || !family) {
      console.warn(`⚠️  No icon file for: "${core.name}" (expected slug: ${slug})`)
      missing++
      continue
    }

    // Upload to Supabase Storage
    const storagePath = `${family}/${slug}.svg`
    const fileBuffer = fs.readFileSync(iconPath)
    
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/svg+xml',
        upsert: true
      })

    if (uploadErr) {
      console.error(`❌ Upload failed for ${core.name}:`, uploadErr.message)
      continue
    }
    uploaded++

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath)
    
    const publicUrl = urlData.publicUrl

    // Update DB using standard update (once the column exists in PostgREST cache)
    const { error: updateErr } = await supabase
      .from('cores')
      .update({ icon_url: publicUrl })
      .eq('id', core.id)

    if (updateErr) {
      console.error(`❌ DB update failed for ${core.name}:`, updateErr.message)
    } else {
      console.log(`✅ ${core.name} → ${publicUrl}`)
      updated++
    }
  }

  console.log(`\n📊 Done. Uploaded: ${uploaded}, DB updated: ${updated}, Missing icons: ${missing}`)
}

async function run() {
  console.log('🔧 Setting up Supabase Storage for core icons...\n')
  
  const bucketOk = await ensureBucket()
  if (!bucketOk) return

  await addIconUrlColumn()
  
  console.log('\n📤 Uploading icons and updating DB...\n')
  await uploadAndUpdateCores()
}

run()
