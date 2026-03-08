DROP INDEX "packages_apartment_block_idx";--> statement-breakpoint
DROP INDEX "packages_recipient_name_idx";--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "tracking_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "status" SET DEFAULT 'ENTREGA_PENDENTE';--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "resident_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_resident_id_users_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "packages_resident_id_idx" ON "packages" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "packages_tracking_code_idx" ON "packages" USING btree ("tracking_code");--> statement-breakpoint
ALTER TABLE "packages" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "packages" DROP COLUMN "notes";