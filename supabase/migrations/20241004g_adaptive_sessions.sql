-- Adaptive Learning Sessions & Events
-- Tracks student sessions with auto-adjusting difficulty based on performance

-- Adaptive sessions table (one per student/curriculum/chapter combo)
create table if not exists public.adaptive_sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  curriculum_id text not null,
  chapter_id text not null,
  current_difficulty text not null default 'medium', -- easy|medium|hard
  started_at timestamptz default now(),
  updated_at timestamptz default now(),
  total_questions int default 0,
  correct_answers int default 0,
  avg_response_ms int default 0,
  unique (student_id, curriculum_id, chapter_id)
);

-- Enable RLS
alter table public.adaptive_sessions enable row level security;

-- Policies: students can only access their own sessions
create policy "Students read own sessions"
  on public.adaptive_sessions for select 
  using (auth.uid() = student_id);

create policy "Students insert own sessions"
  on public.adaptive_sessions for insert 
  with check (auth.uid() = student_id);

create policy "Students update own sessions"
  on public.adaptive_sessions for update 
  using (auth.uid() = student_id);

-- Adaptive events table (individual question attempts)
create table if not exists public.adaptive_events (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.adaptive_sessions(id) on delete cascade,
  event_type text not null, -- 'question_submitted' | 'hint' | 'timeout'
  correct boolean,
  response_ms int,
  payload jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.adaptive_events enable row level security;

-- Policies: students can only access events from their sessions
create policy "Students read own session events"
  on public.adaptive_events for select using (
    exists (
      select 1 from public.adaptive_sessions s 
      where s.id = session_id and s.student_id = auth.uid()
    )
  );

create policy "Students insert own session events"
  on public.adaptive_events for insert with check (
    exists (
      select 1 from public.adaptive_sessions s 
      where s.id = session_id and s.student_id = auth.uid()
    )
  );

-- Function: Update metrics and adjust difficulty based on accuracy and speed
create or replace function public.adaptive_update_metrics(p_session uuid)
returns table (new_difficulty text, acc numeric, avg_ms int)
language plpgsql as $$
declare
  v_total int;
  v_correct int;
  v_avg int;
  v_diff text;
  v_row public.adaptive_sessions%rowtype;
begin
  -- Calculate metrics from events
  select 
    count(*),
    count(*) filter (where correct),
    coalesce(avg(response_ms), 0)
  into v_total, v_correct, v_avg
  from public.adaptive_events
  where session_id = p_session 
    and event_type = 'question_submitted';

  -- Get current session
  select * into v_row 
  from public.adaptive_sessions 
  where id = p_session;

  -- Heuristic: >85% accuracy + fast response -> level up
  --            <60% accuracy or very slow -> level down
  if v_total >= 3 then
    if (v_correct::numeric / v_total) >= 0.85 and v_avg <= 8000 then
      v_diff := case 
        when v_row.current_difficulty = 'easy' then 'medium'
        when v_row.current_difficulty = 'medium' then 'hard'
        else 'hard' 
      end;
    elsif (v_correct::numeric / v_total) < 0.6 or v_avg > 15000 then
      v_diff := case 
        when v_row.current_difficulty = 'hard' then 'medium'
        when v_row.current_difficulty = 'medium' then 'easy'
        else 'easy' 
      end;
    else
      v_diff := v_row.current_difficulty;
    end if;
  else
    v_diff := v_row.current_difficulty;
  end if;

  -- Update session with new metrics and difficulty
  update public.adaptive_sessions
  set total_questions = v_total,
      correct_answers = v_correct,
      avg_response_ms = v_avg,
      current_difficulty = v_diff,
      updated_at = now()
  where id = p_session;

  -- Return results
  new_difficulty := v_diff;
  acc := (case when v_total > 0 then v_correct::numeric / v_total else 0 end);
  avg_ms := v_avg;
  return next;
end $$;
