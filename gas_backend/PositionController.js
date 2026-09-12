/**
 * =========================================================================
 * POSITION CONTROLLER - KHUNG VỊ TRÍ CHỨC DANH & HỆ SỐ LƯƠNG
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: DM_CHUCDANH
 * =========================================================================
 */

function getPositions() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DM_CHUCDANH');
  if (!sh || sh.getLastRow() <= 1) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  return values.map(r => ({
    maViTri: String(r[0] || '').trim(),
    tenChucDanh: String(r[1] || '').trim(),
    khoi: String(r[2] || '').trim(),
    bac: Number(r[3]) || 1,
    soLuong: Number(r[4]) || 1,
    pa1HeSo: Number(r[5]) || 0,
    pa2HeSo: Number(r[6]) || 0,
    pa3HeSo: Number(r[7]) || 0,
    pa1Kpi: Number(r[8]) || 0,
    pa2Kpi: Number(r[9]) || 0,
    pa3Kpi: Number(r[10]) || 0,
    pa1Thuong: Number(r[11]) || 0,
    pa2Thuong: Number(r[12]) || 0,
    pa3Thuong: Number(r[13]) || 0,
    phuCapTN: Number(r[14]) || 0,
    thuLaoQT: Number(r[15]) || 0,
    ngayHieuLuc: r[16] instanceof Date ? Utilities.formatDate(r[16], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : String(r[16] || ''),
    quyetDinh: String(r[17] || '').trim()
  }));
}

function savePositions(positionsList) {
  if (!Array.isArray(positionsList) || positionsList.length === 0) {
    throw new Error('Dữ liệu chức danh không hợp lệ.');
  }

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('DM_CHUCDANH');
  if (!sh) throw new Error('Không tìm thấy Sheet DM_CHUCDANH');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const lastRow = sh.getLastRow();
    const existing = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, 1).getValues() : [];
    const rowMap = new Map();

    for (let i = 0; i < existing.length; i++) {
      rowMap.set(String(existing[i][0]).trim(), i + 2);
    }

    const appendRows = [];
    positionsList.forEach(p => {
      const maViTri = String(p.maViTri || '').trim();
      const row = [
        maViTri,
        p.tenChucDanh || '',
        p.khoi || '',
        Number(p.bac) || 1,
        Number(p.soLuong) || 1,
        Number(p.pa1HeSo) || 0,
        Number(p.pa2HeSo) || 0,
        Number(p.pa3HeSo) || 0,
        Number(p.pa1Kpi) || 0,
        Number(p.pa2Kpi) || 0,
        Number(p.pa3Kpi) || 0,
        Number(p.pa1Thuong) || 0,
        Number(p.pa2Thuong) || 0,
        Number(p.pa3Thuong) || 0,
        Number(p.phuCapTN) || 0,
        Number(p.thuLaoQT) || 0,
        p.ngayHieuLuc || Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'),
        p.quyetDinh || 'Nghị quyết HĐQT'
      ];

      if (rowMap.has(maViTri)) {
        sh.getRange(rowMap.get(maViTri), 1, 1, row.length).setValues([row]);
      } else {
        appendRows.push(row);
      }
    });

    if (appendRows.length > 0) {
      sh.getRange(sh.getLastRow() + 1, 1, appendRows.length, appendRows[0].length).setValues(appendRows);
    }

    return { status: 'success', message: `Đã lưu cập nhật ${positionsList.length} chức danh thành công.` };
  } finally {
    lock.releaseLock();
  }
}

