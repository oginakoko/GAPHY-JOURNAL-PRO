-- Life Journal Entries Table
create table life_journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  content text not null,
  mood text,
  tags text[],
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_deleted boolean default false
);

-- Enable RLS
alter table life_journal_entries enable row level security;

-- Create RLS policies
create policy "Users can view their own entries"
  on life_journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on life_journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on life_journal_entries for update
  using (auth.uid() = user_id);

-- Create indexes
create index life_journal_entries_user_id_idx on life_journal_entries(user_id);
create index life_journal_entries_created_at_idx on life_journal_entries(created_at);
