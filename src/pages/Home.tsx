import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScheduleItem, SearchResult } from '../types';
import { fetchSchedules } from '../utils/api';
import { buildCalendar, getTodayKey } from '../utils/calendar';
import { applySearch } from '../utils/search';
import { getFavorites, getRecords, toggleFavorite, addRecord, makeKey } from '../utils/storage';
import './Home.css';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const FILTER_TABS = [
  { key: '全部', label: '全部' },
  { key: '回归', label: '回归' },
  { key: '演唱会', label: '演唱会' },
  { key: '签售', label: '签售' },
  { key: '活动', label: '活动' }
];

export default function Home() {
  const navigate = useNavigate();
  const now = new Date();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filterType, setFilterType] = useState('全部');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey());
  const [selectedDaySchedules, setSelectedDaySchedules] = useState<ScheduleItem[]>([]);
  const [calendarDays, setCalendarDays] = useState<ReturnType<typeof buildCalendar>>([]);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadSchedules = useCallback(async () => {
    const data = await fetchSchedules();
    if (data.length === 0) {
      // Fallback: 添加示例数据
      const y = 2026;
      const fallback: ScheduleItem[] = [
        { id: 1, artist: 'IVE', type: '回归', date: '02-15', dateKey: `${y}-02-15`, detail: '新专辑回归' },
        { id: 2, artist: 'G-DRAGON', type: '演唱会', date: '02-06', dateKey: `${y}-02-06`, detail: 'FAM MEETING 2026 · Seoul' },
        { id: 3, artist: 'LNGSHOT', type: '签售', date: '02-09', dateKey: `${y}-02-09`, detail: 'Fansign Event · London' },
        { id: 4, artist: 'BTS THE COMEBACK LIVE 购票指南', type: '活动', date: '02-09', dateKey: `${y}-02-09`, detail: '娱乐 · 光化门', locationText: '娱乐 · 光化门', detailUrl: 'https://world.nol.com/zh-CN/regions/b263b346-9a60-49d5-949a-dc88dfbea53e/festas' }
      ];
      setSchedules(fallback);
    } else {
      setSchedules(data);
    }
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const updateCalendar = useCallback(() => {
    const days = buildCalendar(year, month, schedules, filterType);
    setCalendarDays(days);
    if (!selectedDateKey || !days.some(d => d.dateKey === selectedDateKey)) {
      setSelectedDateKey(getTodayKey());
    }
  }, [year, month, schedules, filterType, selectedDateKey]);

  useEffect(() => {
    updateCalendar();
  }, [updateCalendar]);

  const updateSelectedDaySchedules = useCallback(() => {
    let list = schedules.filter(s => s.dateKey === selectedDateKey);
    if (filterType === '全部') {
      list = list.filter(s => s.type !== '活动');
    } else if (filterType === '签售') {
      list = list.filter(s => s.type === '签售' && s.ticketPlatform === 'Ktown4u');
    } else {
      list = list.filter(s => s.type === filterType);
    }
    
    const favSet = new Set(getFavorites().map(f => makeKey(f)));
    const recSet = new Set(getRecords().map(r => makeKey(r)));
    
    const next = list.map(s => ({
      ...s,
      _isFavorite: favSet.has(makeKey(s)),
      _isRecorded: recSet.has(makeKey(s))
    }));
    
    setSelectedDaySchedules(next);
  }, [schedules, selectedDateKey, filterType]);

  useEffect(() => {
    updateSelectedDaySchedules();
  }, [updateSelectedDaySchedules]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    searchTimerRef.current = setTimeout(() => {
      const q = value.trim();
      if (q) {
        const results = applySearch(q, schedules);
        setSearchResults(results);
        setSearchOpen(true);
      } else {
        setSearchOpen(false);
        setSearchResults([]);
      }
    }, 150);
  };

  const handleSearchFocus = () => {
    const q = searchText.trim();
    if (q) {
      const results = applySearch(q, schedules);
      setSearchResults(results);
      setSearchOpen(true);
    } else {
      setSearchOpen(false);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => setSearchOpen(false), 250);
  };

  const handleSearchClear = () => {
    setSearchText('');
    setSearchOpen(false);
    setSearchResults([]);
  };

  const handleSearchResultClick = (item: SearchResult) => {
    setSearchOpen(false);
    const dateKey = item.dateKey || '';
    setFilterType(item.type || '全部');
    setSelectedDateKey(dateKey || selectedDateKey);
    updateCalendar();
    
    navigate(`/event/${item.id}`, { state: { item } });
  };

  const handleFilterTap = (key: string) => {
    setFilterType(key);
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayClick = (dateKey: string) => {
    setSelectedDateKey(dateKey);
  };

  const handleScheduleItemClick = (item: ScheduleItem) => {
    navigate(`/event/${item.id}`, { state: { item } });
  };

  const handleToggleFavorite = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const item = selectedDaySchedules[index];
    if (!item) return;
    
    const isFavorite = toggleFavorite(item);
    alert(isFavorite ? '已加入收藏' : '已取消收藏');
    updateSelectedDaySchedules();
  };

  const handleRecordTap = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const item = selectedDaySchedules[index];
    if (!item) return;
    
    const note = prompt('记录当时心情\n写下追回归的repo…', '');
    if (note !== null) {
      addRecord(item, note.trim());
      alert('已记录');
      updateSelectedDaySchedules();
    }
  };

  const monthLabel = `${year}年${month}月`;

  return (
    <div className="page">
      <div className="header">
        <div className="title">回归预告机</div>
        <div className="slogan">打歌预录 · 演唱会 · 签售 · 活动</div>
      </div>

      <div className="search-wrap">
        <div className="search-bar">
          <input
            className="search-input"
            placeholder="搜索团名/标题"
            value={searchText}
            onChange={handleSearchInput}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {searchText && (
            <div className="search-clear" onClick={handleSearchClear}>×</div>
          )}
        </div>

        {searchOpen && (
          <div className="search-panel">
            {searchText && searchResults.length === 0 && (
              <div className="search-empty">
                <span>无匹配结果</span>
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((item, index) => (
                  <div
                    key={index}
                    className="search-item"
                    onClick={() => handleSearchResultClick(item)}
                  >
                    <div className="search-top">
                      <span className="search-artist">{item.artist}</span>
                      <span className="search-date">{item.dateKey}</span>
                    </div>
                    <div className="search-bottom">
                      <span className={`type-tag ${item.type === '回归' ? 'type-regression' : item.type === '演唱会' ? 'type-concert' : item.type === '签售' ? 'type-fansign' : 'type-activity'}`}>
                        {item.type}
                      </span>
                      <span className="search-detail">{item._displayDetail || item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="filter-tabs">
        {FILTER_TABS.map(tab => (
          <div
            key={tab.key}
            className={`tab ${filterType === tab.key ? 'active' : ''}`}
            onClick={() => handleFilterTap(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="calendar-wrap">
        <div className="month-bar">
          <div className="arrow" onClick={prevMonth}>‹</div>
          <span className="month-label">{monthLabel}</span>
          <div className="arrow" onClick={nextMonth}>›</div>
        </div>

        <div className="weekdays">
          {WEEKDAYS.map(day => (
            <span key={day} className="weekday">{day}</span>
          ))}
        </div>

        <div className="days-grid">
          {calendarDays.map(day => (
            <div
              key={day.dateKey}
              className={`day-cell ${day.isCurrentMonth ? '' : 'other-month'} ${day.dateKey === selectedDateKey ? 'selected' : ''} ${day.isToday ? 'today' : ''}`}
              onClick={() => handleDayClick(day.dateKey)}
            >
              <span className="day-num">{day.day}</span>
              {day.hasEvent && <div className="dot"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-title">当日日程 · {selectedDateKey}</div>
        {selectedDaySchedules.length > 0 ? (
          <div className="schedule-list">
            {selectedDaySchedules.map((item, index) => (
              <div
                key={item.id}
                className="schedule-item clickable"
                onClick={() => handleScheduleItemClick(item)}
              >
                <div className="item-top">
                  <span className="artist">{item.artist}</span>
                </div>
                <div className="type-row">
                  <span className={`type-tag ${item.type === '回归' ? 'type-regression' : item.type === '演唱会' ? 'type-concert' : item.type === '签售' ? 'type-fansign' : 'type-activity'}`}>
                    {item.type}
                  </span>
                  <div className="item-actions">
                    <span
                      className={`record-btn ${item._isRecorded ? 'active' : ''}`}
                      onClick={(e) => handleRecordTap(e, index)}
                    >
                      记录
                    </span>
                    <span
                      className={`fav-star ${item._isFavorite ? 'active' : ''}`}
                      onClick={(e) => handleToggleFavorite(e, index)}
                    >
                      ★
                    </span>
                  </div>
                </div>
                <div className="detail">{item.detail}</div>
                {(item.type === '演唱会' || item.type === '签售') && (item.ticketPlatform || item.ticketTime) && (
                  <div className="extra-row">
                    {item.ticketPlatform && <span className="extra">购票 {item.ticketPlatform}</span>}
                    {item.ticketTime && <span className="extra">场馆 {item.ticketTime}</span>}
                  </div>
                )}
                {item.type === '活动' && item.locationText && (
                  <div className="extra-row">
                    <span className="extra">地点 {item.locationText}</span>
                  </div>
                )}
                {item.type === '回归' && item.showTime && (
                  <div className="extra-row">
                    <span className="extra">发布时间 {item.showTime}</span>
                  </div>
                )}
                <div className="detail-link">点击查看详情</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-tip">
            <span>该日暂无{filterType === '全部' ? '' : filterType}日程</span>
          </div>
        )}
      </div>
    </div>
  );
}
