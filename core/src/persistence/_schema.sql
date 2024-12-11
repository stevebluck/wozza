CREATE SCHEMA wozza;

CREATE TABLE public.effect_sql_migrations (
    migration_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL
);

CREATE TABLE wozza.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text,
    last_name text,
    email text NOT NULL,
    picture text,
    created_at date DEFAULT now() NOT NULL,
    updated_at date DEFAULT now() NOT NULL
);

CREATE TABLE wozza.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at date DEFAULT now() NOT NULL,
    expires_at date NOT NULL
);


ALTER TABLE ONLY public.effect_sql_migrations
    ADD CONSTRAINT effect_sql_migrations_pkey PRIMARY KEY (migration_id);

ALTER TABLE ONLY wozza.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY wozza.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY wozza.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY wozza.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES wozza.users(id) ON DELETE CASCADE;

INSERT INTO public.effect_sql_migrations (migration_id, created_at, name) VALUES (1, '2024-12-10 20:23:29.125636+00', 'add_users');