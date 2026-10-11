// scripts/cleanup-data.ts
import 'dotenv/config'
import { getPayload } from 'payload'
import payloadConfig from '../src/payload.config'

const cleanup = async () => {
  const payload = await getPayload({ config: payloadConfig })

  console.log('🧹 Cleaning UMS Database Data...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  This will delete ALL data but keep table structure\n')

  // List of all collections in order (to respect foreign key constraints)
  const collections = [
    'fee-payments',
    'fee-structure',
    'teacher-salary',
    'grades',
    'exams',
    'attendance',
    'enrollments',
    'timetable',
    'classes',
    'students',
    'batches',
    'semesters',
    'courses',
    'departments',
    'users',
  ]

  let totalDeleted = 0

  for (const collection of collections) {
    try {
      // Get all records
      const result = await payload.find({
        collection: collection as any,
        limit: 0, // Get count only
        depth: 0,
      })

      const count = result.totalDocs

      if (count > 0) {
        // Delete all records
        // Note: Payload doesn't have a bulk delete, so we delete in batches
        const batchSize = 100
        let deleted = 0

        while (deleted < count) {
          const batch = await payload.find({
            collection: collection as any,
            limit: batchSize,
            depth: 0,
          })

          for (const doc of batch.docs) {
            await payload.delete({
              collection: collection as any,
              id: doc.id,
            })
            deleted++
          }

          console.log(`  🗑️  ${collection}: ${deleted}/${count} deleted`)
        }

        totalDeleted += count
        console.log(`  ✅ ${collection}: ${count} records deleted`)
      } else {
        console.log(`  ⏭️  ${collection}: no data`)
      }
    } catch (error) {
      console.log(`  ❌ ${collection}: error - ${(error as Error).message}`)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Cleanup complete! Total records deleted: ${totalDeleted}`)
  console.log('📝 Table structure preserved')
  console.log('🌱 Run `pnpm seed` to add fresh data\n')
}

cleanup().catch((error) => {
  console.error('❌ Cleanup failed:', error)
  process.exit(1)
})
