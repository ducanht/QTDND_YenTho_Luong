/**
 * Định dạng số tiền sang định dạng tiền Việt Nam Đồng (VND)
 */
export function formatVnd(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 ₫';
  return Number(amount).toLocaleString('vi-VN') + ' ₫';
}

export function parseVnd(str) {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const cleaned = String(str).replace(/[^\d-]/g, '');
  return Number(cleaned) || 0;
}

/**
 * Đọc số tiền thành chữ Tiếng Việt chuẩn mực cho phiếu thanh toán lương
 */
export function numberToVietnameseWords(number) {
  if (!number || isNaN(number) || number === 0) return 'Không đồng chẵn';
  const num = Math.round(Math.abs(number));

  const ChuSo = [" không", " một", " hai", " ba", " bốn", " năm", " sáu", " bảy", " tám", " chín"];
  const Tien = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];

  function docSo3ChuSo(baso) {
    let tram = Math.floor(baso / 100);
    let chuc = Math.floor((baso % 100) / 10);
    let donvi = baso % 10;
    let ketqua = "";

    if (tram === 0 && chuc === 0 && donvi === 0) return "";
    if (tram !== 0) {
      ketqua += ChuSo[tram] + " trăm";
      if (chuc === 0 && donvi !== 0) ketqua += " linh";
    }
    if (chuc !== 0 && chuc !== 1) {
      ketqua += ChuSo[chuc] + " mươi";
      if (chuc === 0 && donvi !== 0) ketqua += " linh";
    }
    if (chuc === 1) ketqua += " mười";
    switch (donvi) {
      case 1:
        if (chuc !== 0 && chuc !== 1) ketqua += " mốt";
        else ketqua += ChuSo[donvi];
        break;
      case 5:
        if (chuc === 0) ketqua += ChuSo[donvi];
        else ketqua += " lăm";
        break;
      default:
        if (donvi !== 0) ketqua += ChuSo[donvi];
        break;
    }
    return ketqua;
  }

  let str = num.toString();
  let len = str.length;
  let i = 0;
  let result = "";

  while (len > 0) {
    let baso = parseInt(str.substring(Math.max(0, len - 3), len));
    let doc = docSo3ChuSo(baso);
    if (doc !== "") {
      result = doc + Tien[i] + result;
    }
    i++;
    len -= 3;
  }

  result = result.trim();
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1) + " đồng chẵn";
  }
  return result;
}
