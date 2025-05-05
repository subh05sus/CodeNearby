import React, { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { subYears, format, parseISO } from 'date-fns';
import { Post } from '@/types';

// Define shape of incoming activity data
interface ActivityData {
  posts: Post[];
  themeColor: 'default' | 'blue' | 'green' | 'purple' | 'orange';
}

// Define tooltip data attributes type
type TooltipDataAttrs = {
  [key: string]: string | number | boolean | undefined;
};

// Define heatmap cell data structure
interface HeatmapValue {
  date: string;
  count: number;
  details?: {
    posts: number;
  };
}

// Props type for the ActivityHeatmap component
interface ActivityHeatmapProps {
  data: ActivityData;
}

// Tailwind-safe color classes mapped by themeColor
const colorClassMap: Record<
  ActivityData['themeColor'],
  string[]
> = {
  default: ['fill-gray-200', 'fill-gray-400', 'fill-gray-600', 'fill-gray-800'],
  blue: ['fill-blue-200', 'fill-blue-400', 'fill-blue-600', 'fill-blue-800'],
  green: ['fill-green-200', 'fill-green-400', 'fill-green-600', 'fill-green-800'],
  purple: ['fill-purple-200', 'fill-purple-400', 'fill-purple-600', 'fill-purple-800'],
  orange: ['fill-orange-200', 'fill-orange-400', 'fill-orange-600', 'fill-orange-800'],
};

// Activity heatmap main component
export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Set start and end date for heatmap
  const endDate = new Date();
  const startDate = subYears(endDate, 1);

  // Generate activity data from posts
  const activityData = useMemo(() => {
    const activities = new Map<string, { posts: number }>();

    data.posts.forEach(post => {
      const date = format(parseISO(post.createdAt), 'yyyy-MM-dd');
      if (!activities.has(date)) {
        activities.set(date, { posts: 0 });
      }
      const current = activities.get(date)!;
      activities.set(date, { ...current, posts: current.posts + 1 });
    });

    return Array.from(activities.entries()).map(([date, counts]) => ({
      date,
      count: counts.posts,
      details: counts,
    }));
  }, [data]);

  // Get maximum post count for intensity calculation
  const maxCount = Math.max(1, ...activityData.map(d => d.count));

  // Get Tailwind fill class based on intensity
  const getClassForValue = (value: HeatmapValue) => {
    if (!value || value.count === 0) return 'fill-gray-200';
    const intensity = Math.min(Math.ceil((value.count / maxCount) * 4), 4);
    return colorClassMap[data.themeColor][intensity - 1];
  };

  // Render heatmap with tooltips
  return (
    <div className="w-full py-6">
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={activityData}
        classForValue={(value: any) => getClassForValue(value)}
        gutterSize={3}
        tooltipDataAttrs={(value): TooltipDataAttrs => {
          const val = value as HeatmapValue;
          if (!val?.date) {
            return {
              'data-tooltip-id': 'activity-tooltip',
              'data-tooltip-content': 'No activity',
            };
          }

          return {
            'data-tooltip-id': 'activity-tooltip',
            'data-tooltip-content': `${format(parseISO(val.date), 'MMM d, yyyy')}: ${val.count} post${val.count > 1 ? 's' : ''}`,
          };
        }}
      />
      <Tooltip id="activity-tooltip" place="top" />
    </div>
  );
}
