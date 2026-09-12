/**
 * =========================================================================
 * AUTH CONTROLLER - XÁC THỰC TÀI KHOẢN & PHÂN QUYỀN RBAC 4 CẤP
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: TAIKHOAN
 * =========================================================================
 */

function hashPassword(pass) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pass, Utilities.Charset.UTF_8);
  let hex = '';
  for (let i = 0; i < raw.length; i++) {
    let byteVal = raw[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hex += byteHex;
  }
  return hex;
}

function loginUser(username, password) {
  if (!username || !password) {
    return { status: 'error', message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' };
  }

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('TAIKHOAN');
  if (!sh || sh.getLastRow() <= 1) {
    // Tài khoản Super Admin mặc định dự phòng khẩn cấp
    if (username.toLowerCase() === 'admin' && password === 'YenTho@2027') {
      return {
        status: 'success',
        user: {
          username: 'admin',
          fullName: 'Quản Trị Viên Tối Cao',
          role: 'SUPER_ADMIN',
          email: 'ducanht@gmail.com'
        }
      };
    }
    return { status: 'error', message: 'Tài khoản hoặc mật khẩu không chính xác.' };
  }

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  const inputHash = hashPassword(password);

  for (let i = 0; i < values.length; i++) {
    const r = values[i];
    const uName = String(r[1] || '').trim().toLowerCase();
    const pHash = String(r[3] || '').trim();
    const status = String(r[6] || '').trim();

    if (uName === username.trim().toLowerCase()) {
      if (status === 'KHÓA') {
        return { status: 'error', message: 'Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ Admin.' };
      }

      // Cho phép khớp mật khẩu băm SHA-256 hoặc mật khẩu khởi tạo lần đầu
      if (pHash === inputHash || pHash === password) {
        // Cập nhật lần đăng nhập cuối
        const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
        sh.getRange(i + 2, 8).setValue(nowStr);

        return {
          status: 'success',
          user: {
            username: String(r[1] || '').trim(),
            fullName: String(r[2] || '').trim(),
            role: String(r[5] || 'NHAN_VIEN').trim(),
            email: String(r[4] || '').trim()
          }
        };
      }
    }
  }

  return { status: 'error', message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' };
}
