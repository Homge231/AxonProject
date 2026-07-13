import fs from 'fs'
import path from 'path'

const filesToUpdate = [
  'server/src/cores/families.ts',
  'server/src/cores/index.ts',
  'client/src/game/cores/families.ts',
  'client/src/game/cores/registry.ts'
]

const replacements = {
  'Supernova Core': 'Supernova',
  'Phoenix Core': 'Phoenix',
  'Overclock Core': 'Overclock',
  'Harmony Core': 'Harmony',
  'Zenith Core': 'Zenith',
  'Gigawatt Core': 'Gigawatt',
  'Supermassive Core': 'Supermassive',
  'Rebirth Core': 'Rebirth',
  
  'supernova core': 'supernova',
  'phoenix core': 'phoenix',
  'overclock core': 'overclock',
  'harmony core': 'harmony',
  'zenith core': 'zenith',
  'gigawatt core': 'gigawatt',
  'supermassive core': 'supermassive',
  'rebirth core': 'rebirth'
}

for (const file of filesToUpdate) {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8')
    let changed = false
    for (const [oldName, newName] of Object.entries(replacements)) {
      if (content.includes(oldName)) {
        content = content.replaceAll(oldName, newName)
        changed = true
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`Updated ${file}`)
    }
  } else {
    console.warn(`File not found: ${filePath}`)
  }
}
