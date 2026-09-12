import React from 'react';

export function StatCard({ title, value, subtext, icon: Icon, color = 'navy' }) {
  const colorMap = {
    navy: 'bg-brand-navy/10 text-brand-navy border-brand-navy/20',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 tracking-wide">{title}</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{value}</div>
          {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.navy}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
