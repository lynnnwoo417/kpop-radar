import { ScheduleItem } from '../types';
import { SCHEDULE_API_BASE } from './config';

export async function fetchSchedules(): Promise<ScheduleItem[]> {
  if (SCHEDULE_API_BASE) {
    try {
      const response = await fetch(SCHEDULE_API_BASE.replace(/\/$/, '') + '/api/schedules');
      if (response.ok) {
        const data = await response.json();
        const schedules = data?.schedules;
        if (Array.isArray(schedules) && schedules.length > 0) {
          return schedules.map((item: any, i: number) => ({
            id: typeof item.id === 'number' ? item.id : i + 1,
            artist: item.artist || '未知',
            type: item.type || '回归',
            date: item.date || (item.dateKey ? item.dateKey.slice(5) : '') || '',
            dateKey: item.dateKey || '',
            detail: item.detail || '回归',
            ticketPlatform: item.ticketPlatform,
            ticketTime: item.ticketTime,
            showTime: item.showTime,
            detailUrl: item.detailUrl,
            locationText: item.locationText,
            coverImage: item.coverImage
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  }
  
  // Fallback to empty array (you can load from local data files if needed)
  return [];
}
