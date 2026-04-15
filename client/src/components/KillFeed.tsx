import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { Crosshair } from 'lucide-react';

interface KillEntry {
  killer: string;
  victim: string;
  weapon: string;
  timestamp: string;
  map?: string;
}

const KillFeed: React.FC = () => {
  const [kills, setKills] = useState<KillEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logs/kill')
      .then((res) => res.json())
      .then((data) => setKills(Array.isArray(data) ? data.slice(0, 20) : []))
      .catch(() => setKills([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin className="flex justify-center py-4" />;

  return (
    <div className="panel-shell rounded-[28px] border px-6 py-7 sm:px-8">
      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-400">
        <Crosshair />
        <span>最近战斗</span>
      </div>
      <div className="mt-4 space-y-2">
        {kills.length === 0 ? (
          <p className="text-slate-400 text-sm">暂无最近战斗记录</p>
        ) : (
          kills.map((kill, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-white/6 bg-black/20 px-4 py-2 text-sm"
            >
              <span className="text-amber-300 font-medium">{kill.killer}</span>
              <span className="text-slate-500">[{kill.weapon}]</span>
              <span className="text-slate-300">{kill.victim}</span>
              <span className="ml-auto text-xs text-slate-500">{kill.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KillFeed;
