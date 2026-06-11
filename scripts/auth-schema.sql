-- Create a table for public profiles linked to Auth Users
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('coach', 'player', 'admin')) default 'player',
  player_id uuid references players(id), -- Nullable, links to stats profile
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'player');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create session requests table
create table if not exists session_requests (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references players(id) not null,
  requested_date date not null,
  focus text check (focus in ('batting', 'bowling', 'fielding', 'fitness')) not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for session_requests (Simplified for dev)
alter table session_requests enable row level security;

create policy "Users can view all requests" on session_requests
  for select using (true);

create policy "Users can insert requests" on session_requests
  for insert with check (true);
  
create policy "Users can update requests" on session_requests
  for update using (true);
