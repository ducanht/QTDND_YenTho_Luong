import React, { useState, useMemo } from 'react';
import { Lock, FileSpreadsheet, Search, Eye, Printer, CheckCircle } from 'lucide-react';
import { formatVnd, numberToVietnameseWords } from '../../utils/currency';
import { computeStaffPayrollItem } from '../../utils/taxEngine';
import { Modal } from '../../components/common/Modal';
import { APP_CONFIG } from '../../constants/config';

export function PayrollModule({ data, period, onLockPayroll }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isLocking, setIsLocking] = useState(false);

  const staffList = data?.staffList || [];
  const positions = data?.positions || [];
  const timesheets = data?.timesheets || [];
  const params = data?.params || {};

  // Tra cứu Map O(1)
  const positionMap = useMemo(() => new Map(positions.map(p => [p.maViTri, p])), [positions]);
  const timesheetMap = useMemo(() => new Map(timesheets.map(t => [t.maNV, t])), [timesheets]);

  // Tính toán bảng lương 4 tầng tự động cho toàn bộ 12 CBNV
  const computedPayroll = useMemo(() => {
    return staffList.map(staff => {
      // Tìm vị trí tương ứng
      const pos = positions.find(p => p.tenChucDanh.toLowerCase() === staff.chucDanh.toLowerCase()) ||
                  positions.find(p => p.maViTri === 'P08') || {};
      const ts = timesheetMap.get(staff.maNV) || { congChuan: 22, congThucTe: 22, nghiPhep: 0 };
      return computeStaffPayrollItem({ staff, position: pos, timesheet: ts, params });
    });
  }, [staffList, positions, timesheetMap, params]);

  // Bộ lọc tìm kiếm
  const filteredPayroll = useMemo(() => {
    if (!searchTerm.trim()) return computedPayroll;
    const term = searchTerm.toLowerCase();
    return computedPayroll.filter(p =>
      p.hoTen.toLowerCase().includes(term) || p.maNV.toLowerCase().includes(term) || p.chucDanh.toLowerCase().includes(term)
    );
  }, [computedPayroll, searchTerm]);

  // Tổng cộng toàn Quỹ
  const totals = useMemo(() => {
    return filteredPayroll.reduce((acc, cur) => {
      acc.tongGross += cur.tongGross;
      acc.luongNgachBac += cur.luongNgachBac;
      acc.luongKpi += cur.luongKpi;
      acc.bhxhNld += cur.bhxhNld;
      acc.thueTNCN += cur.thueTNCN;
      acc.thucLinh += cur.thucLinh;
      acc.bhxhDonVi += cur.bhxhDonVi;
      return acc;
    }, {
      tongGross: 0,
      luongNgachBac: 0,
      luongKpi: 0,
      bhxhNld: 0,
      thueTNCN: 0,
      thucLinh: 0,
      bhxhDonVi: 0
    });
  }, [filteredPayroll]);

  const handleLock = async () => {
    if (!confirm(`Bạn có chắc chắn muốn KHÓA SỔ BẢNG LƯƠNG kỳ ${period} cho ${computedPayroll.length} CBNV không? Sau khi khóa, dữ liệu sẽ được ghi nhận bất biến vào sheet BL_LICHSU.`)) {
      return;
    }
    setIsLocking(true);
    try {
      await onLockPayroll(period, computedPayroll);
      alert(`✅ Đã khóa sổ bảng lương kỳ ${period} thành công!`);
    } catch (err) {
      alert(`❌ Lỗi khi khóa sổ: ${err.message}`);
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cán bộ (Tên, Mã NV, chức danh)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy w-64 md:w-80"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị <span className="font-bold text-slate-900">{filteredPayroll.length}</span> CBNV
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>In Bảng Tổng Hợp</span>
          </button>

          <button
            onClick={handleLock}
            disabled={isLocking}
            className="px-4 py-2 bg-brand-navy hover:bg-brand-navy-dark text-white rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Lock className={`w-4 h-4 ${isLocking ? 'animate-spin' : ''}`} />
            <span>{isLocking ? 'Đang Khóa Sổ...' : 'Khóa Sổ Bảng Lương'}</span>
          </button>
        </div>
      </div>

      {/* Main Payroll Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-brand-navy text-white sticky top-0 z-20 font-semibold shadow-sm">
              <tr>
                <th className="px-3 py-3 text-center border-r border-slate-600 w-12">STT</th>
                <th className="px-3 py-3 border-r border-slate-600 min-w-[80px]">Mã NV</th>
                <th className="px-3 py-3 border-r border-slate-600 min-w-[150px]">Họ và Tên</th>
                <th className="px-3 py-3 border-r border-slate-600 min-w-[130px]">Chức Danh</th>
                <th className="px-3 py-3 text-right border-r border-slate-600">Hệ Số</th>
                <th className="px-3 py-3 text-center border-r border-slate-600">Công</th>
                <th className="px-3 py-3 text-right border-r border-slate-600 bg-blue-900/40">Lương Ngạch Bậc</th>
                <th className="px-3 py-3 text-right border-r border-slate-600">Lương KPI</th>
                <th className="px-3 py-3 text-right border-r border-slate-600">Phụ Cấp TN</th>
                <th className="px-3 py-3 text-right border-r border-slate-600">Thù Lao QT</th>
                <th className="px-3 py-3 text-right border-r border-slate-600">Ăn Trưa</th>
                <th className="px-3 py-3 text-right border-r border-slate-600">Xăng Xe</th>
                <th className="px-3 py-3 text-right border-r border-slate-600 font-bold bg-blue-900/60">TỔNG GROSS</th>
                <th className="px-3 py-3 text-right border-r border-slate-600 text-rose-200">BHXH NLĐ</th>
                <th className="px-3 py-3 text-right border-r border-slate-600 text-rose-200">Thuế TNCN</th>
                <th className="px-3 py-3 text-right border-r border-slate-600 font-bold bg-emerald-800 text-brand-lime min-w-[120px]">THỰC LĨNH</th>
                <th className="px-3 py-3 text-right border-r border-slate-600 text-slate-300">BHXH Đơn Vị</th>
                <th className="px-3 py-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayroll.map((item, idx) => (
                <tr key={item.maNV} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 text-center text-slate-400">{idx + 1}</td>
                  <td className="px-3 py-2.5 font-bold text-brand-navy">{item.maNV}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-900">{item.hoTen}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.chucDanh}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{item.heSoLuong.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-center font-mono">{item.congThuc}/{item.congChuan}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium bg-blue-50/50">{formatVnd(item.luongNgachBac)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatVnd(item.luongKpi)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatVnd(item.phuCapTN)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatVnd(item.thuLaoQT)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatVnd(item.anTrua)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatVnd(item.xangXe)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-slate-900 bg-blue-50/80">{formatVnd(item.tongGross)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-rose-600 font-medium">-{formatVnd(item.bhxhNld)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-rose-600 font-medium">-{formatVnd(item.thueTNCN)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-emerald-700 bg-emerald-50 text-sm">{formatVnd(item.thucLinh)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">{formatVnd(item.bhxhDonVi)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setSelectedSlip(item)}
                      className="p-1 text-brand-navy hover:text-blue-700 hover:bg-blue-50 rounded"
                      title="Xem phiếu lương"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Tổng cộng footer */}
            <tfoot className="bg-slate-100 font-bold text-slate-900 sticky bottom-0 z-10 border-t-2 border-slate-300">
              <tr>
                <td colSpan={6} className="px-3 py-3 text-center uppercase tracking-wider text-xs">TỔNG CỘNG TOÀN QUỸ ({filteredPayroll.length} CBNV)</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatVnd(totals.luongNgachBac)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatVnd(totals.luongKpi)}</td>
                <td colSpan={4}></td>
                <td className="px-3 py-3 text-right tabular-nums text-blue-900 text-sm">{formatVnd(totals.tongGross)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-rose-600">-{formatVnd(totals.bhxhNld)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-rose-600">-{formatVnd(totals.thueTNCN)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-emerald-800 text-base">{formatVnd(totals.thucLinh)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-slate-600">{formatVnd(totals.bhxhDonVi)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Phiếu Lương Chi Tiết */}
      {selectedSlip && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSlip(null)}
          title={`Phiếu Thanh Toán Tiền Lương: ${selectedSlip.hoTen} (${selectedSlip.maNV})`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="text-center border-b pb-3">
              <div className="font-bold text-sm text-brand-navy uppercase">{APP_CONFIG.TITLE}</div>
              <div className="text-slate-500">{APP_CONFIG.ADDRESS}</div>
              <div className="font-bold text-base text-slate-900 mt-2">PHIẾU THANH TOÁN TIỀN LƯƠNG & CHẾ ĐỘ</div>
              <div className="text-slate-600 italic">Kỳ lương tháng: {period}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div><span className="font-medium text-slate-500">Mã nhân viên:</span> <strong className="text-brand-navy">{selectedSlip.maNV}</strong></div>
              <div><span className="font-medium text-slate-500">Họ và tên:</span> <strong className="text-slate-900">{selectedSlip.hoTen}</strong></div>
              <div><span className="font-medium text-slate-500">Chức danh:</span> {selectedSlip.chucDanh}</div>
              <div><span className="font-medium text-slate-500">Hệ số lương:</span> {selectedSlip.heSoLuong.toFixed(2)}</div>
              <div><span className="font-medium text-slate-500">Ngày công chuẩn:</span> {selectedSlip.congChuan} ngày</div>
              <div><span className="font-medium text-slate-500">Ngày công thực:</span> {selectedSlip.congThuc} ngày</div>
            </div>

            <div className="space-y-1.5 border-t pt-3">
              <div className="font-bold text-slate-900 uppercase text-[11px] mb-1">I. CÁC KHOẢN THU NHẬP (GROSS)</div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span>1. Lương ngạch bậc thời gian:</span>
                <span className="font-bold tabular-nums">{formatVnd(selectedSlip.luongNgachBac)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span>2. Lương hiệu quả công việc (KPI):</span>
                <span className="font-bold tabular-nums">{formatVnd(selectedSlip.luongKpi)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span>3. Phụ cấp trách nhiệm chức vụ:</span>
                <span className="font-bold tabular-nums">{formatVnd(selectedSlip.phuCapTN)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span>4. Thù lao quản trị (HĐQT/BKS):</span>
                <span className="font-bold tabular-nums">{formatVnd(selectedSlip.thuLaoQT)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span>5. Tiền ăn giữa ca (Ăn trưa):</span>
                <span className="font-bold tabular-nums">{formatVnd(selectedSlip.anTrua)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span>6. Hỗ trợ xăng xe công tác:</span>
                <span className="font-bold tabular-nums">{formatVnd(selectedSlip.xangXe)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                <span>7. Tiền trang phục công tác:</span>
                <span className="font-bold tabular-nums">{formatVnd(selectedSlip.trangPhuc)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-brand-navy text-sm bg-blue-50 px-2 rounded">
                <span>TỔNG THU NHẬP (GROSS):</span>
                <span className="tabular-nums">{formatVnd(selectedSlip.tongGross)}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-t pt-3">
              <div className="font-bold text-slate-900 uppercase text-[11px] mb-1">II. CÁC KHOẢN TRÍCH TRỪ VÀO LƯƠNG</div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 text-rose-600">
                <span>1. Trích nộp BHXH/BHYT/BHTN (10.5%):</span>
                <span className="font-bold tabular-nums">-{formatVnd(selectedSlip.bhxhNld)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 text-rose-600">
                <span>2. Thuế Thu nhập cá nhân (TNCN):</span>
                <span className="font-bold tabular-nums">-{formatVnd(selectedSlip.thueTNCN)}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center text-emerald-900">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider">THỰC LĨNH CHUYỂN KHOẢN (NET)</div>
                <div className="text-[11px] italic text-emerald-700 mt-0.5">
                  ({numberToVietnameseWords(selectedSlip.thucLinh)})
                </div>
              </div>
              <div className="text-xl font-bold text-emerald-800 tabular-nums">
                {formatVnd(selectedSlip.thucLinh)}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-brand-navy text-white rounded-lg font-semibold hover:bg-brand-navy-dark flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu A4</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
