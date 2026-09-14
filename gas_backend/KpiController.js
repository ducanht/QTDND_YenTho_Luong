/**
 * =========================================================================
 * KPI CONTROLLER - TỪ ĐIỂN CHỈ SỐ & ĐÁNH GIÁ KPI NGHIỆP VỤ THÁNG
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: DM_KPI, DG_KPI
 * =========================================================================
 */

function getKpiDictionary() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DM_KPI');
  if (!sh || sh.getLastRow() <= 1) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  return values.map(r => ({
    maKpi: String(r[0] || '').trim(),
    tenKpi: String(r[1] || '').trim(),
    khoi: String(r[2] || '').trim(),
    donViTinh: String(r[3] || '').trim(),
    trongSo: Number(r[4]) || 0,
    tieuChuan: String(r[5] || '').trim(),
    batTat: r[6] !== undefined ? String(r[6]).trim() : 'BẬT',
    nguoiTao: String(r[7] || '').trim(),
    ngayTao: String(r[8] || '').trim()
  }));
}

/**
 * Thêm, bớt, tuỳ chỉnh từ điển chỉ số KPI
 */
function saveKpiDictionary(kpiList) {
  const ss = getSpreadsheet();
  let sh = ss.getSheetByName('DM_KPI');
  if (!sh) {
    taoSheet_DM_KPI(ss);
    sh = ss.getSheetByName('DM_KPI');
  }

  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) { return { status: 'error', message: 'Hệ thống bận.' }; }

  try {
    const lastRow = sh.getLastRow();
    if (lastRow > 1) {
      sh.deleteRows(2, lastRow - 1);
    }

    const now = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
    const rows = (kpiList || []).map((k, idx) => [
      k.maKpi || `KPI_${String(idx + 1).padStart(2, '0')}`,
      k.tenKpi || '',
      k.khoi || 'Toàn Quỹ',
      k.donViTinh || '',
      Number(k.trongSo) || 0,
      k.tieuChuan || '',
      k.batTat || 'BẬT',
      k.nguoiTao || 'Admin',
      k.ngayTao || now
    ]);

    if (rows.length > 0) {
      sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }

    return { status: 'success', message: `Đã lưu ${rows.length} chỉ số KPI.` };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Lấy danh sách đánh giá KPI tháng (đầy đủ 5 bước)
 */
function getKpiEvaluations(period) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DG_KPI');
  if (!sh || sh.getLastRow() <= 1) return [];

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const colMap = {};
  headers.forEach((h, idx) => { colMap[h] = idx; });

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  const filtered = period ? values.filter(r => String(r[1]).trim() === String(period).trim()) : values;

  return filtered.map(r => ({
    maDanhGia: String(r[0] || '').trim(),
    ky: String(r[1] || '').trim(),
    maNV: String(r[2] || '').trim(),
    hoTen: String(r[3] || '').trim(),
    maKpi: String(r[4] || '').trim(),
    chiTieu: Number(r[5]) || 0,
    thucTe: Number(r[6]) || 0,
    tyLeDat: Number(r[7]) || 0,
    diemTuDanhGia: Number(r[colMap['Điểm tự đánh giá'] || 8]) || 0,
    yKienTuDanhGia: String(r[colMap['Ý kiến tự đánh giá'] || 9] || '').trim(),
    diemTruongBP: Number(r[colMap['Điểm Trưởng BP'] || 10]) || 0,
    yKienTruongBP: String(r[colMap['Ý kiến Trưởng BP'] || 11] || '').trim(),
    diemGiamDoc: Number(r[colMap['Điểm Giám đốc'] || 12]) || 0,
    yKienGiamDoc: String(r[colMap['Ý kiến Giám đốc'] || 13] || '').trim(),
    diemHDLuong: Number(r[colMap['Điểm HĐ lương'] || 14]) || 0,
    yKienHDLuong: String(r[colMap['Ý kiến HĐ lương'] || 15] || '').trim(),
    diemChot: Number(r[colMap['Điểm chốt'] || 16]) || 0,
    xepLoai: String(r[colMap['Xếp loại tháng'] || 17] || '').trim(),
    buocPheDuyet: String(r[colMap['Bước phê duyệt'] || 18] || '1_TU_DANH_GIA').trim(),
    nguoiCapNhat: String(r[colMap['Người cập nhật'] || 19] || '').trim(),
    thoiGianCapNhat: String(r[colMap['Thời gian cập nhật'] || 20] || '').trim()
  }));
}

/**
 * Cập nhật bước đánh giá KPI (Quy trình 5 bước)
 */
function saveKpiEvaluationStep(stepPayload) {
  if (!stepPayload || !stepPayload.ky || !stepPayload.maNV) {
    return { status: 'error', message: 'Thiếu kỳ hoặc mã nhân viên' };
  }

  const ss = getSpreadsheet();
  let sh = ss.getSheetByName('DG_KPI');
  if (!sh) {
    taoSheet_DG_KPI(ss);
    sh = ss.getSheetByName('DG_KPI');
  }

  const lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) { return { status: 'error', message: 'Hệ thống bận.' }; }

  try {
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => String(h).trim());
    const colMap = {};
    headers.forEach((h, idx) => { colMap[h] = idx + 1; });

    const lastRow = sh.getLastRow();
    const rows = (stepPayload.items || [stepPayload]);
    const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');

    rows.forEach(item => {
      let rowIndex = -1;
      if (lastRow > 1) {
        const existing = sh.getRange(2, 1, lastRow - 1, 5).getValues();
        for (let i = 0; i < existing.length; i++) {
          if (String(existing[i][1]).trim() === String(stepPayload.ky).trim() &&
              String(existing[i][2]).trim().toUpperCase() === String(stepPayload.maNV).trim().toUpperCase() &&
              String(existing[i][4]).trim() === String(item.maKpi || '').trim()) {
            rowIndex = i + 2;
            break;
          }
        }
      }

      if (rowIndex === -1) {
        rowIndex = sh.getLastRow() + 1;
        sh.getRange(rowIndex, 1).setValue(`DG_${stepPayload.ky}_${stepPayload.maNV}_${item.maKpi}`);
        sh.getRange(rowIndex, 2).setValue(stepPayload.ky);
        sh.getRange(rowIndex, 3).setValue(stepPayload.maNV);
        sh.getRange(rowIndex, 4).setValue(stepPayload.hoTen || '');
        sh.getRange(rowIndex, 5).setValue(item.maKpi || '');
      }

      // Cập nhật các cột tương ứng theo bước
      if (item.chiTieu !== undefined && colMap['Chỉ tiêu giao']) sh.getRange(rowIndex, colMap['Chỉ tiêu giao']).setValue(item.chiTieu);
      if (item.thucTe !== undefined && colMap['Thực tế thực hiện']) sh.getRange(rowIndex, colMap['Thực tế thực hiện']).setValue(item.thucTe);
      if (item.tyLeDat !== undefined && colMap['Tỷ lệ đạt %']) sh.getRange(rowIndex, colMap['Tỷ lệ đạt %']).setValue(item.tyLeDat);

      if (item.diemTuDanhGia !== undefined && colMap['Điểm tự đánh giá']) sh.getRange(rowIndex, colMap['Điểm tự đánh giá']).setValue(item.diemTuDanhGia);
      if (item.yKienTuDanhGia !== undefined && colMap['Ý kiến tự đánh giá']) sh.getRange(rowIndex, colMap['Ý kiến tự đánh giá']).setValue(item.yKienTuDanhGia);

      if (item.diemTruongBP !== undefined && colMap['Điểm Trưởng BP']) sh.getRange(rowIndex, colMap['Điểm Trưởng BP']).setValue(item.diemTruongBP);
      if (item.yKienTruongBP !== undefined && colMap['Ý kiến Trưởng BP']) sh.getRange(rowIndex, colMap['Ý kiến Trưởng BP']).setValue(item.yKienTruongBP);

      if (item.diemGiamDoc !== undefined && colMap['Điểm Giám đốc']) sh.getRange(rowIndex, colMap['Điểm Giám đốc']).setValue(item.diemGiamDoc);
      if (item.yKienGiamDoc !== undefined && colMap['Ý kiến Giám đốc']) sh.getRange(rowIndex, colMap['Ý kiến Giám đốc']).setValue(item.yKienGiamDoc);

      if (item.diemHDLuong !== undefined && colMap['Điểm HĐ lương']) sh.getRange(rowIndex, colMap['Điểm HĐ lương']).setValue(item.diemHDLuong);
      if (item.yKienHDLuong !== undefined && colMap['Ý kiến HĐ lương']) sh.getRange(rowIndex, colMap['Ý kiến HĐ lương']).setValue(item.yKienHDLuong);

      if (item.diemChot !== undefined && colMap['Điểm chốt']) sh.getRange(rowIndex, colMap['Điểm chốt']).setValue(item.diemChot);
      if (item.xepLoai !== undefined && colMap['Xếp loại tháng']) sh.getRange(rowIndex, colMap['Xếp loại tháng']).setValue(item.xepLoai);
      if (stepPayload.buocPheDuyet && colMap['Bước phê duyệt']) sh.getRange(rowIndex, colMap['Bước phê duyệt']).setValue(stepPayload.buocPheDuyet);

      if (colMap['Người cập nhật']) sh.getRange(rowIndex, colMap['Người cập nhật']).setValue(stepPayload.nguoiCapNhat || 'System');
      if (colMap['Thời gian cập nhật']) sh.getRange(rowIndex, colMap['Thời gian cập nhật']).setValue(nowStr);
    });

    return { status: 'success', message: `Đã cập nhật đánh giá KPI kỳ ${stepPayload.ky} cho ${stepPayload.hoTen || stepPayload.maNV}` };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}
