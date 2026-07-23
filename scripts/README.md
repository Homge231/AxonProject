# /scripts — One-Time Migration & Utility Scripts

These scripts are **not part of the running server**. They were used during development to seed, migrate, or manage data in Supabase.  
Run them manually with `npx ts-node <script>` from the project root (ensure `.env` is loaded).

| Script | Purpose | Status |
|---|---|---|
| `addCoreClassificationFields.ts` | Adds classification columns to `cores` table | ✅ Done |
| `checkCoreType.ts` | Inspects core type enum in Supabase | ✅ Done |
| `crossCheckCores.ts` | Validates DB core names vs code strategies | ✅ Done |
| `dumpCoresForClassification.ts` | Dumps core metadata from DB | ✅ Done |
| `fixTrailingSpaces.ts` | Sanitizes question text in DB | ✅ Done |
| `generateAllSvgs.ts` | Generates SVG core icons | ✅ Done |
| `generateInitialQuestions.ts` | Seeds questions table via Gemini API | 🔁 Reusable |
| `insertEvenMoreCores.ts` | DB seed for additional cores | ✅ Done |
| `insertNewCores.ts` | DB seed for core items | ✅ Done |
| `linkCoresUpgrades.ts` | Links core upgrade paths in DB | ✅ Done |
| `listAllCores.ts` | Lists all rows in `cores` table | 🔁 Reusable |
| `migrateCoreTypes.ts` | DB migration for core types | ✅ Done |
| `nerfAllCores.ts` | Rebalances core multipliers in Supabase | ✅ Done |
| `standardize_cores.sql` | Supabase SQL migration | ✅ Done |
| `supabase_audit_and_migration.sql` | Supabase audit & schema update | ✅ Done |
| `updatePhoenixDescriptions.ts` | One-off DB updater for Phoenix text | ✅ Done |
| `uploadCoreIcons.ts` | Uploads local SVGs to Supabase Storage | ✅ Done |
