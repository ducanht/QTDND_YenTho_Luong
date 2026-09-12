import React, { useState } from 'react';
import { ShieldCheck, Database, Key, History, Sliders } from 'lucide-react';
import { formatVnd } from '../../utils/currency';
import { APP_CONFIG } from '../../constants/config';

export function AdminModule({ data, onSetupDatabase }) {
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const params = data?.params || {};

  const handleSetupDb = async () => {
    if (!confirm('Bạn có chắc chắn muốn kiểm tra và đồng bộ cấu trúc 13 Sheets CSDL trên Google Sheet không?')) return;
    setIsSyncingDb(true);
    try {
      await onSetupDatabase();
      alert('✅ Đã đồng bộ cấu trúc 13 Sheets trên Google Sheet thành công!');
    } catch (err) {
      alert(`❌ Lỗi đồng bộ: ${err.message}`);
    } finally {
      setIsSyncingDb(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-brand-navy" />
          <div>
            <h2 className="font-bold text-slate-900 text-base">Quản Trị Hệ Thống & CSDL Google Sheets</h2>
            <p className="text-xs text-slate-500">Dành riêng cho Quản trị viên cấp cao (Super Admin)</p>
          </div>
        </div>
        <button
          onClick={handleSetupDb}
          disabled={isSyncingDb}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Database className={`w-4 h-4 ${isSyncingDb ? 'animate-spin' : ''}`} />
          <span>{isSyncingDb ? 'Đang Kiểm Tra...' : 'Đồng Bộ 13 Sheets CSDL'}</span>
        </button>
      </div>

      {/* Tham Số Chung CSDL */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-brand-navy font-bold text-sm">
          <Sliders className="w-4 h-4" />
          <span>Tham Số Tính Lương & Tỷ Lệ Bảo Hiểm / Thuế 2027</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">Mức lương cơ sở</div>
            <div className="text-base font-bold text-brand-navy mt-1 tabular-nums">
              {formatVnd(params.LUONG_CO_SO || 2340000)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Căn cứ Nghị định Chính phủ</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">Giảm trừ gia cảnh bản thân</div>
            <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
              {formatVnd(params.GIAM_TRU_BAN_THAN || 11000000)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Luật Thuế TNCN</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">Giảm trừ người phụ thuộc (NPT)</div>
            <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
              {formatVnd(params.GIAM_TRU_PHU_THUOC || 4400000)}/người
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Mỗi người phụ thuộc đăng ký</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">Tỷ lệ BHXH trừ vào lương NLĐ</div>
            <div className="text-base font-bold text-rose-600 mt-1 tabular-nums">
              10.5% (BHXH 8%, BHYT 1.5%, BHTN 1%)
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Luật BHXH 2024</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">Tỷ lệ BHXH Quỹ trích nộp đóng thay</div>
            <div className="text-base font-bold text-blue-800 mt-1 tabular-nums">
              21.5% (BHXH 17.5%, BHYT 3%, BHTN 1%)
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Chi phí doanh nghiệp</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">Trần tiền lương đóng BHXH tối đa</div>
            <div className="text-base font-bold text-emerald-800 mt-1 tabular-nums">
              {formatVnd((params.LUONG_CO_SO || 2340000) * 20)} (20 lần)
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Khống chế mức trần theo luật</div>
          </div>
        </div>
      </div>

      {/* Thông tin Spreadsheet */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-slate-900 text-sm">Thông Số Kỹ Thuật Hệ Sinh Thái CSDL</div>
        <div><strong>Google Spreadsheet ID:</strong> <span className="font-mono text-brand-navy">{APP_CONFIG.SPREADSHEET_ID}</span></div>
        <div><strong>Google Apps Script Live Web App:</strong> <a href={APP_CONFIG.DIRECT_GAS_URL} target="_blank" rel="noreferrer" className="text-blue-600 underline font-mono break-all">{APP_CONFIG.DIRECT_GAS_URL}</a></div>
        <div><strong>Hạ tầng Vercel Cloud SPA:</strong> <span className="font-mono text-emerald-700">qtdyentho-luong.vercel.app</span></div>
      </div>
    </div>
  );
}
