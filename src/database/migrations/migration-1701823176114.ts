import { Migration, QueryRunner } from "typeorm";

export class Migration1701823176114 extends Migration {
  up = async (runner: QueryRunner) => {
    await runner.query(`
      create extension if not exists pgcrypto;
      create extension if not exists pg_trgm;
      create extension if not exists btree_gin;

      create table accounts (
          id uuid primary key default gen_random_uuid()
        , created_at timestamptz not null default now()
        , updated_at timestamptz not null default now()
        , deleted_at timestamptz
        , email text not null
        , unique(email)
      );

      /* Index on email to support text search by email. */
      create index accounts_email_idx
        on accounts
        using gin(email);

      /* Using brin index because there can be a lot of timestamps. */
      create index accounts_created_at_idx
        on accounts
        using brin (created_at);

      create table account_permissions (
          created_at timestamptz not null default now()
        , account_id uuid not null
            references accounts(id) on delete cascade
        , subject text not null
        , access_level text not null
        , unique(account_id, subject, access_level)
      );

      create index account_permissions_account_id_idx
        on account_permissions
        using btree(account_id);

      create index account_permissions_subject_idx
        on account_permissions
        using btree(subject);

      create index account_permissions_subject_access_level_idx
        on account_permissions
        using btree(subject, access_level);
    `);
  }
}