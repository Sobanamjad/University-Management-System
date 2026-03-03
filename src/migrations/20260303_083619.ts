import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Sirf university column add karo (jo missing tha)

  // 1. Check if university_id column exists in courses table
  await db.execute(sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'university_id'
      ) THEN
        -- Add university_id column
        ALTER TABLE courses ADD COLUMN university_id INTEGER;
        
        -- Add foreign key constraint
        ALTER TABLE courses 
        ADD CONSTRAINT courses_university_id_fkey 
        FOREIGN KEY (university_id) REFERENCES universities(id);
        
        -- Add index
        CREATE INDEX idx_courses_university ON courses(university_id);
        
        -- Update existing courses with default university
        WITH default_uni AS (
          SELECT id FROM universities ORDER BY id LIMIT 1
        )
        UPDATE courses 
        SET university_id = (SELECT id FROM default_uni)
        WHERE university_id IS NULL;
      END IF;
    END $$;
  `)

  console.log('✅ University column added to courses table!')
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Rollback - agar zaroorat ho to
  await db.execute(sql`
    ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_university_id_fkey;
    DROP INDEX IF EXISTS idx_courses_university;
    ALTER TABLE courses DROP COLUMN IF EXISTS university_id;
  `)
}
