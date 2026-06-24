import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260623161835 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "mpesa_c2b_payment" drop constraint if exists "mpesa_c2b_payment_trans_id_unique";`);
    this.addSql(`create table if not exists "mpesa_c2b_payment" ("id" text not null, "transaction_type" text not null, "trans_id" text not null, "trans_time" text not null, "trans_amount" integer not null, "business_short_code" text not null, "bill_ref_number" text null, "invoice_number" text null, "org_account_balance" text null, "third_party_trans_id" text null, "msisdn" text not null, "first_name" text null, "middle_name" text null, "last_name" text null, "status" text not null, "order_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "mpesa_c2b_payment_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_mpesa_c2b_payment_trans_id_unique" ON "mpesa_c2b_payment" ("trans_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_mpesa_c2b_payment_deleted_at" ON "mpesa_c2b_payment" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "mpesa_c2b_payment" cascade;`);
  }

}
