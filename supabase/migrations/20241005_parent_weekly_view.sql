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
  COALESCE(sp.total_points, 0) as total_points,
  COALESCE(sp.streak_days, 0) as streak_days,
  COALESCE(sp.last_activity, cp.updated_at) as last_activity
from public.chapter_progress cp
join public.profiles p on p.id = cp.student_id
left join (
  select 
    student_id,
    SUM(total_points) as total_points,
    MAX(streak_days) as streak_days,
    MAX(last_activity) as last_activity
  from public.student_progress 
  group by student_id
) sp on sp.student_id = cp.student_id
where cp.updated_at >= now() - interval '7 days'
order by cp.updated_at desc;

-- Grant permissions
grant select on public.v_parent_weekly to authenticated;
grant select on public.v_parent_weekly to service_role;

-- Add comment
comment on view public.v_parent_weekly is 'Weekly aggregated view for parent reports showing student progress in last 7 days';