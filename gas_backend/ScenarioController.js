/**
 * =========================================================================
 * SCENARIO CONTROLLER - QUẢN LÝ KỊCH BẢN MÔ PHỎNG QUY CHẾ LƯƠNG (HĐQT)
 * Đơn vị: Quỹ Tín Dụng Nhân Dân Yên Thọ
 * Sheet nguồn: THAM_SO (tham số SCENARIOS_JSON) hoặc bộ nhớ kịch bản
 * =========================================================================
 */

function getScenarios() {
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('THAM_SO');
  
  // Các kịch bản mẫu mặc định ban đầu theo 3 Phương Án của Đề Án 2027 Pro V2
  const defaultScenarios = [
    {
      id: 'PA1',
      name: 'Phương án 1: Cơ Bản - Ổn Định',
      description: 'Duy trì cơ cấu hệ số chức danh truyền thống, tập trung an toàn quỹ lương',
      luongCoSo: 2340000,
      tranKpi: 100,
      anTrua: 730000,
      xangXe: 400000,
      dienThoai: 300000,
      trachNhiem: 500000,
      docHai: 300000,
      quyThuongNam: 150000000,
      createdAt: '01/01/2027',
      author: 'Hội đồng Quản trị'
    },
    {
      id: 'PA2',
      name: 'Phương án 2: Đột Phá Hiệu Quả & Năng Suất',
      description: 'Nâng tỷ trọng lương KPI lên 50-60%, thúc đẩy tăng trưởng tín dụng và CASA',
      luongCoSo: 2340000,
      tranKpi: 130,
      anTrua: 1000000,
      xangXe: 700000,
      dienThoai: 500000,
      trachNhiem: 800000,
      docHai: 500000,
      quyThuongNam: 250000000,
      createdAt: '01/01/2027',
      author: 'Ban Giám đốc đề xuất'
    },
    {
      id: 'PA3',
      name: 'Phương án 3: Cân Bằng Hài Hòa (Khuyến Nghị)',
      description: 'Cân bằng giữa an toàn tài chính Quỹ và thu nhập tạo động lực cho cán bộ',
      luongCoSo: 2340000,
      tranKpi: 115,
      anTrua: 850000,
      xangXe: 500000,
      dienThoai: 400000,
      trachNhiem: 600000,
      docHai: 400000,
      quyThuongNam: 200000000,
      createdAt: '01/01/2027',
      author: 'Thường trực HĐQT & BKS'
    }
  ];

  if (!sh || sh.getLastRow() <= 1) return defaultScenarios;

  try {
    const values = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
    const row = values.find(r => String(r[0]).trim() === 'SCENARIOS_JSON');
    if (row && row[2]) {
      const parsed = JSON.parse(String(row[2]));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    Logger.log('Lỗi đọc SCENARIOS_JSON: ' + e.message);
  }

  return defaultScenarios;
}

function saveScenario(scenarioData) {
  if (!scenarioData || !scenarioData.name) {
    throw new Error('Dữ liệu kịch bản không hợp lệ.');
  }

  const ss = getSpreadsheet();
  let sh = ss.getSheetByName('THAM_SO');
  if (!sh) throw new Error('Không tìm thấy Sheet THAM_SO');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const scenarios = getScenarios();
    const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
    
    const id = scenarioData.id || ('SCENARIO_' + Date.now());
    const existingIdx = scenarios.findIndex(s => s.id === id);

    const record = {
      id: id,
      name: scenarioData.name,
      description: scenarioData.description || '',
      luongCoSo: Number(scenarioData.luongCoSo) || 2340000,
      tranKpi: Number(scenarioData.tranKpi) || 100,
      anTrua: Number(scenarioData.anTrua) || 730000,
      xangXe: Number(scenarioData.xangXe) || 400000,
      dienThoai: Number(scenarioData.dienThoai) || 300000,
      trachNhiem: Number(scenarioData.trachNhiem) || 500000,
      docHai: Number(scenarioData.docHai) || 300000,
      quyThuongNam: Number(scenarioData.quyThuongNam) || 150000000,
      customPositions: scenarioData.customPositions || null,
      createdAt: scenarioData.createdAt || nowStr,
      author: scenarioData.author || 'Thành viên HĐQT'
    };

    if (existingIdx >= 0) {
      scenarios[existingIdx] = record;
    } else {
      scenarios.push(record);
    }

    // Ghi vào Sheet THAM_SO
    const lastRow = sh.getLastRow();
    const keys = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, 1).getValues().map(r => String(r[0]).trim()) : [];
    const targetIdx = keys.indexOf('SCENARIOS_JSON');

    const jsonString = JSON.stringify(scenarios);
    if (targetIdx >= 0) {
      sh.getRange(targetIdx + 2, 3).setValue(jsonString);
      sh.getRange(targetIdx + 2, 5).setValue(nowStr);
    } else {
      sh.appendRow(['SCENARIOS_JSON', 'Danh sách Kịch bản mô phỏng lương HĐQT', jsonString, 'JSON', nowStr, '31/12/2099', 'Nghị quyết HĐQT', 'Lưu trữ các kịch bản mô phỏng']);
    }

    return { status: 'success', message: 'Đã lưu kịch bản mô phỏng thành công.', scenario: record, scenarios: scenarios };
  } finally {
    lock.releaseLock();
  }
}
