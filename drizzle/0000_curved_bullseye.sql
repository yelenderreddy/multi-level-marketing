CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PAID');--> statement-breakpoint
CREATE TYPE "public"."redeem_status" AS ENUM('processing', 'deposited');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'completed', 'failed', 'processing');--> statement-breakpoint
CREATE TABLE "cart" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_bank_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"ifsc_code" varchar(20) NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"account_holder_name" varchar(255) NOT NULL,
	"redeem_amount" integer DEFAULT 0 NOT NULL,
	"redeem_status" "redeem_status" DEFAULT 'processing' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"mobile_number" varchar(15) NOT NULL,
	"address" varchar(255),
	"gender" varchar(10),
	"password_hash" varchar(255) NOT NULL,
	"referral_code" varchar(50) NOT NULL,
	"referral_count" integer DEFAULT 0 NOT NULL,
	"referral_count_at_last_redeem" integer DEFAULT 0 NOT NULL,
	"reward" varchar(255),
	"wallet_balance" integer DEFAULT 0 NOT NULL,
	"referred_by_code" varchar(50),
	"payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_mobile_number_unique" UNIQUE("mobile_number"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"productName" varchar(255) NOT NULL,
	"description" text,
	"photo" varchar(255),
	"productPrice" integer DEFAULT 0 NOT NULL,
	"productCount" integer DEFAULT 0 NOT NULL,
	"productStatus" "product_status" DEFAULT 'AVAILABLE' NOT NULL,
	"productCode" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"order_id" varchar(255) NOT NULL,
	"payment_id" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"receipt" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" varchar(32) DEFAULT 'confirmed' NOT NULL,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"productPrice" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_targets" (
	"id" serial PRIMARY KEY NOT NULL,
	"referral_count" integer NOT NULL,
	"reward" varchar(255) NOT NULL,
	"target" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redeem_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"redeem_amount" integer NOT NULL,
	"status" "redeem_status" DEFAULT 'processing' NOT NULL,
	"bank_details" varchar(500),
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deposited_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"payout_id" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"method" varchar(50) NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"description" text NOT NULL,
	"bank_details" text NOT NULL,
	"transaction_id" varchar(100),
	"date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payouts_payout_id_unique" UNIQUE("payout_id")
);
--> statement-breakpoint
CREATE TABLE "privacy" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terms" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_bank_details" ADD CONSTRAINT "user_bank_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;