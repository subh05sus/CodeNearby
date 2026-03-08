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

// Swiss Red Intensity Colors
const swissIntensityClasses = [
  'fill-muted border-black/5',
  'fill-swiss-red/20',
  'fill-swiss-red/40',
  'fill-swiss-red/70',
  'fill-swiss-red'
];

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
    if (!value || value.count === 0) return 'fill-[#EEEEEE]';

    const intensity = Math.min(Math.ceil((value.count / maxCount) * 4), 4);
    return swissIntensityClasses[intensity];
  };

  // Render heatmap with tooltips
  return (
    <div className="w-full py-12 px-8 border-4 border-black bg-white swiss-noise">
      <div className="mb-8 border-b-2 border-black pb-4 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-swiss-red mb-1">System Audit</p>
          <h3 className="text-3xl font-black uppercase ">Activity Heatmap</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Sync Status</p>
          <p className="text-xs font-black uppercase ">LIVE / ENCRYPTED</p>
        </div>
      </div>
      <div className="swiss-heatmap-container">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={activityData}
          classForValue={(value: any) => getClassForValue(value)}
          gutterSize={4}
          tooltipDataAttrs={(value): TooltipDataAttrs => {
            const val = value as HeatmapValue;
            if (!val?.date) {
              return {
                'data-tooltip-id': 'activity-tooltip',
                'data-tooltip-content': 'NO ACTIVITY',
              };
            }

            return {
              'data-tooltip-id': 'activity-tooltip',
              'data-tooltip-content': `${format(parseISO(val.date), 'MMM d, yyyy')}: ${val.count} CONTRIBUTION${val.count > 1 ? 'S' : ''}`,
            };
          }}
        />
      </div>
      <Tooltip
        id="activity-tooltip"
        place="top"
        className="!rounded-none !bg-black !text-white !font-black !uppercase ! !text-[10px] !p-2 !opacity-100"
      />
    </div>
  );
}
