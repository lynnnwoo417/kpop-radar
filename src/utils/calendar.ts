import { ScheduleItem, CalendarDay } from '../types';

export function buildCalendar(
  year: number,
  month: number,
  schedules: ScheduleItem[],
  filterType: string
): CalendarDay[] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const firstWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const list = (() => {
    if (filterType === '全部') return schedules.filter(s => s.type !== '活动');
    if (filterType === '签售') return schedules.filter(s => s.type === '签售' && s.ticketPlatform === 'Ktown4u');
    return schedules.filter(s => s.type === filterType);
  })();
  const eventKeys = new Set(list.map((s: ScheduleItem) => s.dateKey));

  const days: CalendarDay[] = [];

  // 上月末尾几天
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevLast = new Date(prevYear, prevMonth, 0);
  const prevDaysCount = prevLast.getDate();
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = prevDaysCount - i;
    const dateKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      day: d,
      dateKey,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      hasEvent: eventKeys.has(dateKey)
    });
  }

  // 本月
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      day: d,
      dateKey,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      hasEvent: eventKeys.has(dateKey)
    });
  }

  // 下月开头，凑满 6 行
  const total = days.length;
  const rest = total % 7 === 0 ? 0 : 7 - (total % 7);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  for (let d = 1; d <= rest; d++) {
    const dateKey = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      day: d,
      dateKey,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      hasEvent: eventKeys.has(dateKey)
    });
  }

  return days;
}

export function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}
