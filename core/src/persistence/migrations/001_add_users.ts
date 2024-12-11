import { Effect } from "effect"
import { SqlClient } from "@effect/sql"

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE SCHEMA wozza;

    CREATE TABLE wozza.users (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        first_name text,
        last_name text,
        email text NOT NULL UNIQUE,
        picture text,
        created_at date NOT NULL DEFAULT now(),
        updated_at date NOT NULL DEFAULT now()
    );

    CREATE TABLE wozza.user_sessions (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES wozza.users(id) ON DELETE CASCADE,
        created_at date NOT NULL DEFAULT now(),
        expires_at date NOT NULL
    );
  `
)
