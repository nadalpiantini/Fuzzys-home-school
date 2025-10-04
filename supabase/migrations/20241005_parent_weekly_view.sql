-- Migration: Parent Weekly View
-- Creates aggregated view for weekly reporting to parents

-- Create the parent weekly view
create or replace view public.v_parent_weekly as
select
  cp.student_id,
  p.full_name as student_name,
  cp.curriculum_id,
  cp.chapter_id,
  cp.completed,
  cp.score,
  cp.updated_at,
  sp.total_points,
  sp.streak_days,
  sp.last_activity
from public.chapter_progress cp
join public.profiles p on p.id = cp.student_id
left join public.student_progress sp on sp.student_id = cp.student_id
where cp.updated_at >= now() - interval '7 days'
order by cp.updated_at desc;

-- Grant permissions
grant select on public.v_parent_weekly to authenticated;
grant select on public.v_parent_weekly to service_role;

-- Add comment
comment on view public.v_parent_weekly is 'Weekly aggregated view for parent reports showing student progress in last 7 days';