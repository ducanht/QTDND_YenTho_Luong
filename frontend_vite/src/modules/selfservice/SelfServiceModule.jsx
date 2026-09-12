import React, { useState, useMemo } from 'react';
import { UserCheck, Printer, Send, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { formatVnd, numberToVietnameseWords } from '../../utils/currency';
import { computeStaffPayrollItem } from '../../utils/taxEngine';
import { APP_CONFIG } from '../../constants/config';

export function SelfServiceModule({ data, period, user, onSubmitFeedback }) {
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const staffList = data?.staffList || [];
  const positions = data?.positions || [];
  const timesheets = data?.timesheets || [];
  const feedbacks = data?.feedbacks || [];
  const params = data?.params || {};

  // Xác định cán bộ đang đăng nhập
  const currentStaff = useMemo(() => {
    if (!user) return staffList[0] || null;
    return staffList.find(s => s.maNV === user.username || s.email === user.email) || staffList[0] || null;
  }, [user, staffList]);

  // Tính phiếu lương của cán bộ này
  const mySlip = useMemo(() => {
    if (!currentStaff) return null;
    const pos = positions.find(p => p.tenChucDanh.toLowerCase() === currentStaff.chucDanh.toLowerCase()) || {};
    const ts = timesheets.find(t => t.maNV === currentStaff.maNV) || { congChuan: 22, congThucTe: 22, nghiPhep: 0 };
    return computeStaffPayrollItem({ staff: currentStaff, position: pos, timesheet: ts, params });
  }, [currentStaff, positions, timesheets, params]);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitFeedback({
        kyLuong: period,
        maNV: currentStaff?.maNV,
        hoTen: currentStaff?.hoTen,
        noiDung: feedbackText.trim()
      });
      alert('✅ Đã gửi phản hồi thành công! Kế toán sẽ sớm giải trình cho bạn.');
      setFeedbackText('');
    } catch (err) {
      alert(`❌ Lỗi gửi phản hồi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mySlip) {
    return <div className="p-6 text-center text-slate-500">Đang tải thông tin phiếu lương...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center text-brand-navy font-bold text-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Cổng Thông Tin CBNV (Chỉ Đọc)</div>
            <h2 className="text-xl font-bold text-slate-900">{mySlip.hoTen} ({mySlip.maNV})</h2>
            <div className="text-xs text-slate-600 mt-0.5">{mySlip.chucDanh} • Quỹ Tín Dụng Nhân Dân Yên Thọ</div>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-xl text-sm font-semibold transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>In Phiếu Lương A4</span>
        </button>
      </div>

      {/* Phiếu Lương A4 Printable */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center border-b pb-4">
          <div className="font-bold text-base text-brand-navy uppercase">{APP_CONFIG.TITLE}</div>
          <div className="text-xs text-slate-500">{APP_CONFIG.ADDRESS} • ĐT: {APP_CONFIG.HOTLINE}</div>
          <h1 className="text-xl font-bold text-slate-900 mt-3">PHIẾU THANH TOÁN TIỀN LƯƠNG & CHẾ ĐỘ</h1>
          <div className="text-sm text-slate-600 italic">Kỳ lương tháng: <span className="font-bold text-slate-900">{period}</span></div>
        </div>

        {/* Thông tin nhân sự */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div><span className="text-slate-500">Mã nhân viên:</span> <strong className="text-brand-navy ml-1">{mySlip.maNV}</strong></div>
          <div><span className="text-slate-500">Họ và tên:</span> <strong className="text-slate-900 ml-1">{mySlip.hoTen}</strong></div>
          <div><span className="text-slate-500">Chức danh:</span> <span className="ml-1">{mySlip.chucDanh}</span></div>
          <div><span className="text-slate-500">Hệ số lương:</span> <strong className="ml-1">{mySlip.heSoLuong.toFixed(2)}</strong></div>
          <div><span className="text-slate-500">Công thực tế:</span> <span className="ml-1">{mySlip.congThuc} / {mySlip.congChuan} ngày</span></div>
          <div><span className="text-slate-500">Số NPT:</span> <span className="ml-1">{currentStaff?.soNPT || 0} người</span></div>
        </div>

        {/* Bảng chi tiết lương */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Cột thu nhập */}
          <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="font-bold text-slate-900 uppercase text-xs border-b pb-2 text-brand-navy">
              I. CÁC KHOẢN THU NHẬP (GROSS)
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span>1. Lương ngạch bậc thời gian:</span>
              <span className="font-bold tabular-nums">{formatVnd(mySlip.luongNgachBac)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span>2. Lương hiệu quả KPI:</span>
              <span className="font-bold tabular-nums">{formatVnd(mySlip.luongKpi)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span>3. Phụ cấp trách nhiệm chức vụ:</span>
              <span className="font-bold tabular-nums">{formatVnd(mySlip.phuCapTN)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span>4. Thù lao quản trị (HĐQT/BKS):</span>
              <span className="font-bold tabular-nums">{formatVnd(mySlip.thuLaoQT)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span>5. Tiền ăn giữa ca (Ăn trưa):</span>
              <span className="font-bold tabular-nums">{formatVnd(mySlip.anTrua)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span>6. Hỗ trợ xăng xe công vụ:</span>
              <span className="font-bold tabular-nums">{formatVnd(mySlip.xangXe)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
              <span>7. Trang phục công tác:</span>
              <span className="font-bold tabular-nums">{formatVnd(mySlip.trangPhuc)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-brand-navy text-sm bg-blue-50 px-2 rounded mt-2">
              <span>TỔNG THU NHẬP (GROSS):</span>
              <span className="tabular-nums">{formatVnd(mySlip.tongGross)}</span>
            </div>
          </div>

          {/* Cột khấu trừ & Thực lĩnh */}
          <div className="space-y-4">
            <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="font-bold text-slate-900 uppercase text-xs border-b pb-2 text-rose-700">
                II. CÁC KHOẢN TRÍCH TRỪ VÀO LƯƠNG
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 text-rose-600">
                <span>1. BHXH/BHYT/BHTN (10.5%):</span>
                <span className="font-bold tabular-nums">-{formatVnd(mySlip.bhxhNld)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 text-rose-600">
                <span>2. Thuế Thu nhập cá nhân (TNCN):</span>
                <span className="font-bold tabular-nums">-{formatVnd(mySlip.thueTNCN)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-500 text-[11px] pt-1">
                <span>Giảm trừ gia cảnh: {formatVnd(mySlip.giamTruGiaCanh)}</span>
                <span>Thu nhập tính thuế: {formatVnd(mySlip.thuNhapTinhThue)}</span>
              </div>
            </div>

            {/* Khối Thực Lĩnh Lớn */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 text-emerald-950 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                III. THỰC LĨNH CHUYỂN KHOẢN (NET)
              </div>
              <div className="text-2xl font-black text-emerald-800 tabular-nums my-1">
                {formatVnd(mySlip.thucLinh)}
              </div>
              <div className="text-xs italic text-emerald-700">
                Bằng chữ: <strong>{numberToVietnameseWords(mySlip.thucLinh)}</strong>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 border-t border-emerald-200/60 pt-2">
                Tài khoản nhận: <strong>{currentStaff?.soTaiKhoanNH || 'Chưa cập nhật'}</strong> • {currentStaff?.tenNganHang || 'Agribank Quý Lộc'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hộp Thư Phản Hồi Thắc Mắc Lương */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-brand-navy" />
          <h3 className="font-bold text-slate-900 text-base">
            Gửi Phản Hồi Thắc Mắc Kỳ Lương Tháng {period}
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Nếu có bất kỳ thắc mắc nào về ngày công, điểm KPI, tiền lương hoặc các khoản phụ cấp, bạn hãy gửi câu hỏi tại đây. Kế toán Quỹ sẽ phản hồi giải trình trực tiếp.
        </p>

        <form onSubmit={handleSendFeedback} className="space-y-3">
          <textarea
            rows="3"
            required
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Nhập chi tiết nội dung thắc mắc của bạn về kỳ lương..."
            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-navy focus:outline-none"
          ></textarea>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-xl text-sm font-semibold transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Phản Hồi'}</span>
            </button>
          </div>
        </form>

        {/* Lịch sử phản hồi của CBNV này */}
        {feedbacks.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <div className="font-semibold text-xs text-slate-700 uppercase">Lịch sử thắc mắc của bạn</div>
            {feedbacks.map((fb) => (
              <div key={fb.maPhanHoi} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Kỳ: <strong>{fb.kyLuong}</strong> • {fb.thoiGianGui}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    fb.trangThai === 'ĐÃ GIẢI QUYẾT' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {fb.trangThai}
                  </span>
                </div>
                <div className="text-slate-800 font-medium">❓ Câu hỏi: {fb.noiDung}</div>
                {fb.giaiTrinh && (
                  <div className="text-blue-900 bg-blue-50 p-2 rounded border border-blue-200 mt-1">
                    💬 Giải trình từ {fb.nguoiTiepNhan || 'Kế toán'}: {fb.giaiTrinh}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
