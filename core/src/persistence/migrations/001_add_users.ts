import { Effect } from "effect"
import { SqlClient } from "@effect/sql"

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE IF NOT EXISTS wozza.users (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        first_name text,
        last_name text,
        email text NOT NULL UNIQUE,
        picture text
    );

    CREATE UNIQUE INDEX users_pkey ON wozza.users(id uuid_ops);
    CREATE UNIQUE INDEX users_email_key ON wozza.users(email text_ops);

    CREATE TABLE IF NOT EXISTS wozza.user_sessions (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES wozza.users(id) ON DELETE CASCADE,
        created_at date NOT NULL DEFAULT now(),
        expires_at date NOT NULL
    );

    CREATE UNIQUE INDEX sessions_pkey ON wozza.user_sessions(id uuid_ops);
  `
)
