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

        // Đọc mã NV liên kết và quyền 360
        const maNVLienKet = String(r[6] || '').trim();
        const phongBan = String(r[7] || '').trim();
        const quyen360 = String(r[8] || '').trim();

        return {
          status: 'success',
          user: {
            username: String(r[1] || '').trim(),
            fullName: String(r[2] || '').trim(),
            role: String(r[5] || 'CBNV').trim(),
            email: String(r[4] || '').trim(),
            maNV: maNVLienKet || String(r[1] || '').trim(),
            phongBan: phongBan,
            quyen360: quyen360
          }
        };
      }
    }
  }

  return { status: 'error', message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' };
}

/**
 * Lấy danh sách tài khoản (chỉ dành cho CTHĐQT / Admin)
 */
function getUsersList() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('TAIKHOAN');
  if (!sh || sh.getLastRow() <= 1) return [];

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const colMap = {};
  headers.forEach((h, idx) => { colMap[h] = idx; });

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  return values.map(r => ({
    maTaiKhoan: String(r[0] || '').trim(),
    username: String(r[1] || '').trim(),
    fullName: String(r[2] || '').trim(),
    email: String(r[4] || '').trim(),
    role: String(r[5] || 'CBNV').trim(),
    maNV: String(r[6] || '').trim(),
    phongBan: String(r[7] || '').trim(),
    quyen360: String(r[8] || '').trim(),
    trangThai: String(r[9] || 'HOẠT ĐỘNG').trim(),
    lastLogin: String(r[10] || '').trim(),
    ghiChu: String(r[11] || '').trim()
  }));
}

/**
 * Lưu hoặc cập nhật tài khoản
 */
function saveUser(userData) {
  if (!userData || !userData.username) {
    return { status: 'error', message: 'Thiếu tên đăng nhập' };
  }

  const ss = getSpreadsheet();
  let sh = ss.getSheetByName('TAIKHOAN');
  if (!sh) {
    taoSheet_TAIKHOAN(ss);
    sh = ss.getSheetByName('TAIKHOAN');
  }

  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) { return { status: 'error', message: 'Hệ thống bận.' }; }

  try {
    const lastRow = sh.getLastRow();
    let rowIndex = -1;
    let existingHash = '';

    if (lastRow > 1) {
      const rows = sh.getRange(2, 2, lastRow - 1, 3).getValues();
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][0]).trim().toLowerCase() === String(userData.username).trim().toLowerCase()) {
          rowIndex = i + 2;
          existingHash = String(rows[i][2] || '').trim();
          break;
        }
      }
    }

    const passwordHash = userData.password ? hashPassword(userData.password) : existingHash;
    const maTaiKhoan = userData.maTaiKhoan || `ACC_${userData.username.toUpperCase()}`;

    const row = [
      maTaiKhoan,
      userData.username,
      userData.fullName || '',
      passwordHash,
      userData.email || '',
      userData.role || 'CBNV',
      userData.maNV || '',
      userData.phongBan || '',
      userData.quyen360 || '',
      userData.trangThai || 'HOẠT ĐỘNG',
      userData.lastLogin || '',
      userData.ghiChu || ''
    ];

    if (rowIndex > 0) {
      sh.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    } else {
      sh.appendRow(row);
    }

    return { status: 'success', message: `Đã lưu tài khoản ${userData.username}` };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Xóa hoặc khóa tài khoản
 */
function deleteUser(username) {
  if (!username) return { status: 'error', message: 'Thiếu username' };
  if (username.toLowerCase() === 'admin' || username.toLowerCase() === 'nv07') {
    return { status: 'error', message: 'Không thể xóa tài khoản Quản trị viên cấp cao.' };
  }

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('TAIKHOAN');
  if (!sh || sh.getLastRow() <= 1) return { status: 'error', message: 'Không tìm thấy CSDL' };

  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) { return { status: 'error', message: 'Hệ thống bận.' }; }

  try {
    const lastRow = sh.getLastRow();
    const rows = sh.getRange(2, 2, lastRow - 1, 1).getValues();
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]).trim().toLowerCase() === String(username).trim().toLowerCase()) {
        sh.deleteRow(i + 2);
        return { status: 'success', message: `Đã xóa tài khoản ${username}` };
      }
    }
    return { status: 'error', message: 'Không tìm thấy tài khoản' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}
