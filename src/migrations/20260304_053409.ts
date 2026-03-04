import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'coordinator', 'teacher', 'student');
  CREATE TYPE "public"."enum_users_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_users_teacher_info_designation" AS ENUM('Permanent', 'visiting');
  CREATE TYPE "public"."enum_users_personal_info_gender" AS ENUM('male', 'female');
  CREATE TYPE "public"."enum_universities_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_semesters_semester_number" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8');
  CREATE TYPE "public"."enum_semesters_status" AS ENUM('upcoming', 'ongoing', 'completed');
  CREATE TYPE "public"."enum_classes_days" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
  CREATE TYPE "public"."enum_classes_time_slot" AS ENUM('08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00');
  CREATE TYPE "public"."enum_classes_lecture_type" AS ENUM('theory', 'lab');
  CREATE TYPE "public"."enum_classes_status" AS ENUM('scheduled', 'ongoing', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_enrollments_status" AS ENUM('enrolled', 'dropped', 'completed');
  CREATE TYPE "public"."enum_enrollments_grade" AS ENUM('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" NOT NULL,
  	"status" "enum_users_status" DEFAULT 'active' NOT NULL,
  	"teacher_info_department_id" integer,
  	"teacher_info_designation" "enum_users_teacher_info_designation",
  	"teacher_info_qualification" varchar,
  	"teacher_info_joining_date" timestamp(3) with time zone,
  	"coordinator_info_department_id" integer,
  	"coordinator_info_qualification" varchar,
  	"coordinator_info_joining_date" timestamp(3) with time zone,
  	"personal_info_phone" varchar NOT NULL,
  	"personal_info_date_of_birth" timestamp(3) with time zone NOT NULL,
  	"personal_info_gender" "enum_users_personal_info_gender" NOT NULL,
  	"personal_info_cnic" varchar NOT NULL,
  	"address_street" varchar NOT NULL,
  	"address_city" varchar NOT NULL,
  	"address_state" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "departments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "universities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"status" "enum_universities_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "semesters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session" varchar NOT NULL,
  	"semester_number" "enum_semesters_semester_number" NOT NULL,
  	"university_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar,
  	"department_id" integer NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_semesters_status" NOT NULL,
  	"is_active" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"credit_hours" numeric NOT NULL,
  	"department_id" integer NOT NULL,
  	"university_id" integer NOT NULL,
  	"semester_id" integer,
  	"teacher_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "classes_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_classes_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "classes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"section" varchar NOT NULL,
  	"university_id" integer NOT NULL,
  	"department_id" integer NOT NULL,
  	"course_id" integer,
  	"semester_id" integer,
  	"teacher_id" integer,
  	"time_slot" "enum_classes_time_slot" NOT NULL,
  	"max_students" numeric DEFAULT 20 NOT NULL,
  	"current_students" numeric DEFAULT 0,
  	"lecture_type" "enum_classes_lecture_type" DEFAULT 'theory' NOT NULL,
  	"status" "enum_classes_status" DEFAULT 'scheduled' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "students" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"roll_no" varchar NOT NULL,
  	"university_id" integer NOT NULL,
  	"department_id" integer,
  	"semester_id" integer NOT NULL,
  	"batch" varchar NOT NULL,
  	"admission_date" timestamp(3) with time zone NOT NULL,
  	"user_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enrollments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"class_id" integer NOT NULL,
  	"status" "enum_enrollments_status" DEFAULT 'enrolled' NOT NULL,
  	"grade" "enum_enrollments_grade",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"departments_id" integer,
  	"universities_id" integer,
  	"semesters_id" integer,
  	"courses_id" integer,
  	"classes_id" integer,
  	"students_id" integer,
  	"enrollments_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_teacher_info_department_id_departments_id_fk" FOREIGN KEY ("teacher_info_department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_coordinator_info_department_id_departments_id_fk" FOREIGN KEY ("coordinator_info_department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "semesters" ADD CONSTRAINT "semesters_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "semesters" ADD CONSTRAINT "semesters_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_semester_id_semesters_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semesters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "classes_days" ADD CONSTRAINT "classes_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "classes" ADD CONSTRAINT "classes_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "classes" ADD CONSTRAINT "classes_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "classes" ADD CONSTRAINT "classes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "classes" ADD CONSTRAINT "classes_semester_id_semesters_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semesters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "students" ADD CONSTRAINT "students_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "students" ADD CONSTRAINT "students_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "students" ADD CONSTRAINT "students_semester_id_semesters_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semesters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_universities_fk" FOREIGN KEY ("universities_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_semesters_fk" FOREIGN KEY ("semesters_id") REFERENCES "public"."semesters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_classes_fk" FOREIGN KEY ("classes_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_students_fk" FOREIGN KEY ("students_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enrollments_fk" FOREIGN KEY ("enrollments_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_teacher_info_teacher_info_department_idx" ON "users" USING btree ("teacher_info_department_id");
  CREATE INDEX "users_coordinator_info_coordinator_info_department_idx" ON "users" USING btree ("coordinator_info_department_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "departments_code_idx" ON "departments" USING btree ("code");
  CREATE INDEX "departments_updated_at_idx" ON "departments" USING btree ("updated_at");
  CREATE INDEX "departments_created_at_idx" ON "departments" USING btree ("created_at");
  CREATE INDEX "universities_updated_at_idx" ON "universities" USING btree ("updated_at");
  CREATE INDEX "universities_created_at_idx" ON "universities" USING btree ("created_at");
  CREATE INDEX "semesters_university_idx" ON "semesters" USING btree ("university_id");
  CREATE UNIQUE INDEX "semesters_code_idx" ON "semesters" USING btree ("code");
  CREATE INDEX "semesters_department_idx" ON "semesters" USING btree ("department_id");
  CREATE INDEX "semesters_updated_at_idx" ON "semesters" USING btree ("updated_at");
  CREATE INDEX "semesters_created_at_idx" ON "semesters" USING btree ("created_at");
  CREATE UNIQUE INDEX "session_semesterNumber_department_university_idx" ON "semesters" USING btree ("session","semester_number","department_id","university_id");
  CREATE UNIQUE INDEX "code_idx" ON "semesters" USING btree ("code");
  CREATE UNIQUE INDEX "courses_code_idx" ON "courses" USING btree ("code");
  CREATE INDEX "courses_department_idx" ON "courses" USING btree ("department_id");
  CREATE INDEX "courses_university_idx" ON "courses" USING btree ("university_id");
  CREATE INDEX "courses_semester_idx" ON "courses" USING btree ("semester_id");
  CREATE INDEX "courses_teacher_idx" ON "courses" USING btree ("teacher_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE UNIQUE INDEX "code_1_idx" ON "courses" USING btree ("code");
  CREATE INDEX "university_idx" ON "courses" USING btree ("university_id");
  CREATE INDEX "department_idx" ON "courses" USING btree ("department_id");
  CREATE INDEX "classes_days_order_idx" ON "classes_days" USING btree ("order");
  CREATE INDEX "classes_days_parent_idx" ON "classes_days" USING btree ("parent_id");
  CREATE INDEX "classes_university_idx" ON "classes" USING btree ("university_id");
  CREATE INDEX "classes_department_idx" ON "classes" USING btree ("department_id");
  CREATE INDEX "classes_course_idx" ON "classes" USING btree ("course_id");
  CREATE INDEX "classes_semester_idx" ON "classes" USING btree ("semester_id");
  CREATE INDEX "classes_teacher_idx" ON "classes" USING btree ("teacher_id");
  CREATE INDEX "classes_updated_at_idx" ON "classes" USING btree ("updated_at");
  CREATE INDEX "classes_created_at_idx" ON "classes" USING btree ("created_at");
  CREATE UNIQUE INDEX "course_section_semester_idx" ON "classes" USING btree ("course_id","section","semester_id");
  CREATE UNIQUE INDEX "students_roll_no_idx" ON "students" USING btree ("roll_no");
  CREATE INDEX "students_university_idx" ON "students" USING btree ("university_id");
  CREATE INDEX "students_department_idx" ON "students" USING btree ("department_id");
  CREATE INDEX "students_semester_idx" ON "students" USING btree ("semester_id");
  CREATE UNIQUE INDEX "students_user_idx" ON "students" USING btree ("user_id");
  CREATE INDEX "students_updated_at_idx" ON "students" USING btree ("updated_at");
  CREATE INDEX "students_created_at_idx" ON "students" USING btree ("created_at");
  CREATE UNIQUE INDEX "rollNo_idx" ON "students" USING btree ("roll_no");
  CREATE UNIQUE INDEX "user_idx" ON "students" USING btree ("user_id");
  CREATE INDEX "university_1_idx" ON "students" USING btree ("university_id");
  CREATE INDEX "department_1_idx" ON "students" USING btree ("department_id");
  CREATE INDEX "semester_idx" ON "students" USING btree ("semester_id");
  CREATE INDEX "enrollments_student_idx" ON "enrollments" USING btree ("student_id");
  CREATE INDEX "enrollments_class_idx" ON "enrollments" USING btree ("class_id");
  CREATE INDEX "enrollments_updated_at_idx" ON "enrollments" USING btree ("updated_at");
  CREATE INDEX "enrollments_created_at_idx" ON "enrollments" USING btree ("created_at");
  CREATE UNIQUE INDEX "student_class_idx" ON "enrollments" USING btree ("student_id","class_id");
  CREATE INDEX "student_idx" ON "enrollments" USING btree ("student_id");
  CREATE INDEX "class_idx" ON "enrollments" USING btree ("class_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_departments_id_idx" ON "payload_locked_documents_rels" USING btree ("departments_id");
  CREATE INDEX "payload_locked_documents_rels_universities_id_idx" ON "payload_locked_documents_rels" USING btree ("universities_id");
  CREATE INDEX "payload_locked_documents_rels_semesters_id_idx" ON "payload_locked_documents_rels" USING btree ("semesters_id");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_classes_id_idx" ON "payload_locked_documents_rels" USING btree ("classes_id");
  CREATE INDEX "payload_locked_documents_rels_students_id_idx" ON "payload_locked_documents_rels" USING btree ("students_id");
  CREATE INDEX "payload_locked_documents_rels_enrollments_id_idx" ON "payload_locked_documents_rels" USING btree ("enrollments_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "departments" CASCADE;
  DROP TABLE "universities" CASCADE;
  DROP TABLE "semesters" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "classes_days" CASCADE;
  DROP TABLE "classes" CASCADE;
  DROP TABLE "students" CASCADE;
  DROP TABLE "enrollments" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_status";
  DROP TYPE "public"."enum_users_teacher_info_designation";
  DROP TYPE "public"."enum_users_personal_info_gender";
  DROP TYPE "public"."enum_universities_status";
  DROP TYPE "public"."enum_semesters_semester_number";
  DROP TYPE "public"."enum_semesters_status";
  DROP TYPE "public"."enum_classes_days";
  DROP TYPE "public"."enum_classes_time_slot";
  DROP TYPE "public"."enum_classes_lecture_type";
  DROP TYPE "public"."enum_classes_status";
  DROP TYPE "public"."enum_enrollments_status";
  DROP TYPE "public"."enum_enrollments_grade";`)
}
