import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

export function KpiModule({ data, period }) {
  const kpiDictionary = data?.kpiDictionary || [];
  const kpiEvaluations = data?.kpiEvaluations || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-brand-navy" />
          <h2 className="font-bold text-slate-900 text-base">
            Từ Điển Chỉ Số KPI Nghiệp Vụ & Đánh Giá Kỳ {period}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Quy chuẩn đánh giá hiệu quả công việc gắn liền với chi trả lương Tầng 2 theo năng suất lao động.
        </p>
      </div>

      {/* Grid Từ Điển KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiDictionary.map((kpi) => (
          <div key={kpi.maKpi} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-brand-navy">
                {kpi.maKpi}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Trọng số: {(kpi.trongSo * 100).toFixed(0)}%
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{kpi.tenKpi}</h3>
            <div className="text-xs text-slate-500">Khối áp dụng: <strong className="text-slate-700">{kpi.khoi}</strong> • ĐVT: {kpi.donViTinh}</div>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
              {kpi.tieuChuan}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
