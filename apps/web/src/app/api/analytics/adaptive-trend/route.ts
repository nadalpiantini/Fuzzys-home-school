import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get data from last 30 days
    const since = new Date(Date.now() - 30 * 86400 * 1000).toISOString()

    // Get chapter progress for trend analysis
    const { data: chapterProgress, error } = await supabase
      .from('chapter_progress')
      .select('score, updated_at, curriculum_id')
      .gte('updated_at', since)
      .eq('completed', true)

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    // Calculate daily average scores for trend
    const dailyScores: Record<string, { sum: number; count: number }> = {}
    
    // Track curriculum activity for heatmap
    const heatmapData: Record<string, number> = {}

    for (const row of chapterProgress || []) {
      const day = new Date(row.updated_at).toISOString().slice(0, 10)
      
      // Daily scores
      if (!dailyScores[day]) {
        dailyScores[day] = { sum: 0, count: 0 }
      }
      if (typeof row.score === 'number') {
        dailyScores[day].sum += row.score
        dailyScores[day].count += 1
      }

      // Heatmap data (curriculum + day)
      const heatKey = `${row.curriculum_id}|${day}`
      heatmapData[heatKey] = (heatmapData[heatKey] || 0) + 1
    }

    // Format trend data
    const trendData = Object.entries(dailyScores)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([day, stats]) => ({
        day,
        avgScore: stats.count > 0 ? Math.round(stats.sum / stats.count) : 0,
      }))

    // Format heatmap data
    const heatmap = Object.entries(heatmapData).map(([key, count]) => {
      const [curriculumId, day] = key.split('|')
      return {
        curriculum_id: curriculumId,
        day,
        completed: count,
      }
    })

    return NextResponse.json({
      ok: true,
      data: {
        trend: trendData,
        weekly: heatmap,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
