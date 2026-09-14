import React, { useState, useMemo, useCallback } from 'react';
import {
  Calculator, TableProperties, UserCheck, ShieldCheck,
  Search, Eye, Printer, Lock, CheckCircle, RefreshCw,
  Download, ChevronDown, ChevronRight, Info, FileText
} from 'lucide-react';
import { formatVnd } from '../../utils/currency';
import { calculatePayrollList, summarizePayroll } from '../../utils/payrollEngine';
import { Modal } from '../../components/common/Modal';
import { APP_CONFIG } from '../../constants/config';

const SUB_TABS = [
  { id: 'calculate',    label: 'Tính Lương Tháng',    icon: Calculator },
  { id: 'detail_table', label: 'Bảng Lương Chi Tiết', icon: TableProperties },
  { id: 'pay_slip',     label: 'Phiếu Lương Của Tôi', icon: UserCheck },
  { id: 'lock',         label: 'Khóa Sổ & Lịch Sử',  icon: ShieldCheck },
];

/** Phiếu lương cá nhân (in được) */
function PaySlipView({ row, period, luongCoSo }) {
  if (!row) return <div className="text-slate-400 text-sm text-center py-12">Chọn cán bộ để xem phiếu lương.</div>;
  const fmt = (v) => formatVnd(v || 0);
  return (
    <div id="pay-slip-print" className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl mx-auto text-xs font-['Be_Vietnam_Pro'] print:shadow-none">
      {/* Header */}
      <div className="text-center mb-4 border-b border-slate-200 pb-4">
        <div className="font-bold text-base text-brand-navy">{APP_CONFIG.TITLE}</div>
        <div className="text-slate-500">{APP_CONFIG.ADDRESS}</div>
        <div className="font-bold text-sm mt-2">PHIẾU LƯƠNG THÁNG {period || '──'}</div>
      </div>
      {/* Thông tin cán bộ */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-4 text-[11px]">
        <div><span className="text-slate-500">Họ tên:</span> <strong>{row.hoTen}</strong></div>
        <div><span className="text-slate-500">Mã NV:</span> {row.maNV}</div>
        <div><span className="text-slate-500">Chức danh:</span> {row.chucDanh}</div>
        <div><span className="text-slate-500">Bộ phận:</span> {row.phongBan}</div>
        <div><span className="text-slate-500">Bậc lương:</span> {row.bac} — Hệ số {row.heSoBac?.toFixed(2)}</div>
        <div><span className="text-slate-500">Ngày công:</span> {row.congThuc}/{row.congChuan} ({Math.round((row.tyLeCong || 1) * 100)}%)</div>
      </div>

      {/* Bảng thu nhập */}
      <table className="w-full border-collapse text-[11px] mb-3">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-200 px-2 py-1 text-left font-semibold">Khoản thu nhập</th>
            <th className="border border-slate-200 px-2 py-1 text-right font-semibold tabular-nums">Số tiền (₫)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Lương ngạch bậc', row.luongNgachBac],
            row.thamNienCT > 0 ? [`Thâm niên công tác (${row.tyLeThamNienPct}%)`, row.thamNienCT] : null,
            row.vuotKhung > 0 ? [`Vượt khung (${row.soLanVuotKhung} lần × ${row.pctVuotKhung/row.soLanVuotKhung || 5}%)`, row.vuotKhung] : null,
            row.phuCapTN > 0 ? ['Phụ cấp trách nhiệm chức danh', row.phuCapTN] : null,
            row.antrua > 0 || row.anTrua > 0 ? ['Tiền ăn giữa ca', row.antrua || row.anTrua] : null,
            row.xangxe > 0 || row.xangXe > 0 ? ['Hỗ trợ xăng xe', row.xangxe || row.xangXe] : null,
            row.dienthoai > 0 || row.dienThoai > 0 ? ['Cước điện thoại', row.dienthoai || row.dienThoai] : null,
            row.trangphuc > 0 || row.trangPhuc > 0 ? ['Trang phục công tác', row.trangphuc || row.trangPhuc] : null,
            row.luongKpi > 0 ? [`Lương KPI (${row.kpiScore}% đạt)`, row.luongKpi] : null,
            row.tienThuong > 0 ? ['Tiền thưởng', row.tienThuong] : null,
            row.tienThuaBhxh > 0 ? ['Tiền thừa BHXH (hưởng thêm)', row.tienThuaBhxh] : null,
          ].filter(Boolean).map(([label, val], i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="border border-slate-200 px-2 py-1">{label}</td>
              <td className="border border-slate-200 px-2 py-1 text-right tabular-nums">{fmt(val)}</td>
            </tr>
          ))}
          <tr className="bg-brand-navy/5 font-bold">
            <td className="border border-slate-300 px-2 py-1.5 text-brand-navy">TỔNG THU NHẬP GROSS</td>
            <td className="border border-slate-300 px-2 py-1.5 text-right tabular-nums text-brand-navy">{fmt(row.tongGross)}</td>
          </tr>
        </tbody>
      </table>

      {/* Bảng khấu trừ */}
      <table className="w-full border-collapse text-[11px] mb-3">
        <thead>
          <tr className="bg-rose-50">
            <th className="border border-slate-200 px-2 py-1 text-left font-semibold">Khoản khấu trừ</th>
            <th className="border border-slate-200 px-2 py-1 text-right font-semibold">Số tiền (₫)</th>
          </tr>
        </thead>
        <tbody>
          {[
            [`BHXH người lao động 8% (căn cứ ${fmt(row.mucDongBhxhCaNhan)})`, row.bhxhNld],
            [`BHYT người lao động 1.5%`, row.bhytNld],
            [`BHTN người lao động 1%`, row.bhtnNld],
            [`Thuế TNCN (thu nhập tính thuế: ${fmt(row.thuNhapTinhThue)})`, row.thueTNCN],
          ].map(([label, val], i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="border border-slate-200 px-2 py-1">{label}</td>
              <td className="border border-slate-200 px-2 py-1 text-right tabular-nums text-rose-700">{fmt(val)}</td>
            </tr>
          ))}
          <tr className="bg-rose-50 font-bold">
            <td className="border border-slate-300 px-2 py-1.5 text-rose-700">TỔNG KHẤU TRỪ</td>
            <td className="border border-slate-300 px-2 py-1.5 text-right tabular-nums text-rose-700">{fmt((row.tongKhauTruBH || 0) + (row.thueTNCN || 0))}</td>
          </tr>
        </tbody>
      </table>

      {/* Net */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-sm text-emerald-800">THỰC LĨNH VỀ TÀI KHOẢN</span>
        <span className="font-bold text-lg tabular-nums text-emerald-800">{fmt(row.thucLinh)}</span>
      </div>

      {/* Giảm trừ note */}
      <div className="mt-2 text-[10px] text-slate-400">
        Giảm trừ gia cảnh: Bản thân {fmt(row.giamTruBanThan)} + {row.soNPT || 0} NPT × {fmt(row.giamTruNPT / Math.max(row.soNPT || 1, 1))} = {fmt(row.tongGiamTru)}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
        <span>Người nhận lương ký tên:</span>
        <span>Ngày in: {new Date().toLocaleDateString('vi-VN')}</span>
      </div>
    </div>
  );
}

/** Sub-tab: Tính Lương Tháng */
function CalculateTab({ data, period, scenario, setScenario, computedRows, isCalculating, onRecalculate, totals }) {
  const fmt = (v) => formatVnd(v || 0);
  const params = data?.salaryParams || data?.params || {};
  const luongCoSo = Number(params?.LUONG_CO_SO || params?.BASIC_SALARY) || 2_340_000;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Phương án:</span>
            {['PA1', 'PA2', 'PA3'].map(pa => (
              <button key={pa} onClick={() => setScenario(pa)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  scenario === pa ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}>
                {pa}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 border-l border-slate-200 pl-3">
            Lương cơ sở: <strong className="tabular-nums">{fmt(luongCoSo)}</strong>
          </div>
          <button onClick={onRecalculate} disabled={isCalculating}
            className="ml-auto flex items-center space-x-2 px-4 py-2 bg-brand-navy text-white rounded-lg text-xs font-bold hover:bg-brand-navy-dark transition-all">
            <Calculator className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
            <span>{isCalculating ? 'Đang tính...' : 'Tính Lương Tất Cả'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards tổng hợp */}
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Lương cố định', val: totals.tongLuongCoDinh, color: 'bg-blue-50 border-blue-200 text-blue-800' },
            { label: 'KPI + Thưởng', val: totals.tongKpi + totals.tongThuong, color: 'bg-amber-50 border-amber-200 text-amber-800' },
            { label: 'Tổng Gross', val: totals.tongGross, color: 'bg-slate-50 border-slate-200 text-slate-800' },
            { label: 'Tổng BHXH/BH', val: totals.tongKhauTruBH, color: 'bg-purple-50 border-purple-200 text-purple-800' },
            { label: 'Thuế TNCN', val: totals.tongThueTNCN, color: 'bg-rose-50 border-rose-200 text-rose-800' },
            { label: 'Thực lĩnh Net', val: totals.tongThucLinh, color: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
          ].map((c, i) => (
            <div key={i} className={`rounded-xl border p-3 ${c.color}`}>
              <div className="text-[10px] font-semibold mb-1 opacity-70">{c.label}</div>
              <div className="text-sm font-bold tabular-nums">{fmt(c.val)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bảng kết quả tổng quan */}
      {computedRows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Kết quả {computedRows.length} cán bộ — Kỳ {period} — {scenario}</span>
            <span className="text-xs text-slate-500">Chi phí Quỹ: <strong className="tabular-nums text-rose-700">{fmt(totals?.tongChiPhiQuy)}</strong></span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Họ tên', 'Chức danh', 'Bậc/Hệ số', 'Lương cố định', 'KPI', 'Gross', 'BHXH NLĐ', 'TNCN', 'Thực lĩnh'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {computedRows.map((row, i) => (
                  <tr key={row.maNV} className={`border-b border-slate-100 hover:bg-brand-lime/5 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                    <td className="px-3 py-2 font-semibold text-slate-800 whitespace-nowrap">{row.hoTen}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.chucDanh}</td>
                    <td className="px-3 py-2 tabular-nums">{row.bac} / {row.heSoBac?.toFixed(2)}</td>
                    <td className="px-3 py-2 tabular-nums text-right">{fmt(row.luongCoDinh)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-amber-700">{fmt(row.luongKpi)}</td>
                    <td className="px-3 py-2 tabular-nums text-right font-semibold">{fmt(row.tongGross)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-purple-700">{fmt(row.tongKhauTruBH)}</td>
                    <td className="px-3 py-2 tabular-nums text-right text-rose-700">{fmt(row.thueTNCN)}</td>
                    <td className="px-3 py-2 tabular-nums text-right font-bold text-emerald-700">{fmt(row.thucLinh)}</td>
                  </tr>
                ))}
                {/* Footer */}
                <tr className="bg-brand-navy text-white font-bold">
                  <td className="px-3 py-2" colSpan={3}>TỔNG CỘNG ({computedRows.length} người)</td>
                  <td className="px-3 py-2 tabular-nums text-right">{fmt(totals?.tongLuongCoDinh)}</td>
                  <td className="px-3 py-2 tabular-nums text-right">{fmt(totals?.tongKpi)}</td>
                  <td className="px-3 py-2 tabular-nums text-right">{fmt(totals?.tongGross)}</td>
                  <td className="px-3 py-2 tabular-nums text-right">{fmt(totals?.tongKhauTruBH)}</td>
                  <td className="px-3 py-2 tabular-nums text-right">{fmt(totals?.tongThueTNCN)}</td>
                  <td className="px-3 py-2 tabular-nums text-right">{fmt(totals?.tongThucLinh)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {computedRows.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          <Calculator className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <div className="text-sm font-medium">Bấm "Tính Lương Tất Cả" để tính bảng lương tháng {period}</div>
          <div className="text-xs mt-1">Engine V3.0 đọc tham số từ Google Sheets — không hardcode</div>
        </div>
      )}
    </div>
  );
}

/** Sub-tab: Bảng Lương Chi Tiết */
function DetailTableTab({ computedRows, period, scenario, onLockPayroll, isLocking }) {
  const fmt = (v) => formatVnd(v || 0);
  const [selectedSlip, setSelectedSlip] = useState(null);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Bảng lương chi tiết đầy đủ 22 thành phần — Kỳ <strong>{period}</strong> — Phương án <strong>{scenario}</strong></span>
        </div>
        {computedRows.length > 0 && (
          <button onClick={() => onLockPayroll?.(period, computedRows)} disabled={isLocking}
            className="ml-auto flex items-center space-x-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all">
            <Lock className={`w-3.5 h-3.5 ${isLocking ? 'animate-spin' : ''}`} />
            <span>{isLocking ? 'Đang khóa...' : 'Khóa Sổ Bảng Lương'}</span>
          </button>
        )}
      </div>

      {computedRows.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[1400px]">
              <thead>
                <tr className="bg-slate-800 text-white">
                  {[
                    'Họ tên', 'Chức danh', 'B/HS', 'LNB', 'Thâm niên', 'VK', 'PC-TN',
                    'Khoán', 'KPI', 'Thừa BH', 'Gross',
                    'BHXH', 'BHYT', 'BHTN', 'Tổng BH',
                    'TNChT', 'TNCN', 'Net', 'CP Quỹ', 'Chi tiết'
                  ].map(h => (
                    <th key={h} className="px-2 py-2 text-center font-semibold border-r border-slate-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {computedRows.map((r, i) => (
                  <tr key={r.maNV} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-brand-lime/5`}>
                    <td className="px-2 py-1.5 font-semibold whitespace-nowrap">{r.hoTen}</td>
                    <td className="px-2 py-1.5 text-slate-600 whitespace-nowrap">{r.chucDanh}</td>
                    <td className="px-2 py-1.5 text-center tabular-nums">{r.bac}/{r.heSoBac?.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{fmt(r.luongNgachBac)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-blue-700">{fmt(r.thamNienCT)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-indigo-700">{fmt(r.vuotKhung)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{fmt(r.phuCapTN)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{fmt(r.tongKhoanChi)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-amber-700">{fmt(r.luongKpi)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-emerald-700">{fmt(r.tienThuaBhxh)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums font-semibold">{fmt(r.tongGross)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-purple-700">{fmt(r.bhxhNld)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-purple-700">{fmt(r.bhytNld)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-purple-700">{fmt(r.bhtnNld)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-purple-800">{fmt(r.tongKhauTruBH)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{fmt(r.thuNhapTinhThue)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-rose-700">{fmt(r.thueTNCN)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums font-bold text-emerald-800">{fmt(r.thucLinh)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-slate-600">{fmt(r.tongChiPhiQuy)}</td>
                    <td className="px-2 py-1.5 text-center">
                      <button onClick={() => setSelectedSlip(r)} className="text-brand-navy hover:text-brand-lime transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-400 py-16 text-sm">
          Chưa có dữ liệu. Hãy tính lương tháng trước.
        </div>
      )}

      {/* Modal phiếu lương */}
      {selectedSlip && (
        <Modal title={`Phiếu Lương — ${selectedSlip.hoTen}`} onClose={() => setSelectedSlip(null)} size="lg">
          <PaySlipView row={selectedSlip} period={period} />
        </Modal>
      )}
    </div>
  );
}

/** Sub-tab: Khóa sổ & Lịch sử */
function LockHistoryTab({ data, period, computedRows, onLockPayroll, isLocking }) {
  const fmt = (v) => formatVnd(v || 0);
  const history = data?.payrollHistory || [];

  return (
    <div className="space-y-4">
      {/* Khóa sổ tháng hiện tại */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-rose-600" /><span>Khóa Sổ Bảng Lương Tháng {period}</span>
        </h3>
        {computedRows.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs text-slate-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
              <strong>Lưu ý:</strong> Sau khi khóa sổ, dữ liệu bảng lương tháng {period} sẽ được ghi vĩnh viễn vào BL_LICHSU. Thao tác này không thể hoàn tác.
            </div>
            <div className="text-xs text-slate-600">{computedRows.length} cán bộ — Tổng thực lĩnh: <strong className="tabular-nums">{fmt(computedRows.reduce((s, r) => s + (r.thucLinh || 0), 0))}</strong></div>
            <button onClick={() => onLockPayroll?.(period, computedRows)} disabled={isLocking || computedRows.length === 0}
              className="flex items-center space-x-2 px-5 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-all disabled:opacity-50">
              <Lock className={`w-4 h-4 ${isLocking ? 'animate-bounce' : ''}`} />
              <span>{isLocking ? 'Đang khóa sổ...' : `Xác nhận khóa sổ tháng ${period}`}</span>
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-400">Hãy tính lương tháng trước khi khóa sổ.</div>
        )}
      </div>

      {/* Lịch sử đã khóa */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Lịch Sử Bảng Lương Đã Khóa Sổ</h3>
        {history.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-8">Chưa có bảng lương nào được khóa sổ.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-50 border-b">
                {['Kỳ lương', 'Họ tên', 'Chức danh', 'Gross', 'Thực lĩnh', 'Ngày khóa'].map(h =>
                  <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600">{h}</th>)}
              </tr></thead>
              <tbody>
                {history.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-1.5 font-mono text-slate-600">{r.kyLuong || r['Kỳ lương']}</td>
                    <td className="px-3 py-1.5">{r.hoTen || r['Họ và tên']}</td>
                    <td className="px-3 py-1.5 text-slate-500">{r.chucDanh || r['Chức danh']}</td>
                    <td className="px-3 py-1.5 tabular-nums text-right">{fmt(r.tongGross || r['Tổng thu nhập Gross'])}</td>
                    <td className="px-3 py-1.5 tabular-nums text-right font-semibold text-emerald-700">{fmt(r.thucLinh || r['Thực Lĩnh (Net)'])}</td>
                    <td className="px-3 py-1.5 text-slate-400">{r['Ngày chốt & Khóa sổ'] || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN MODULE
// ────────────────────────────────────────────────────────────────────────────
export function PayrollModule({ data, period, activeSubTab = 'calculate', onCalculatePayroll, onSavePayroll, onLockPayroll }) {
  const [scenario, setScenario] = useState('PA2');
  const [computedRows, setComputedRows] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [currentSubTab, setCurrentSubTab] = useState(activeSubTab);

  // Đồng bộ sub-tab từ App.jsx routing
  React.useEffect(() => { setCurrentSubTab(activeSubTab); }, [activeSubTab]);

  const staffList = data?.staffList || [];
  const positions = data?.positions || [];
  const timesheets = data?.timesheets || [];
  const allowances = data?.allowances || [];
  const kpiEvals = data?.kpiEvaluations || [];
  const salaryParams = data?.salaryParams || data?.params || {};

  const handleRecalculate = useCallback(async () => {
    setIsCalculating(true);
    try {
      // Ưu tiên gọi backend GAS nếu có; fallback sang local engine
      if (onCalculatePayroll) {
        const res = await onCalculatePayroll(period, scenario);
        if (res?.data?.length > 0) {
          setComputedRows(res.data);
          return;
        }
      }
      // Local fallback engine
      const rows = calculatePayrollList({ staffList, positions, timesheets, kpiEvals, allowances, params: salaryParams, scenario });
      setComputedRows(rows);
    } catch (err) {
      console.error('Lỗi tính lương:', err);
      // Local engine as fallback
      const rows = calculatePayrollList({ staffList, positions, timesheets, kpiEvals, allowances, params: salaryParams, scenario });
      setComputedRows(rows);
    } finally {
      setIsCalculating(false);
    }
  }, [period, scenario, staffList, positions, timesheets, kpiEvals, allowances, salaryParams, onCalculatePayroll]);

  // Tự động tính khi thay đổi scenario hoặc period
  React.useEffect(() => {
    if (staffList.length > 0 && computedRows.length === 0) {
      handleRecalculate();
    }
  }, [scenario, period, staffList.length]);

  const totals = useMemo(() => summarizePayroll(computedRows), [computedRows]);

  const handleLockPayroll = useCallback(async (p, rows) => {
    setIsLocking(true);
    try {
      await onLockPayroll?.(p, rows);
      alert(`✅ Đã khóa sổ bảng lương tháng ${p} thành công!`);
    } catch (err) {
      alert(`❌ Lỗi khóa sổ: ${err.message}`);
    } finally {
      setIsLocking(false);
    }
  }, [onLockPayroll]);

  // Phiếu lương cá nhân (SelfService placeholder)
  const currentUserPaySlip = computedRows[0] || null; // TODO: lọc theo maNV người đăng nhập

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex flex-wrap gap-1">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = currentSubTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setCurrentSubTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {currentSubTab === 'calculate' && (
        <CalculateTab
          data={data} period={period} scenario={scenario} setScenario={setScenario}
          computedRows={computedRows} isCalculating={isCalculating}
          onRecalculate={handleRecalculate} totals={totals}
        />
      )}
      {currentSubTab === 'detail_table' && (
        <DetailTableTab
          computedRows={computedRows} period={period} scenario={scenario}
          onLockPayroll={handleLockPayroll} isLocking={isLocking}
        />
      )}
      {currentSubTab === 'pay_slip' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Phiếu Lương Của Tôi — Tháng {period}</h3>
            {computedRows.length > 0 ? (
              <PaySlipView row={computedRows[0]} period={period} />
            ) : (
              <div className="text-slate-400 text-sm text-center py-8">
                Chưa có dữ liệu lương tháng này. Vui lòng liên hệ kế toán để tra cứu.
              </div>
            )}
          </div>
        </div>
      )}
      {currentSubTab === 'lock' && (
        <LockHistoryTab
          data={data} period={period} computedRows={computedRows}
          onLockPayroll={handleLockPayroll} isLocking={isLocking}
        />
      )}
    </div>
  );
}
