'use client';

import { HeatmapData } from '@/services/analytics/types';

interface ActivityHeatmapProps {
  data: HeatmapData[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create a matrix for the heatmap
  const heatmapMatrix = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0),
  );

  // Fill the matrix with data
  data.forEach((item) => {
    if (item.day >= 0 && item.day < 7 && item.hour >= 0 && item.hour < 24) {
      heatmapMatrix[item.day][item.hour] = item.activityCount;
    }
  });

  // Find max value for normalization
  const maxValue = Math.max(...data.map((d) => d.activityCount), 1);

  return (
    <div className="w-full">
      <div className="grid grid-cols-25 gap-1">
        {/* Empty cell for alignment */}
        <div className="w-8 h-6"></div>

        {/* Hour labels */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="w-6 h-6 text-xs text-gray-500 flex items-center justify-center"
          >
            {hour}
          </div>
        ))}

        {/* Day rows */}
        {days.map((day, dayIndex) => (
          <div key={day} className="contents">
            {/* Day label */}
            <div className="w-8 h-6 text-xs text-gray-500 flex items-center justify-center">
              {day}
            </div>

            {/* Hour cells for this day */}
            {hours.map((hour) => {
              const value = heatmapMatrix[dayIndex][hour];
              const intensity = value / maxValue;
              const opacity = Math.max(0.1, intensity);

              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  className="w-6 h-6 rounded-sm border border-gray-200"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                  }}
                  title={`${day} ${hour}:00 - ${value} actividades`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <span>Menos</span>
        <div className="flex gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-sm border border-gray-200"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${intensity})`,
              }}
            />
          ))}
        </div>
        <span>Más</span>
      </div>
    </div>
  );
}
