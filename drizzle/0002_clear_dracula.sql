CREATE TABLE "reward_targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"referral_count" integer NOT NULL,
	"reward" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_history" ADD COLUMN "status" varchar(32) DEFAULT 'confirmed' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reward" varchar(255);