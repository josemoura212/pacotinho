CREATE TYPE "public"."audit_action" AS ENUM('CRIACAO', 'EDICAO', 'MUDANCA_STATUS', 'ENTREGA_CONCLUIDA', 'CONFIRMACAO_RECEBIMENTO');--> statement-breakpoint
CREATE TYPE "public"."package_status" AS ENUM('REGISTRO_PENDENTE', 'ENTREGA_PENDENTE', 'ENTREGA_CONCLUIDA');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('MORADOR', 'PORTEIRO', 'ADMIN');--> statement-breakpoint
CREATE TABLE "package_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"changes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(500),
	"recipient_name" varchar(255),
	"apartment" varchar(20),
	"block" varchar(20),
	"photo_path" varchar(500),
	"tracking_code" varchar(100),
	"notes" text,
	"status" "package_status" DEFAULT 'REGISTRO_PENDENTE' NOT NULL,
	"registered_by_id" uuid NOT NULL,
	"delivered_by_id" uuid,
	"received_by_id" uuid,
	"received_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"apartment" varchar(20),
	"block" varchar(20),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "package_audit_logs" ADD CONSTRAINT "package_audit_logs_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_audit_logs" ADD CONSTRAINT "package_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_registered_by_id_users_id_fk" FOREIGN KEY ("registered_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_delivered_by_id_users_id_fk" FOREIGN KEY ("delivered_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_received_by_id_users_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_package_id_idx" ON "package_audit_logs" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "packages_status_idx" ON "packages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "packages_apartment_block_idx" ON "packages" USING btree ("apartment","block");--> statement-breakpoint
CREATE INDEX "packages_recipient_name_idx" ON "packages" USING btree ("recipient_name");--> statement-breakpoint
CREATE INDEX "packages_created_at_idx" ON "packages" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");