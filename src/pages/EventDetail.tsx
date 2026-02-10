import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScheduleItem } from '../types';
import { toggleFavorite, addToHistory, makeKey, getFavorites } from '../utils/storage';
import './EventDetail.css';

export default function EventDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState<ScheduleItem | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [posterExpand, setPosterExpand] = useState(false);

  useEffect(() => {
    const stateItem = location.state?.item as ScheduleItem | undefined;
    if (stateItem) {
      setItem(stateItem);
      addToHistory(stateItem);
      const favorites = getFavorites();
      setIsFavorite(favorites.some(f => makeKey(f) === makeKey(stateItem)));
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  if (!item) return null;

  const handleToggleFavorite = () => {
    const newFavorite = toggleFavorite(item);
    setIsFavorite(newFavorite);
    alert(newFavorite ? '已加入收藏' : '已取消收藏');
  };

  const handleOpenLink = () => {
    if (!item.detailUrl) {
      alert('暂无链接');
      return;
    }
    navigator.clipboard.writeText(item.detailUrl).then(() => {
      alert('链接已复制');
    });
  };

  const handleSavePoster = async () => {
    if (!item.coverImage) {
      alert('暂无海报');
      return;
    }
    try {
      const response = await fetch(item.coverImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.artist}-${item.dateKey}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      alert('已保存');
    } catch (error) {
      alert('保存失败');
    }
  };

  return (
    <div className="page-detail">
      {item.coverImage && (
        <>
          <div className="poster-wrap" onClick={() => setPosterExpand(true)}>
            <img className="poster-img" src={item.coverImage} alt={item.artist} />
            <div className="poster-zoom-btn">放大</div>
          </div>
          {posterExpand && (
            <div className="poster-fullscreen" onClick={() => setPosterExpand(false)}>
              <img
                className="poster-full-img"
                src={item.coverImage}
                alt={item.artist}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="poster-full-actions" onClick={(e) => e.stopPropagation()}>
                <button className="poster-save-btn" onClick={handleSavePoster}>保存到相册</button>
                <div className="poster-close-hint">点击空白处关闭</div>
              </div>
            </div>
          )}
        </>
      )}
      <div className="card">
        <div className="row">
          <span className="label">{item.type === '活动' ? '标题' : '艺人'}</span>
          <span className="value">{item.artist}</span>
        </div>
        <div className="row">
          <span className="label">类型</span>
          <span className={`value type-tag ${item.type === '回归' ? 'type-regression' : item.type === '演唱会' ? 'type-concert' : item.type === '签售' ? 'type-fansign' : 'type-activity'}`}>
            {item.type}
          </span>
        </div>
        <div className="row">
          <span className="label">日期</span>
          <span className="value">{item.dateKey || item.date}</span>
        </div>
        <div className="row">
          <span className="label">详情</span>
          <span className="value detail-text">{item.detail}</span>
        </div>
        {(item.type === '演唱会' || item.type === '签售') && (
          <>
            <div className="row">
              <span className="label">购票平台</span>
              <span className="value">{item.ticketPlatform || '暂无'}</span>
            </div>
            <div className="row">
              <span className="label">场馆</span>
              <span className="value">{item.ticketTime || '暂无'}</span>
            </div>
          </>
        )}
        {item.type === '活动' && (
          <div className="row">
            <span className="label">地点</span>
            <span className="value">{item.locationText || '暂无'}</span>
          </div>
        )}
        {item.type === '回归' && item.showTime && (
          <div className="row">
            <span className="label">发布时间</span>
            <span className="value">{item.showTime}</span>
          </div>
        )}
      </div>
      {item.detailUrl && (
        <button className="btn" onClick={handleOpenLink}>
          {item.type === '签售' ? '复制购买链接' : (item.type === '演唱会' || item.type === '活动' ? '复制购票链接' : '复制详情链接')}
        </button>
      )}
      <button className="btn ghost" onClick={handleToggleFavorite}>
        {isFavorite ? '取消收藏' : '加入收藏'}
      </button>
    </div>
  );
}
