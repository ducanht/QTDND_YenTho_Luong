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
    tieuChuan: String(r[5] || '').trim()
  }));
}

function getKpiEvaluations(period) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DG_KPI');
  if (!sh || sh.getLastRow() <= 1) return [];

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
    diemTrongSo: Number(r[8]) || 0,
    xepLoai: String(r[9] || '').trim()
  }));
}
