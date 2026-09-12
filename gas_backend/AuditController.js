/**
 * =========================================================================
 * AUDIT CONTROLLER - NHẬT KÝ TRUY VẾT & HỘP THƯ PHẢN HỒI THẮC MẮC
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: AUDIT_LOG, PHAN_HOI
 * =========================================================================
 */

function logAuditAction(username, ip, action, details) {
  try {
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName('AUDIT_LOG');
    if (!sh) return;

    const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    const logId = 'LOG_' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd_HHmmss') + '_' + Math.floor(Math.random() * 1000);

    sh.appendRow([
      logId,
      nowStr,
      username || 'Hệ thống',
      ip || 'Client',
      action || 'ACTION',
      typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
      'THÀNH CÔNG'
    ]);
  } catch (err) {
    Logger.log('Lỗi ghi audit log: ' + err.message);
  }
}

function submitFeedback(feedbackData) {
  if (!feedbackData || !feedbackData.noiDung) {
    throw new Error('Nội dung phản hồi không được để trống.');
  }

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('PHAN_HOI');
  if (!sh) throw new Error('Không tìm thấy Sheet PHAN_HOI');

  const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
  const fbId = 'FB_' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyMMdd_HHmmss');

  sh.appendRow([
    fbId,
    feedbackData.kyLuong || '',
    feedbackData.maNV || '',
    feedbackData.hoTen || '',
    feedbackData.noiDung || '',
    nowStr,
    '',
    '',
    'MỚI'
  ]);

  return { status: 'success', message: 'Đã gửi phản hồi thắc mắc thành công. Kế toán sẽ sớm giải trình.' };
}

function getFeedbacks(maNV) {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('PHAN_HOI');
  if (!sh || sh.getLastRow() <= 1) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  const filtered = maNV ? values.filter(r => String(r[2]).trim() === String(maNV).trim()) : values;

  return filtered.map(r => ({
    maPhanHoi: String(r[0] || '').trim(),
    kyLuong: String(r[1] || '').trim(),
    maNV: String(r[2] || '').trim(),
    hoTen: String(r[3] || '').trim(),
    noiDung: String(r[4] || '').trim(),
    thoiGianGui: r[5] instanceof Date ? Utilities.formatDate(r[5], 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm') : String(r[5] || ''),
    nguoiTiepNhan: String(r[6] || '').trim(),
    giaiTrinh: String(r[7] || '').trim(),
    trangThai: String(r[8] || 'MỚI').trim()
  }));
}
