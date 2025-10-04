'use client';

import { PopularActivity } from '@/services/analytics/types';

interface HeatmapChartProps {
  data: PopularActivity[];
}

export function HeatmapChart({ data }: HeatmapChartProps) {
  // Group activities by subject for better visualization
  const subjectGroups = data.reduce(
    (acc, activity) => {
      if (!acc[activity.subject]) {
        acc[activity.subject] = [];
      }
      acc[activity.subject].push(activity);
      return acc;
    },
    {} as Record<string, PopularActivity[]>,
  );

  const maxPlayCount = Math.max(...data.map((a) => a.playCount), 1);

  return (
    <div className="space-y-4">
      {Object.entries(subjectGroups).map(([subject, activities]) => (
        <div key={subject} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{subject}</h4>
          <div className="grid grid-cols-1 gap-2">
            {activities.map((activity, index) => {
              const intensity = activity.playCount / maxPlayCount;
              const opacity = Math.max(0.3, intensity);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg border"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${opacity * 0.1})`,
                    borderColor: `rgba(59, 130, 246, ${opacity * 0.3})`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">
                      {activity.activityName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {activity.playCount} estudiantes
                    </span>
                    <div className="text-xs text-gray-400">
                      {activity.averageScore}% avg
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
