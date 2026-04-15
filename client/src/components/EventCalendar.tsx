import React, { useEffect, useState } from 'react';
import { Tag, Spin } from 'antd';
import { Calendar, Clock, Users, Gamepad2, Zap } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  description: string;
  status: string;
  maxPlayers?: number;
  signedUp?: number;
}

const typeConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  training: {
    label: '训练',
    color: 'blue',
    icon: <Gamepad2 className="w-4 h-4" />,
  },
  night_battle: {
    label: '夜战',
    color: 'purple',
    icon: <Zap className="w-4 h-4" />,
  },
  clan_match: {
    label: '内战',
    color: 'red',
    icon: <Users className="w-4 h-4" />,
  },
  community: {
    label: '社区活动',
    color: 'green',
    icon: <Calendar className="w-4 h-4" />,
  },
};

const EventCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/operation/calendar')
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin className="flex justify-center py-8" />;

  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.date + 'T' + a.time).getTime() -
      new Date(b.date + 'T' + b.time).getTime()
  );

  return (
    <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
        <Calendar />
        <span>活动日历</span>
      </div>
      <div className="mt-4 text-2xl font-bold text-white">近期活动安排</div>

      {sorted.length === 0 ? (
        <div className="mt-6 text-center py-8 text-slate-400">
          <p>暂无近期活动安排</p>
          <p className="mt-2 text-sm">请关注 QQ 群获取最新活动通知</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {sorted.map((event) => {
            const config = typeConfig[event.type] || typeConfig.community;
            return (
              <div
                key={event.id}
                className="rounded-2xl border border-amber-400/10 bg-black/20 px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Tag color={config.color}>{config.label}</Tag>
                    <span className="text-base font-semibold text-white">
                      {event.title}
                    </span>
                  </div>
                  <Tag
                    color={
                      event.status === 'ongoing'
                        ? 'green'
                        : event.status === 'completed'
                          ? 'default'
                          : 'orange'
                    }
                  >
                    {event.status === 'ongoing'
                      ? '进行中'
                      : event.status === 'completed'
                        ? '已结束'
                        : '即将开始'}
                  </Tag>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {event.time}
                  </span>
                  {event.signedUp !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {event.signedUp}/{event.maxPlayers || '?'}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="mt-2 text-sm text-slate-300">{event.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
