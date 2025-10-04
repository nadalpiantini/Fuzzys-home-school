-- 07_cross_subject_recommendations.sql
-- Cross-subject recommendations based on performance patterns

-- View for cross-subject recommendations based on weak areas
create or replace view public.v_cross_recommendations as
select
  cp.student_id,
  cn.subject as weak_subject,
  case
    -- Math struggling → suggest literacy fundamentals
    when cn.subject = 'math' and avg(cp.score) < 60 then 'literacy'
    -- Literacy struggling → suggest math basics
    when cn.subject = 'literacy' and avg(cp.score) < 60 then 'math'
    -- Science struggling → suggest both math and literacy
    when cn.subject = 'science' and avg(cp.score) < 60 then 'math,literacy'
    -- History/Social struggling → suggest literacy
    when cn.subject in ('history', 'social') and avg(cp.score) < 60 then 'literacy'
    else null
  end as suggested_subjects,
  cn.curriculum_id as source_curriculum,
  round(avg(cp.score)::numeric, 2) as avg_score,
  count(cp.id) as attempts,
  max(cp.completed_at) as last_attempt
from public.chapter_progress cp
join public.curriculum_nodes cn
  on cp.curriculum_id = cn.curriculum_id
  and cp.chapter_id = cn.chapter_id
where cp.completed_at is not null
group by cp.student_id, cn.subject, cn.curriculum_id
having avg(cp.score) < 60 and count(cp.id) >= 2; -- at least 2 attempts to identify pattern

-- Grant permissions
grant select on public.v_cross_recommendations to anon, authenticated;

-- View for recommended next chapters based on student performance
create or replace view public.v_recommended_chapters as
with student_avg as (
  select
    student_id,
    curriculum_id,
    round(avg(score)::numeric, 2) as avg_score,
    count(*) as completed_count
  from public.chapter_progress
  where completed_at is not null
  group by student_id, curriculum_id
),
unlocked_chapters as (
  select distinct
    student_id,
    curriculum_id,
    chapter_id
  from public.student_unlocked_paths
)
select
  sa.student_id,
  cn.curriculum_id,
  cn.chapter_id,
  cn.title,
  cn.difficulty,
  cn.subject,
  sa.avg_score,
  case
    -- High performers get harder chapters
    when sa.avg_score >= 85 then 'challenge'
    -- Struggling students get reinforcement
    when sa.avg_score < 60 then 'reinforcement'
    -- Average students continue normal path
    else 'progression'
  end as recommendation_type,
  uc.chapter_id is not null as already_unlocked
from student_avg sa
join public.curriculum_nodes cn
  on sa.curriculum_id = cn.curriculum_id
left join unlocked_chapters uc
  on sa.student_id = uc.student_id
  and cn.curriculum_id = uc.curriculum_id
  and cn.chapter_id = uc.chapter_id
where
  -- Recommend appropriate difficulty based on performance
  (sa.avg_score >= 85 and cn.difficulty in ('medium', 'hard'))
  or (sa.avg_score between 60 and 84 and cn.difficulty in ('easy', 'medium'))
  or (sa.avg_score < 60 and cn.difficulty = 'easy');

-- Grant permissions
grant select on public.v_recommended_chapters to anon, authenticated;

-- Function to get personalized learning path
create or replace function public.get_learning_path(
  p_student_id uuid,
  p_curriculum_id text,
  p_limit int default 5
)
returns table (
  chapter_id text,
  title text,
  difficulty text,
  recommendation_type text,
  priority int
) as $$
begin
  return query
  with student_performance as (
    select
      round(avg(score)::numeric, 2) as avg_score,
      count(*) as total_attempts
    from public.chapter_progress
    where student_id = p_student_id
      and curriculum_id = p_curriculum_id
      and completed_at is not null
  )
  select
    rc.chapter_id,
    rc.title,
    rc.difficulty,
    rc.recommendation_type,
    case rc.recommendation_type
      when 'reinforcement' then 1  -- highest priority for struggling students
      when 'progression' then 2     -- normal progression
      when 'challenge' then 3       -- challenges for high performers
      else 4
    end as priority
  from public.v_recommended_chapters rc
  cross join student_performance sp
  where rc.student_id = p_student_id
    and rc.curriculum_id = p_curriculum_id
    and not rc.already_unlocked
  order by priority, rc.order_index
  limit p_limit;
end;
$$ language plpgsql security definer;

-- Grant execute permission
grant execute on function public.get_learning_path to authenticated;

-- Comment documentation
comment on view public.v_cross_recommendations is
  'Identifies weak subject areas and suggests cross-subject reinforcement';
comment on view public.v_recommended_chapters is
  'Recommends next chapters based on student performance and adaptive difficulty';
comment on function public.get_learning_path is
  'Returns personalized learning path with prioritized chapter recommendations';
