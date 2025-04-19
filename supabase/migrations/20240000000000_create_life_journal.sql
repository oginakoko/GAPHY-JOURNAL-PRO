-- Create life journal entries table
create table if not exists public.life_journal_entries (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    title text not null,
    content text not null,
    mood text,
    tags text[] default array[]::text[],
    is_private boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_deleted boolean default false
);

-- Create life journal mood tracking table
create table if not exists public.life_journal_moods (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    mood text not null,
    score integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.life_journal_entries enable row level security;
alter table public.life_journal_moods enable row level security;

-- Create RLS policies
create policy "Users can view own entries"
    on public.life_journal_entries
    for select
    using (auth.uid() = user_id);

create policy "Users can insert own entries"
    on public.life_journal_entries
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update own entries"
    on public.life_journal_entries
    for update
    using (auth.uid() = user_id);

create policy "Users can delete own entries"
    on public.life_journal_entries
    for delete
    using (auth.uid() = user_id);

create policy "Users can view own moods"
    on public.life_journal_moods
    for select
    using (auth.uid() = user_id);

create policy "Users can insert own moods"
    on public.life_journal_moods
    for insert
    with check (auth.uid() = user_id);

create policy "Users can delete own moods"
    on public.life_journal_moods
    for delete
    using (auth.uid() = user_id);

-- Create indexes
create index life_journal_entries_user_id_idx on public.life_journal_entries(user_id);
create index life_journal_entries_created_at_idx on public.life_journal_entries(created_at);
create index life_journal_moods_user_id_idx on public.life_journal_moods(user_id);
create index life_journal_moods_created_at_idx on public.life_journal_moods(created_at);

-- Set up updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at
    before update on public.life_journal_entries
    for each row
    execute procedure update_updated_at_column();
