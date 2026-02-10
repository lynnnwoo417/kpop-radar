export interface ScheduleItem {
  id: number;
  artist: string;
  type: string;   // 回归 | 演唱会 | 签售 | 活动
  date: string;
  dateKey: string;
  detail: string;
  ticketPlatform?: string;  // 购票平台：NOL / Melon / YES24 等
  ticketTime?: string;      // 场馆
  showTime?: string;        // 开场时间
  detailUrl?: string;       // 详情/购票链接
  locationText?: string;    // 活动地点/区域（活动 tab 用）
  coverImage?: string;      // 活动/票务封面（可选）
  _isFavorite?: boolean;    // 本地收藏标记（仅前端）
  _isRecorded?: boolean;    // 本地记录标记（仅前端）
}

export interface SearchResult extends ScheduleItem {
  _matchField?: 'artist' | 'detail';
  _matchIndex?: number;
  _displayDetail?: string;
  _score?: string;
}

export interface CalendarDay {
  day: number;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvent: boolean;
}
