-- db/001_create_notifications.sql
create extension if not exists pgcrypto;

create table notification_contexts (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  title text not null,
  body text,
  data jsonb,
  created_at timestamptz default now()
);

create table notifications (
  id uuid default gen_random_uuid() primary key,
  context_id uuid references notification_contexts(id) not null,
  recipient_role text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  endpoint text unique not null,
  subscription jsonb not null,
  created_at timestamptz default now()
);

create index on notifications (recipient_role);
create index on notifications (created_at desc);
