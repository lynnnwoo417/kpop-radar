import { ScheduleItem, SearchResult } from '../types';

export function applySearch(query: string, schedules: ScheduleItem[]): SearchResult[] {
  const q = (query || '').trim();
  if (!q) return [];

  const qn = q.toLowerCase();
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const isAsciiQuery = /^[a-z0-9\s._-]+$/i.test(q);
  const normalizeAscii = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const wordBoundaryIndex = (textLower: string, needleLower: string) => {
    if (!needleLower) return -1;
    if (!isAsciiQuery) return textLower.indexOf(needleLower);
    const re = new RegExp(`(^|[^a-z0-9])(${escapeRegExp(needleLower)})([^a-z0-9]|$)`, 'i');
    const m = re.exec(textLower);
    if (!m) return -1;
    const lead = m[1] ? m[1].length : 0;
    return m.index + lead;
  };

  const makeSnippet = (text: string, idx: number) => {
    const raw = text || '';
    if (idx <= 0) return raw;
    const start = idx;
    const end = Math.min(raw.length, start + 48);
    const slice = raw.slice(start, end).trim();
    return slice ? (slice + (end < raw.length ? '…' : '')) : raw;
  };

  for (let i = 0; i < schedules.length; i++) {
    const s = schedules[i];
    if (s && s.type === '活动') continue;
    const artistRaw = s.artist || '';
    const detailRaw = s.detail || '';
    const artist = artistRaw.toLowerCase();
    const detail = detailRaw.toLowerCase();
    const artistIdx = wordBoundaryIndex(artist, qn);
    const detailIdx = wordBoundaryIndex(detail, qn);

    let field: 'artist' | 'detail' | '' = '';
    let idx = -1;
    if (artistIdx >= 0) {
      field = 'artist';
      idx = artistIdx;
    } else if (detailIdx >= 0) {
      field = 'detail';
      idx = detailIdx;
    }
    if (!field) continue;

    const key = `${s.detailUrl || ''}|${s.dateKey || ''}|${s.type || ''}|${s.artist || ''}|${s.detail || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const fieldTextRaw = field === 'artist' ? artistRaw : detailRaw;
    const fieldTextLower = field === 'artist' ? artist : detail;
    const exactHit =
      (fieldTextLower.trim() === qn) ||
      (isAsciiQuery && normalizeAscii(fieldTextRaw) === normalizeAscii(q));
    const prefixHit = fieldTextLower.trim().indexOf(qn) === 0;
    const fieldPri = field === 'artist' ? 0 : 1;
    const idxNorm = idx < 0 ? 9999 : idx;
    const exactPri = exactHit ? 0 : 1;
    const wordPri = idx >= 0 ? 0 : 1;
    const prefixPri = prefixHit ? 0 : 1;
    const score = `${exactPri}|${wordPri}|${prefixPri}|${String(fieldPri)}|${String(idxNorm).padStart(4, '0')}`;

    results.push({
      ...s,
      _matchField: field,
      _matchIndex: idx,
      _displayDetail: field === 'detail' ? makeSnippet(detailRaw, idx) : detailRaw,
      _score: score
    });
  }

  results.sort((a, b) => {
    const sa = a._score || '';
    const sb = b._score || '';
    if (sa !== sb) return sa < sb ? -1 : 1;
    const da = a.dateKey || '';
    const db = b.dateKey || '';
    if (da !== db) return db.localeCompare(da);
    return (a.artist || '').localeCompare(b.artist || '');
  });

  return results.slice(0, 20);
}
