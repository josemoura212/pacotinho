ALTER TABLE "packages" ADD COLUMN "resident_id" uuid;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_resident_id_users_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "tracking_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "status" SET DEFAULT 'ENTREGA_PENDENTE';--> statement-breakpoint
DROP INDEX "packages_apartment_block_idx";--> statement-breakpoint
DROP INDEX "packages_recipient_name_idx";--> statement-breakpoint
CREATE INDEX "packages_resident_id_idx" ON "packages" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "packages_tracking_code_idx" ON "packages" USING btree ("tracking_code");--> statement-breakpoint
ALTER TABLE "packages" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "packages" DROP COLUMN "notes";--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_change_password" boolean DEFAULT true NOT NULL;
