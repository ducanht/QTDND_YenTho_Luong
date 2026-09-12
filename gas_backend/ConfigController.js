/**
 * =========================================================================
 * CONFIG CONTROLLER - THAM SỐ CHUNG & TỶ LỆ BẢO HIỂM / THUẾ
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: THAM_SO
 * =========================================================================
 */

function getSystemParams() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('THAM_SO');
  const defaultParams = {
    LUONG_CO_SO: 2340000,
    CONG_CHUAN_THANG: 22,
    GIAM_TRU_BAN_THAN: 11000000,
    GIAM_TRU_PHU_THUOC: 4400000,
    TY_LE_BHXH_NLD: 0.08,
    TY_LE_BHYT_NLD: 0.015,
    TY_LE_BHTN_NLD: 0.01,
    TY_LE_BHXH_CO_QUAN: 0.175,
    TY_LE_BHYT_CO_QUAN: 0.03,
    TY_LE_BHTN_CO_QUAN: 0.01,
    TRAN_DONG_BHXH_HE_SO: 20
  };

  if (!sh || sh.getLastRow() <= 1) return defaultParams;

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  const params = { ...defaultParams };

  values.forEach(r => {
    const key = String(r[0] || '').trim();
    const val = Number(r[2]);
    if (key && !isNaN(val)) {
      params[key] = val;
    }
  });

  return params;
}
