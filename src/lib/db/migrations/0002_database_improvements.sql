-- Converter timestamp para timestamptz em todas as tabelas
ALTER TABLE "users" ALTER COLUMN "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC';
ALTER TABLE "users" ALTER COLUMN "updated_at" TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';

ALTER TABLE "packages" ALTER COLUMN "received_at" TYPE timestamptz USING "received_at" AT TIME ZONE 'UTC';
ALTER TABLE "packages" ALTER COLUMN "delivered_at" TYPE timestamptz USING "delivered_at" AT TIME ZONE 'UTC';
ALTER TABLE "packages" ALTER COLUMN "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC';
ALTER TABLE "packages" ALTER COLUMN "updated_at" TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';

ALTER TABLE "push_subscriptions" ALTER COLUMN "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "package_audit_logs" ALTER COLUMN "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC';

-- Indexes nas FKs de packages
CREATE INDEX IF NOT EXISTS "packages_registered_by_id_idx" ON "packages" ("registered_by_id");
CREATE INDEX IF NOT EXISTS "packages_delivered_by_id_idx" ON "packages" ("delivered_by_id");
CREATE INDEX IF NOT EXISTS "packages_received_by_id_idx" ON "packages" ("received_by_id");

-- Index composto para listagem de morador
CREATE INDEX IF NOT EXISTS "packages_resident_status_idx" ON "packages" ("resident_id", "status");

-- Index na FK user_id de audit logs
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "package_audit_logs" ("user_id");

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "body" text NOT NULL,
  "url" varchar(500),
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_read_idx" ON "notifications" ("user_id", "read");
