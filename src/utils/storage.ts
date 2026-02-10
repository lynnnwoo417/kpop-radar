const FAVORITES_KEY = 'my_favorites';
const RECORDS_KEY = 'my_records';
const HISTORY_KEY = 'my_history';

import { ScheduleItem } from '../types';

export function makeKey(item: ScheduleItem): string {
  return `${item.detailUrl || ''}|${item.dateKey || ''}|${item.type || ''}|${item.artist || ''}|${item.detail || ''}`;
}

export function getFavorites(): ScheduleItem[] {
  try {
    const v = localStorage.getItem(FAVORITES_KEY);
    if (!v) return [];
    const arr = JSON.parse(v);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setFavorites(items: ScheduleItem[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  } catch {}
}

export function getRecords(): any[] {
  try {
    const v = localStorage.getItem(RECORDS_KEY);
    if (!v) return [];
    const arr = JSON.parse(v);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setRecords(records: any[]): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {}
}

export function getHistory(): ScheduleItem[] {
  try {
    const v = localStorage.getItem(HISTORY_KEY);
    if (!v) return [];
    const arr = JSON.parse(v);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: ScheduleItem): void {
  try {
    const list = getHistory();
    const key = makeKey(item);
    const next = [item];
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      if (makeKey(it) === key) continue;
      next.push(it);
      if (next.length >= 120) break;
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {}
}

export function toggleFavorite(item: ScheduleItem): boolean {
  const arr = getFavorites();
  const key = makeKey(item);
  const exists = arr.some((it) => makeKey(it) === key);
  
  if (exists) {
    const next = arr.filter((it) => makeKey(it) !== key);
    setFavorites(next);
    return false;
  } else {
    const next = [item].concat(arr);
    if (next.length > 200) {
      setFavorites(next.slice(0, 200));
    } else {
      setFavorites(next);
    }
    return true;
  }
}

export function addRecord(item: ScheduleItem, note: string): void {
  const records = getRecords();
  const key = makeKey(item);
  const now = new Date();
  const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const record = {
    ...item,
    note,
    recordedAt: time
  };

  let next: any[] = [];
  let updated = false;
  for (let i = 0; i < records.length; i++) {
    const it = records[i];
    if (makeKey(it) === key) {
      next.push(record);
      updated = true;
    } else {
      next.push(it);
    }
  }
  if (!updated) next.unshift(record);
  if (next.length > 300) next = next.slice(0, 300);
  setRecords(next);
}

export function getRecordNote(item: ScheduleItem): string {
  const records = getRecords();
  const key = makeKey(item);
  for (let i = 0; i < records.length; i++) {
    const it = records[i];
    if (makeKey(it) === key) {
      return it.note || '';
    }
  }
  return '';
}
