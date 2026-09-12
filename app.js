/**
 * HỆ THỐNG LƯƠNG, CHẤM CÔNG & KPI 2027 - QUỸ TÍN DỤNG NHÂN DÂN YÊN THỌ
 * Phiên bản: PRO V2 (Tích hợp Chốt khung lương, Chấm công, In A4 & Cloud Google Sheets)
 */

const STORAGE_KEY = 'qtdnd_yentho_luong_2027_v2';
const moneyFmt = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const pctFmt = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

const defaultData = {
  meta: {
    effectiveDate: '2027-01-01',
    scenario: 'PA2',
    kpiCompletion: 100,
    cloudUrl: '',
    lastSync: null,
    currentPeriod: '2027-01',
    standardDays: 22
  },
  officialFramework: {
    locked: false,
    scenario: 'PA2',
    decisionNo: '01/2027/QĐ-HĐQT',
    lockedDate: '2027-01-05',
    lockedBy: 'Hội đồng quản trị QTDND Yên Thọ',
    note: 'Áp dụng chính thức cho kỳ tính lương năm tài chính 2027'
  },
  params: {
    basicSalary: 2500000,
    kpiMax: 0.25,
    bonusRate: 0.08,
    phone: 300000,
    meal: 1200000,
    clothing: 500000,
    travel: 500000,
    fuel: 400000,
    training: 200000,
    employerBHXH: 0.175,
    employeeBHXH: 0.08,
    employerBHYT: 0.03,
    employeeBHYT: 0.015,
    employerBHTN: 0.01,
    employeeBHTN: 0.01,
    personalDeduction: 15500000,
    dependentDeduction: 6200000,
    pitEstimateRate: 0.05
  },
  positions: [
    ['P01', 'Chủ tịch HĐQT', 'Lãnh đạo', 1, 1, 4.8, 5.2, 5.6, 0.20, 0.25, 0.30, 0.10, 0.12, 0.15],
    ['P02', 'Giám đốc', 'Điều hành', 2, 1, 4.4, 4.8, 5.2, 0.20, 0.25, 0.30, 0.10, 0.12, 0.15],
    ['P03', 'Phó Giám đốc', 'Điều hành', 3, 0, 3.9, 4.2, 4.6, 0.18, 0.22, 0.25, 0.08, 0.10, 0.12],
    ['P04', 'Trưởng BKS', 'Kiểm soát', 4, 1, 3.7, 4.0, 4.3, 0.15, 0.18, 0.22, 0.06, 0.08, 0.10],
    ['P05', 'Kế toán trưởng', 'Chuyên môn', 5, 1, 3.6, 3.9, 4.2, 0.15, 0.18, 0.22, 0.06, 0.08, 0.10],
    ['P06', 'Ủy viên HĐQT', 'Quản trị', 6, 1, 3.2, 3.5, 3.8, 0.12, 0.15, 0.18, 0.05, 0.06, 0.08],
    ['P07', 'Kiểm soát viên', 'Kiểm soát', 7, 2, 3.0, 3.3, 3.6, 0.12, 0.15, 0.18, 0.05, 0.06, 0.08],
    ['P08', 'Nhân viên tín dụng', 'Nghiệp vụ', 8, 4, 2.6, 2.85, 3.1, 0.12, 0.15, 0.18, 0.05, 0.06, 0.08],
    ['P09', 'Kế toán viên', 'Nghiệp vụ', 9, 1, 2.4, 2.65, 2.9, 0.10, 0.13, 0.16, 0.04, 0.05, 0.07],
    ['P10', 'Bảo vệ', 'Hỗ trợ', 10, 1, 1.9, 2.1, 2.3, 0.08, 0.10, 0.12, 0.03, 0.04, 0.05]
  ],
  governance: [
    ['G01', 'Chủ tịch HĐQT', 'HĐQT', 'P01', 1, 1000000, 3000000, 0],
    ['G02', 'Giám đốc', 'HĐQT/Điều hành', 'P02', 1, 800000, 2000000, 0],
    ['G03', 'Ủy viên HĐQT', 'HĐQT', 'P06', 1, 500000, 1000000, 0],
    ['G04', 'Trưởng BKS', 'BKS', 'P04', 1, 700000, 2000000, 0],
    ['G05', 'Kiểm soát viên', 'BKS', 'P07', 2, 500000, 1200000, 0]
  ],
  staff: [
    ['NV01', 'Nguyễn Thị Sinh', 'P08', 1, 100, 0, 0, 'Thẩm định tài sản'],
    ['NV02', 'Nguyễn Thị Mến', 'P05', 1, 100, 0, 2, 'Kế toán trưởng'],
    ['NV03', 'Nguyễn Văn Sơn', 'P02', 1, 100, 0, 1, 'UV HĐQT - Giám đốc'],
    ['NV04', 'Bùi Thị Thảo', 'P04', 1, 100, 0, 1, 'Trưởng ban kiểm soát'],
    ['NV05', 'Nguyễn Hữu Nhân', 'P08', 1, 100, 0, 1, 'CB tín dụng'],
    ['NV06', 'Trịnh Thị Hiền', 'P07', 1, 100, 0, 1, 'KST - Kiểm toán nội bộ'],
    ['NV07', 'Trịnh Đức Anh', 'P01', 1, 100, 0, 1, 'Chủ tịch HĐQT'],
    ['NV08', 'Vũ Thị Hiền', 'P06', 1, 100, 0, 0, 'UV HĐQT'],
    ['NV09', 'Trần Như Huyền', 'P08', 1, 100, 0, 1, 'CB tín dụng'],
    ['NV10', 'Hoàng Thị Lan', 'P09', 1, 100, 0, 1, 'Kế toán viên'],
    ['NV11', 'Phạm Thị Thảo', 'P10', 1, 100, 0, 0, 'Thủ quỹ'],
    ['NV12', 'Lưu Thị Định', 'P08', 1, 100, 0, 0, 'CB tín dụng']
  ],
  compliance: {
    items: [
      ['Lương ngạch bậc vị trí', true, true],
      ['Lương hiệu quả KPI', false, true],
      ['Tiền thưởng hiệu quả', false, true],
      ['Phụ cấp trách nhiệm/chức vụ', true, true],
      ['Điện thoại công việc', false, false],
      ['Ăn giữa ca (Định mức)', false, false],
      ['Trang phục công việc', false, false],
      ['Công tác phí', false, false],
      ['Xăng xe công vụ', false, false],
      ['Đào tạo nghiệp vụ', false, false],
      ['Thù lao HĐQT/BKS', false, true]
    ]
  },
  monthlyData: {
    '2027-01': {
      period: '2027-01',
      standardDays: 22,
      status: 'DRAFT',
      timesheets: {}
    }
  }
};

let data = structuredClone(defaultData);

/* -------------------------------------------------------------
 * LOAD & SAVE & FORMATTING HELPERS
 * ------------------------------------------------------------- */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      data = Object.assign(structuredClone(defaultData), parsed);
      if (parsed.params) data.params = Object.assign(structuredClone(defaultData.params), parsed.params);
      if (parsed.meta) data.meta = Object.assign(structuredClone(defaultData.meta), parsed.meta);
      if (parsed.officialFramework) data.officialFramework = Object.assign(structuredClone(defaultData.officialFramework), parsed.officialFramework);
      if (parsed.monthlyData) data.monthlyData = Object.assign(structuredClone(defaultData.monthlyData), parsed.monthlyData);
    }
  } catch (e) {
    console.warn('Lỗi đọc localStorage:', e);
  }
}

function save(showToast = false) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const timeStr = new Date().toLocaleTimeString('vi-VN') + ' ngày ' + new Date().toLocaleDateString('vi-VN');
    const el = document.getElementById('lastSaved');
    if (el) el.textContent = 'Đã lưu lúc: ' + timeStr;
    updateStatusBadges();
    if (showToast) alert('✅ Đã lưu dữ liệu thành công vào bộ nhớ máy!');
  } catch (e) {
    console.error('Lỗi ghi localStorage:', e);
  }
}

function money(n) {
  return moneyFmt.format(Math.round(Number(n) || 0)) + ' ₫';
}

function num(n) {
  return moneyFmt.format(Math.round(Number(n) || 0));
}

function pct(n) {
  return pctFmt.format((Number(n) || 0) * 100) + '%';
}

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function pos(code) {
  return data.positions.find(p => p[0] === code) || ['P00', 'Chưa rõ', 'Khác', 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0];
}

function updateStatusBadges() {
  const bFrame = document.getElementById('badgeFramework');
  if (bFrame) {
    if (data.officialFramework && data.officialFramework.locked) {
      bFrame.className = 'status-badge success';
      bFrame.innerHTML = `🔒 Đã chốt (${data.officialFramework.scenario})`;
    } else {
      bFrame.className = 'status-badge warn';
      bFrame.innerHTML = `⚠️ Khung: Chưa chốt (${data.meta.scenario})`;
    }
  }

  const bCloud = document.getElementById('badgeCloud');
  if (bCloud) {
    if (data.meta && data.meta.cloudUrl && data.meta.cloudUrl.startsWith('http')) {
      bCloud.className = 'status-badge online';
      bCloud.innerHTML = `☁️ Google Sheets: Sẵn sàng`;
    } else {
      bCloud.className = 'status-badge offline';
      bCloud.innerHTML = `💾 CSDL: Cục bộ (Local)`;
    }
  }
}

/* -------------------------------------------------------------
 * BUSINESS & PAYROLL CALCULATIONS
 * ------------------------------------------------------------- */
function calcPosition(p, scenario = data.meta.scenario, kpiComp = data.meta.kpiCompletion / 100) {
  const i = scenario === 'PA1' ? 5 : scenario === 'PA2' ? 6 : 7;
  const k = scenario === 'PA1' ? 8 : scenario === 'PA2' ? 9 : 10;
  const b = scenario === 'PA1' ? 11 : scenario === 'PA2' ? 12 : 13;

  const fixed = data.params.basicSalary * p[i];
  const kpi = fixed * p[k] * kpiComp;
  const bonus = fixed * p[b];
  const work = data.params.phone + data.params.meal + data.params.clothing + data.params.travel + data.params.fuel + data.params.training;

  return {
    fixed, kpi, bonus, work,
    total: fixed + kpi + bonus + work,
    head: p[4], name: p[1], code: p[0], coef: p[i], kpiRate: p[k], bonusRate: p[b]
  };
}

function govCalc(g, scenario = data.meta.scenario) {
  const p = pos(g[3]);
  const c = calcPosition(p, scenario);
  const allowance = Number(g[5]) || 0;
  const remuneration = Number(g[6]) || 0;
  const other = Number(g[7]) || 0;
  return {
    ...c,
    allowance,
    remuneration,
    other,
    totalWithGov: c.total + allowance + remuneration + other,
    govName: g[1],
    count: g[4]
  };
}

function totalByPositions(scenario = data.meta.scenario) {
  return data.positions
    .map(p => {
      const c = calcPosition(p, scenario);
      return { ...c, count: p[4], annual: c.total * p[4] * 12 };
    })
    .filter(x => x.count > 0);
}

function govTotals(scenario = data.meta.scenario) {
  return data.governance.reduce(
    (a, g) => {
      const x = govCalc(g, scenario);
      a.salary += x.fixed * x.count;
      a.kpi += x.kpi * x.count;
      a.bonus += x.bonus * x.count;
      a.work += x.work * x.count;
      a.allowance += x.allowance * x.count;
      a.remuneration += x.remuneration * x.count;
      a.total += x.totalWithGov * x.count;
      return a;
    },
    { salary: 0, kpi: 0, bonus: 0, work: 0, allowance: 0, remuneration: 0, total: 0 }
  );
}

/**
 * Tính toán bảng lương chi tiết của 1 cán bộ trong 1 tháng
 */
function calculateMonthlyStaffPayroll(staffRow, period = data.meta.currentPeriod) {
  const staffCode = staffRow[0];
  const staffName = staffRow[1];
  const posCode = staffRow[2];
  const active = Number(staffRow[3]) > 0;
  const numDependents = Number(staffRow[6]) || 0;

  // Lấy kịch bản chính thức đã chốt, nếu chưa chốt lấy PA đang chọn
  const activeScenario = (data.officialFramework && data.officialFramework.locked)
    ? data.officialFramework.scenario
    : data.meta.scenario;

  const p = pos(posCode);
  const c = calcPosition(p, activeScenario);

  // Đọc dữ liệu chấm công tháng
  const periodObj = data.monthlyData[period] || { standardDays: 22, timesheets: {} };
  const standardDays = Number(periodObj.standardDays) || 22;
  const ts = (periodObj.timesheets && periodObj.timesheets[staffCode]) || {
    workDays: standardDays,
    paidLeave: 0,
    unpaidLeave: 0,
    kpiPercent: Number(staffRow[4]) || 100,
    extraBonus: 0,
    penalty: 0,
    note: ''
  };

  const actualWorkDays = Math.max(0, Number(ts.workDays) || 0);
  const paidLeaveDays = Math.max(0, Number(ts.paidLeave) || 0);
  const unpaidLeaveDays = Math.max(0, Number(ts.unpaidLeave) || 0);
  const effectiveWorkDays = actualWorkDays + paidLeaveDays;
  const workRatio = standardDays > 0 ? (effectiveWorkDays / standardDays) : 1;

  // 1. Lương ngạch bậc vị trí tính theo ngày công
  const salaryFixed = Math.round(c.fixed * workRatio);

  // 2. Lương hiệu quả KPI
  const kpiPercent = Math.max(0, Number(ts.kpiPercent) || 0) / 100;
  const salaryKpi = Math.round(c.fixed * c.kpiRate * kpiPercent);

  // 3. Tiền thưởng
  const extraBonus = Number(ts.extraBonus) || 0;
  const salaryBonus = Math.round(c.bonus + extraBonus);

  // 4. Phụ cấp công việc (Ăn trưa trả theo ngày công thực tế)
  const mealDaily = standardDays > 0 ? (data.params.meal / standardDays) : 0;
  const actualMeal = Math.round(mealDaily * actualWorkDays);
  const otherWorkAllowance = data.params.phone + data.params.clothing + data.params.travel + data.params.fuel + data.params.training;
  const allowanceWork = actualMeal + otherWorkAllowance;

  // 5. Thù lao & Phụ cấp Quản trị HĐQT/BKS
  const gov = data.governance.find(g => g[3] === posCode);
  const allowanceGov = gov ? (Number(gov[5]) || 0) : 0;
  const remunerationGov = gov ? (Number(gov[6]) || 0) : 0;

  // 6. Khoản phạt / trừ khác
  const penalty = Number(ts.penalty) || 0;

  // TỔNG THU NHẬP GROSS
  const gross = salaryFixed + salaryKpi + salaryBonus + allowanceWork + allowanceGov + remunerationGov - penalty;

  // 7. Căn cứ đóng BHXH (Lương ngạch bậc + Phụ cấp trách nhiệm)
  const bhxhSalary = c.fixed + allowanceGov;
  const insuranceEmp = Math.round(bhxhSalary * (data.params.employeeBHXH + data.params.employeeBHYT + data.params.employeeBHTN)); // 10.5%
  const insuranceOrg = Math.round(bhxhSalary * (data.params.employerBHXH + data.params.employerBHYT + data.params.employerBHTN)); // 21.5%

  // 8. Thuế TNCN (PIT) tạm tính
  const exemptWork = actualMeal + data.params.travel + data.params.training; // Các khoản miễn thuế theo bản chất
  const incomeForTax = Math.max(0, gross - exemptWork);
  const totalDeductions = data.params.personalDeduction + (numDependents * data.params.dependentDeduction) + insuranceEmp;
  const taxableIncome = Math.max(0, incomeForTax - totalDeductions);
  const pit = Math.round(taxableIncome * data.params.pitEstimateRate);

  // 9. THỰC LĨNH (NET)
  const net = Math.max(0, gross - insuranceEmp - pit);

  return {
    code: staffCode,
    name: staffName,
    posCode: posCode,
    posName: p[1],
    active: active,
    standardDays,
    workDays: actualWorkDays,
    paidLeave: paidLeaveDays,
    unpaidLeave: unpaidLeaveDays,
    effectiveWorkDays,
    kpiPercent: kpiPercent * 100,
    salaryFixed,
    salaryKpi,
    salaryBonus,
    actualMeal,
    allowanceWork,
    allowanceGov,
    remunerationGov,
    gross,
    bhxhSalary,
    insuranceEmp,
    insuranceOrg,
    pit,
    net,
    note: ts.note || ''
  };
}

/* -------------------------------------------------------------
 * RENDERING ENGINE (7 MAIN VIEWS + PRINT PREPARATION)
 * ------------------------------------------------------------- */
function render() {
  updateStatusBadges();

  // Đồng bộ Toolbar
  const elDate = document.getElementById('effectiveDate');
  if (elDate) elDate.value = data.meta.effectiveDate;

  const elScen = document.getElementById('selectedScenario');
  if (elScen) elScen.value = data.meta.scenario;

  const elKpi = document.getElementById('kpiCompletion');
  if (elKpi) elKpi.value = data.meta.kpiCompletion;

  const elPeriod = document.getElementById('selectPayrollPeriod');
  if (elPeriod) elPeriod.value = data.meta.currentPeriod;

  const elStd = document.getElementById('inputStandardDays');
  if (elStd) {
    const curPeriodObj = data.monthlyData[data.meta.currentPeriod];
    elStd.value = (curPeriodObj && curPeriodObj.standardDays) || data.meta.standardDays || 22;
  }

  const elCloud = document.getElementById('cloudEndpointUrl');
  if (elCloud) elCloud.value = data.meta.cloudUrl || '';

  // Render các phân hệ
  renderDashboard();
  renderScenarios();
  renderLockFramework();
  renderTimesheet();
  renderMonthlyPayroll();
  renderPositions();
  renderGovernance();
  renderStaff();
  renderParams();
  renderCompliance();
}

/* 1. DASHBOARD */
function renderDashboard() {
  const rows = totalByPositions();
  const gov = govTotals();
  const salaryTotal = rows.reduce((s, x) => s + x.fixed * x.count, 0);
  const kpiTotal = rows.reduce((s, x) => s + x.kpi * x.count, 0);
  const bonusTotal = rows.reduce((s, x) => s + x.bonus * x.count, 0);
  const workTotal = rows.reduce((s, x) => s + x.work * x.count, 0);
  const total = salaryTotal + kpiTotal + bonusTotal + workTotal + gov.remuneration + gov.allowance;
  const head = rows.reduce((s, x) => s + x.count, 0);

  const cards = [
    ['Quy mô nhân sự', head + ' người'],
    ['Lương ngạch bậc', money(salaryTotal) + '/tháng'],
    ['Quỹ lương KPI', money(kpiTotal) + '/tháng'],
    ['Quỹ thưởng', money(bonusTotal) + '/tháng'],
    ['Phụ cấp công việc', money(workTotal + gov.allowance) + '/tháng'],
    ['Thù lao HĐQT/BKS', money(gov.remuneration) + '/tháng'],
    ['Tổng chi phí mô phỏng', money(total) + '/tháng'],
    ['Tổng quỹ cả năm', money(total * 12)]
  ];
  document.getElementById('summaryCards').innerHTML = cards
    .map(x => `<div class="card"><div class="k">${x[0]}</div><div class="v">${x[1]}</div></div>`)
    .join('');

  renderBars('positionChart', rows.map(x => [x.name, x.total]), false);

  const scenTotals = ['PA1', 'PA2', 'PA3'].map(s => {
    return (
      data.positions.reduce((sum, p) => sum + calcPosition(p, s, 1).total * p[4], 0) +
      gov.remuneration +
      gov.allowance
    ) * 12;
  });
  renderBars('scenarioChart', [['PA1 (Tiết kiệm)', scenTotals[0]], ['PA2 (Chuẩn 2027)', scenTotals[1]], ['PA3 (Tăng trưởng)', scenTotals[2]]], false);

  renderStack('costChart', [
    ['Lương cố định', salaryTotal],
    ['KPI', kpiTotal],
    ['Thưởng', bonusTotal],
    ['Phụ cấp công vụ', workTotal + gov.allowance],
    ['Thù lao quản trị', gov.remuneration]
  ]);

  renderBars('gapChart', rows.slice(0, 5).map(x => [x.name, x.total]), true);

  document.getElementById('summaryTable').innerHTML =
    '<thead><tr><th>Chỉ tiêu chi phí</th><th>Mức chi/tháng</th><th>Mức chi/năm</th><th>Tỷ trọng cơ cấu</th></tr></thead><tbody>' +
    [
      ['Lương ngạch bậc vị trí', salaryTotal],
      ['Lương hiệu quả KPI', kpiTotal],
      ['Tiền thưởng hiệu quả', bonusTotal],
      ['Phụ cấp & chi phí công việc', workTotal + gov.allowance],
      ['Thù lao HĐQT / BKS', gov.remuneration],
      ['TỔNG CỘNG QUỸ LƯƠNG & THU NHẬP', total]
    ]
      .map(
        r =>
          `<tr><td><b>${r[0]}</b></td><td class="num">${money(r[1])}</td><td class="num">${money(
            r[1] * 12
          )}</td><td class="num">${pct(r[1] / total)}</td></tr>`
      )
      .join('') +
    '</tbody>';
}

function renderBars(id, items, alt) {
  const el = document.getElementById(id);
  if (!el) return;
  const max = Math.max(...items.map(x => x[1]), 1);
  el.innerHTML = items
    .map(
      x =>
        `<div class="barrow"><div class="barlabel" title="${esc(x[0])}">${esc(x[0])}</div><div class="track"><div class="bar ${
          alt ? 'alt' : ''
        }" style="width:${Math.max(2, (x[1] / max) * 100)}%"></div></div><div class="barvalue">${money(x[1])}</div></div>`
    )
    .join('');
}

function renderStack(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  const total = items.reduce((s, x) => s + x[1], 0) || 1;
  const colors = ['#2f75b5', '#70ad47', '#f4b183', '#9dc3e6', '#8064a2'];
  el.innerHTML =
    '<div class="stack">' +
    items
      .map(
        (x, i) =>
          `<div class="seg" style="width:${(x[1] / total) * 100}%;background:${colors[i]}"></div>`
      )
      .join('') +
    '</div><div class="legend">' +
    items
      .map(
        (x, i) =>
          `<span><i style="background:${colors[i]}"></i>${x[0]}: ${pct(x[1] / total)}</span>`
      )
      .join('') +
    '</div>';
}

/* 2. SO SÁNH 3 PHƯƠNG ÁN */
function renderScenarios() {
  const rows = data.positions.map(p => {
    const vals = ['PA1', 'PA2', 'PA3'].map(s => calcPosition(p, s, 1).total);
    return [p[1], ...vals];
  });
  document.getElementById('scenarioTable').innerHTML =
    '<thead><tr><th>Vị trí công việc</th><th>PA1 (Tiết kiệm)</th><th>PA2 (Đề xuất 2027)</th><th>PA3 (Tăng trưởng)</th><th>Chênh lệch PA3 - PA1</th><th>Tỷ lệ tăng</th></tr></thead><tbody>' +
    rows
      .map(
        r =>
          `<tr><td><b>${r[0]}</b></td><td class="num">${money(r[1])}</td><td class="num">${money(
            r[2]
          )}</td><td class="num">${money(r[3])}</td><td class="num good">+${money(
            r[3] - r[1]
          )}</td><td class="num good">+${pct(r[3] / r[1] - 1)}</td></tr>`
      )
      .join('') +
    '</tbody>';
}

/* 3. CHỐT KHUNG LƯƠNG CHÍNH THỨC */
function renderLockFramework() {
  const fw = data.officialFramework || {};
  const isLocked = !!fw.locked;

  const card = document.getElementById('frameworkLockCard');
  if (!card) return;

  card.innerHTML = `
    <div class="lock-status-row">
      <div class="lock-info-badge">
        ${isLocked ? '🔒 <span style="color:#166534">ĐÃ CHỐT CHÍNH THỨC</span>' : '⚠️ <span style="color:#92400e">CHƯA CHỐT (ĐANG DÙNG KỊCH BẢN MÔ PHỎNG)</span>'}
      </div>
      <div>
        ${isLocked
          ? `<button id="btnUnlockFramework" class="btn danger-outline">🔓 Mở khóa để điều chỉnh</button>`
          : `<button id="btnLockFramework" class="btn success">🔒 Quyết định Chốt Khung Lương Này</button>`
        }
      </div>
    </div>
    <div class="lock-controls-grid">
      <div class="field">
        <label>Phương án chọn làm khung chính thức</label>
        <select id="fwScenarioSelect" ${isLocked ? 'disabled' : ''}>
          <option value="PA1" ${fw.scenario === 'PA1' ? 'selected' : ''}>PA1 – Tiết kiệm</option>
          <option value="PA2" ${fw.scenario === 'PA2' || !fw.scenario ? 'selected' : ''}>PA2 – Chuẩn 2027</option>
          <option value="PA3" ${fw.scenario === 'PA3' ? 'selected' : ''}>PA3 – Tăng trưởng</option>
        </select>
      </div>
      <div class="field">
        <label>Số hiệu Quyết định / Nghị quyết</label>
        <input id="fwDecisionNo" value="${esc(fw.decisionNo || '01/2027/QĐ-HĐQT')}" ${isLocked ? 'readonly' : ''}>
      </div>
      <div class="field">
        <label>Ngày ký ban hành</label>
        <input type="date" id="fwLockedDate" value="${fw.lockedDate || '2027-01-05'}" ${isLocked ? 'readonly' : ''}>
      </div>
      <div class="field">
        <label>Cơ quan phê duyệt</label>
        <input id="fwLockedBy" value="${esc(fw.lockedBy || 'HĐQT QTDND Yên Thọ')}" ${isLocked ? 'readonly' : ''}>
      </div>
    </div>
    <div class="small"><b>Ghi chú áp dụng:</b> Khung lương chính thức đã chốt sẽ được bảo vệ cố định và tự động áp dụng xuyên suốt vào Bảng chấm công và Bảng thanh toán lương hàng tháng.</div>
  `;

  // Gắn sự kiện
  const btnLock = document.getElementById('btnLockFramework');
  if (btnLock) {
    btnLock.onclick = () => {
      const scen = document.getElementById('fwScenarioSelect').value;
      const dec = document.getElementById('fwDecisionNo').value;
      const dDate = document.getElementById('fwLockedDate').value;
      const lBy = document.getElementById('fwLockedBy').value;

      data.officialFramework = {
        locked: true,
        scenario: scen,
        decisionNo: dec,
        lockedDate: dDate,
        lockedBy: lBy,
        note: 'Đã phê duyệt áp dụng chính thức'
      };
      save();
      render();
      alert(`✅ Đã chốt chính thức phương án ${scen} làm Khung lương của QTDND Yên Thọ!`);
    };
  }

  const btnUnlock = document.getElementById('btnUnlockFramework');
  if (btnUnlock) {
    btnUnlock.onclick = () => {
      if (confirm('Bạn có chắc chắn muốn mở khóa Khung lương để chỉnh sửa tham số không?')) {
        data.officialFramework.locked = false;
        save();
        render();
      }
    };
  }

  // Render bảng khung lương chính thức đang chọn
  const activeScen = fw.scenario || data.meta.scenario;
  const head = ['Mã', 'Chức danh vị trí', 'Khối', 'SL', 'Hệ số Lương', 'Lương cơ bản', 'Hệ số KPI', 'Tỷ lệ Thưởng', 'Chi phí công vụ', 'Tổng thu nhập chuẩn'];
  document.getElementById('officialPositionsTable').innerHTML =
    '<thead><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>' +
    data.positions
      .map(p => {
        const c = calcPosition(p, activeScen, 1);
        return `<tr>
          <td class="center"><b>${p[0]}</b></td>
          <td><b>${p[1]}</b></td>
          <td>${p[2]}</td>
          <td class="center">${p[4]}</td>
          <td class="num"><b>${c.coef}</b></td>
          <td class="num">${money(c.fixed)}</td>
          <td class="num">${pct(c.kpiRate)}</td>
          <td class="num">${pct(c.bonusRate)}</td>
          <td class="num">${money(c.work)}</td>
          <td class="num good"><b>${money(c.total)}</b></td>
        </tr>`;
      })
      .join('') +
    '</tbody>';
}

/* 4. CHẤM CÔNG & KPI HÀNG THÁNG */
function renderTimesheet() {
  const period = data.meta.currentPeriod || '2027-01';
  if (!data.monthlyData[period]) {
    data.monthlyData[period] = {
      period: period,
      standardDays: data.meta.standardDays || 22,
      timesheets: {}
    };
  }

  const periodObj = data.monthlyData[period];
  const standardDays = Number(periodObj.standardDays) || 22;

  const head = [
    'Mã NV', 'Họ và tên', 'Chức danh', 'Công chuẩn', 'Công đi làm', 'Nghỉ phép', 'Không lương', 'Tổng công', '% Công', 'KPI %', 'Thưởng thêm ₫', 'Trừ phạt ₫', 'Ghi chú'
  ];

  document.getElementById('timesheetTable').innerHTML =
    '<thead><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>' +
    data.staff
      .map((s, ri) => {
        const code = s[0];
        const name = s[1];
        const p = pos(s[2]);
        const ts = (periodObj.timesheets && periodObj.timesheets[code]) || {
          workDays: standardDays,
          paidLeave: 0,
          unpaidLeave: 0,
          kpiPercent: Number(s[4]) || 100,
          extraBonus: 0,
          penalty: 0,
          note: ''
        };

        const totalWork = Number(ts.workDays) + Number(ts.paidLeave);
        const workRatio = standardDays > 0 ? (totalWork / standardDays) : 1;

        return `<tr>
          <td class="center"><b>${code}</b></td>
          <td><b>${esc(name)}</b></td>
          <td>${p[1]}</td>
          <td class="center">${standardDays}</td>
          <td class="editable num"><input class="cell-input" type="number" min="0" max="31" step="0.5" data-ts-code="${code}" data-field="workDays" value="${ts.workDays}"></td>
          <td class="editable num"><input class="cell-input" type="number" min="0" max="31" step="0.5" data-ts-code="${code}" data-field="paidLeave" value="${ts.paidLeave}"></td>
          <td class="editable num"><input class="cell-input" type="number" min="0" max="31" step="0.5" data-ts-code="${code}" data-field="unpaidLeave" value="${ts.unpaidLeave}"></td>
          <td class="num"><b>${totalWork}</b></td>
          <td class="num ${workRatio >= 1 ? 'good' : 'danger'}">${pct(workRatio)}</td>
          <td class="editable num"><input class="cell-input" type="number" min="0" max="200" step="1" data-ts-code="${code}" data-field="kpiPercent" value="${ts.kpiPercent}"></td>
          <td class="editable num"><input class="cell-input" type="number" step="100000" data-ts-code="${code}" data-field="extraBonus" value="${ts.extraBonus}"></td>
          <td class="editable num"><input class="cell-input" type="number" step="100000" data-ts-code="${code}" data-field="penalty" value="${ts.penalty}"></td>
          <td class="editable"><input class="cell-input" data-ts-code="${code}" data-field="note" value="${esc(ts.note)}"></td>
        </tr>`;
      })
      .join('') +
    '</tbody>';

  // Lắng nghe sự kiện sửa ô chấm công
  document.querySelectorAll('[data-ts-code]').forEach(el => {
    el.onchange = () => {
      const code = el.dataset.tsCode;
      const field = el.dataset.field;
      let val = el.value;
      if (field !== 'note') val = Math.max(0, Number(val) || 0);

      if (!periodObj.timesheets[code]) {
        periodObj.timesheets[code] = {
          workDays: standardDays,
          paidLeave: 0,
          unpaidLeave: 0,
          kpiPercent: 100,
          extraBonus: 0,
          penalty: 0,
          note: ''
        };
      }
      periodObj.timesheets[code][field] = val;
      renderTimesheet();
      renderMonthlyPayroll();
    };
  });
}

/* 5. BẢNG LƯƠNG THÁNG & IN ẤN */
function renderMonthlyPayroll() {
  const period = data.meta.currentPeriod || '2027-01';
  const staffCalculations = data.staff.map(s => calculateMonthlyStaffPayroll(s, period));

  const totFixed = staffCalculations.reduce((a, b) => a + b.salaryFixed, 0);
  const totKpi = staffCalculations.reduce((a, b) => a + b.salaryKpi, 0);
  const totBonus = staffCalculations.reduce((a, b) => a + b.salaryBonus, 0);
  const totWork = staffCalculations.reduce((a, b) => a + b.allowanceWork, 0);
  const totGov = staffCalculations.reduce((a, b) => a + b.remunerationGov + b.allowanceGov, 0);
  const totGross = staffCalculations.reduce((a, b) => a + b.gross, 0);
  const totInsEmp = staffCalculations.reduce((a, b) => a + b.insuranceEmp, 0);
  const totPit = staffCalculations.reduce((a, b) => a + b.pit, 0);
  const totNet = staffCalculations.reduce((a, b) => a + b.net, 0);
  const totInsOrg = staffCalculations.reduce((a, b) => a + b.insuranceOrg, 0);
  const totTotalFund = totGross + totInsOrg;

  // Cards tóm tắt
  const cardsEl = document.getElementById('monthlySummaryCards');
  if (cardsEl) {
    cardsEl.innerHTML = [
      ['Tổng Quỹ Gross', money(totGross)],
      ['BHXH NLĐ (10.5%)', money(totInsEmp)],
      ['Thuế TNCN', money(totPit)],
      ['TỔNG THỰC LĨNH (NET)', money(totNet), true],
      ['BHXH Đơn vị (21.5%)', money(totInsOrg)],
      ['TỔNG CHI PHÍ QUỸ', money(totTotalFund)]
    ]
      .map(
        c =>
          `<div class="card ${c[2] ? 'highlight' : ''}"><div class="k">${c[0]}</div><div class="v ${
            c[2] ? 'net-amount' : ''
          }">${c[1]}</div></div>`
      )
      .join('');
  }

  // Bảng hiển thị Web
  const head = [
    'STT', 'Mã', 'Họ và tên', 'Chức danh', 'Công', 'Lương ngạch bậc', 'Lương KPI', 'Tiền thưởng', 'Phụ cấp CV', 'Thù lao QTK', 'Tổng Gross', 'BHXH (10.5%)', 'Thuế TNCN', 'THỰC LĨNH', 'BHXH Quỹ (21.5%)', 'Thao tác'
  ];

  document.getElementById('monthlyPayrollTable').innerHTML =
    '<thead><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>' +
    staffCalculations
      .map((c, i) => {
        return `<tr>
          <td class="center">${i + 1}</td>
          <td class="center"><b>${c.code}</b></td>
          <td><b>${esc(c.name)}</b></td>
          <td>${c.posName}</td>
          <td class="center">${c.workDays}</td>
          <td class="num">${money(c.salaryFixed)}</td>
          <td class="num">${money(c.salaryKpi)}</td>
          <td class="num">${money(c.salaryBonus)}</td>
          <td class="num">${money(c.allowanceWork)}</td>
          <td class="num">${money(c.remunerationGov + c.allowanceGov)}</td>
          <td class="num"><b>${money(c.gross)}</b></td>
          <td class="num danger">-${money(c.insuranceEmp)}</td>
          <td class="num danger">-${money(c.pit)}</td>
          <td class="num good"><b>${money(c.net)}</b></td>
          <td class="num">${money(c.insuranceOrg)}</td>
          <td class="center"><button class="btn" onclick="printIndividualPayslip('${c.code}')">🖨️ In phiếu</button></td>
        </tr>`;
      })
      .join('') +
    `<tr style="background:#f0fdf4; font-weight:bold;">
      <td colspan="4" class="center">TỔNG CỘNG TOÀN QUỸ (${staffCalculations.length} CBNV)</td>
      <td class="center">-</td>
      <td class="num">${money(totFixed)}</td>
      <td class="num">${money(totKpi)}</td>
      <td class="num">${money(totBonus)}</td>
      <td class="num">${money(totWork)}</td>
      <td class="num">${money(totGov)}</td>
      <td class="num"><b>${money(totGross)}</b></td>
      <td class="num danger">-${money(totInsEmp)}</td>
      <td class="num danger">-${money(totPit)}</td>
      <td class="num good" style="font-size:14px"><b>${money(totNet)}</b></td>
      <td class="num">${money(totInsOrg)}</td>
      <td class="center">-</td>
    </tr></tbody>`;
}

/* 6. VỊ TRÍ & HỆ SỐ */
function renderPositions() {
  const head = ['Mã', 'Vị trí', 'Nhóm', 'Bậc', 'SL', 'PA1 HS', 'PA2 HS', 'PA3 HS', 'PA1 KPI', 'PA2 KPI', 'PA3 KPI', 'PA1 thưởng', 'PA2 thưởng', 'PA3 thưởng'];
  document.getElementById('positionsTable').innerHTML =
    '<thead><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>' +
    data.positions
      .map(
        (p, ri) =>
          `<tr>${p
            .map(
              (v, ci) =>
                `<td class="${ci >= 5 ? 'editable num' : ''}"><input class="cell-input" data-pos="${ri}" data-ci="${ci}" value="${
                  ci >= 8 && ci <= 13 ? pct(v) : v
                }" ${ci < 5 ? 'readonly' : ''}></td>`
            )
            .join('')}</tr>`
      )
      .join('') +
    '</tbody>';

  document.querySelectorAll('[data-pos]').forEach(el => {
    el.onchange = () => {
      const ri = +el.dataset.pos;
      const ci = +el.dataset.ci;
      let v = Number(el.value.replace(/[^0-9.-]/g, '')) || 0;
      if (ci >= 8) v = v > 1 ? v / 100 : v;
      data.positions[ri][ci] = v;
      save();
      render();
    };
  });
}

/* 7. HĐQT / BKS */
function renderGovernance() {
  const head = ['Mã', 'Chức danh', 'Nhóm', 'Mã vị trí', 'SL', 'Phụ cấp trách nhiệm', 'Thù lao quản trị', 'Khoản khác', 'Tổng thù lao & phụ cấp'];
  document.getElementById('governanceTable').innerHTML =
    '<thead><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>' +
    data.governance
      .map((g, ri) => {
        const x = govCalc(g);
        return `<tr>
          <td>${g[0]}</td>
          <td><b>${g[1]}</b></td>
          <td>${g[2]}</td>
          <td>${g[3]}</td>
          <td class="center">${g[4]}</td>
          <td class="num editable"><input class="cell-input" data-gov="${ri}" data-ci="5" value="${g[5]}"></td>
          <td class="num editable"><input class="cell-input" data-gov="${ri}" data-ci="6" value="${g[6]}"></td>
          <td class="num editable"><input class="cell-input" data-gov="${ri}" data-ci="7" value="${g[7]}"></td>
          <td class="num"><b>${money(x.allowance + x.remuneration + x.other)}</b></td>
        </tr>`;
      })
      .join('') +
    '</tbody>';

  document.querySelectorAll('[data-gov]').forEach(el => {
    el.onchange = () => {
      data.governance[+el.dataset.gov][+el.dataset.ci] = Number(el.value.replace(/[^0-9.-]/g, '')) || 0;
      save();
      render();
    };
  });
}

/* 8. DANH SÁCH CBNV */
function renderStaff() {
  const head = ['Mã NV', 'Họ và tên', 'Mã vị trí', 'Vị trí công việc', 'Hoạt động', 'Số NPT', 'Ghi chú', 'Thao tác'];
  document.getElementById('staffTable').innerHTML =
    '<thead><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>' +
    data.staff
      .map((s, ri) => {
        const p = pos(s[2]);
        return `<tr>
          <td class="center"><b>${s[0]}</b></td>
          <td class="editable"><input class="cell-input" data-staff="${ri}" data-ci="1" value="${esc(s[1])}"></td>
          <td class="center">
            <select data-staff="${ri}" data-ci="2">
              ${data.positions.map(posItem => `<option value="${posItem[0]}" ${posItem[0] === s[2] ? 'selected' : ''}>${posItem[0]} - ${posItem[1]}</option>`).join('')}
            </select>
          </td>
          <td>${p[1]}</td>
          <td class="center editable"><input type="checkbox" data-staff-check="${ri}" ${Number(s[3]) > 0 ? 'checked' : ''}></td>
          <td class="num editable"><input class="cell-input" type="number" min="0" max="10" data-staff="${ri}" data-ci="6" value="${s[6] || 0}"></td>
          <td class="editable"><input class="cell-input" data-staff="${ri}" data-ci="7" value="${esc(s[7] || '')}"></td>
          <td class="center"><button class="btn danger-outline" onclick="deleteStaff(${ri})">Xóa</button></td>
        </tr>`;
      })
      .join('') +
    '</tbody>';

  document.querySelectorAll('[data-staff]').forEach(el => {
    el.onchange = () => {
      const ri = +el.dataset.staff;
      const ci = +el.dataset.ci;
      let val = el.value;
      if (ci === 6) val = Math.max(0, Number(val) || 0);
      data.staff[ri][ci] = val;
      save();
      render();
    };
  });

  document.querySelectorAll('[data-staff-check]').forEach(el => {
    el.onchange = () => {
      const ri = +el.dataset.staffCheck;
      data.staff[ri][3] = el.checked ? 1 : 0;
      save();
      render();
    };
  });
}

function deleteStaff(index) {
  if (confirm(`Bạn có chắc muốn xóa nhân viên ${data.staff[index][1]} khỏi danh sách?`)) {
    data.staff.splice(index, 1);
    save();
    render();
  }
}

/* 9. THAM SỐ CHUNG */
function renderParams() {
  const defs = [
    ['basicSalary', 'Lương cơ bản', '₫/tháng', 100000],
    ['kpiMax', 'KPI tối đa', '%', 0.01],
    ['bonusRate', 'Thưởng mô phỏng chuẩn', '%', 0.01],
    ['phone', 'Điện thoại công việc', '₫/tháng', 50000],
    ['meal', 'Ăn giữa ca (Định mức)', '₫/người/tháng', 100000],
    ['clothing', 'Trang phục công việc', '₫/tháng', 50000],
    ['travel', 'Công tác phí bình quân', '₫/tháng', 50000],
    ['fuel', 'Xăng xe di chuyển công vụ', '₫/tháng', 50000],
    ['training', 'Đào tạo bình quân', '₫/tháng', 50000],
    ['personalDeduction', 'Giảm trừ bản thân (PIT)', '₫/tháng', 500000],
    ['dependentDeduction', 'Giảm trừ người phụ thuộc', '₫/người/tháng', 200000],
    ['pitEstimateRate', 'Thuế PIT ước tính', '%', 0.01]
  ];
  document.getElementById('parameterForm').innerHTML = defs
    .map(
      ([k, l, u, step]) =>
        `<div class="field"><label>${l} <span class="small">· ${u}</span></label><input class="cell-input" data-param="${k}" type="number" step="${step}" value="${data.params[k]}"></div>`
    )
    .join('');

  document.querySelectorAll('[data-param]').forEach(el => {
    el.onchange = () => {
      data.params[el.dataset.param] = Math.max(0, Number(el.value) || 0);
      save();
      render();
    };
  });
}

/* 10. BHXH / PIT */
function renderCompliance() {
  const defs = [
    ['employerBHXH', 'BHXH đơn vị đóng (17.5%)'],
    ['employeeBHXH', 'BHXH NLĐ đóng (8.0%)'],
    ['employerBHYT', 'BHYT đơn vị đóng (3.0%)'],
    ['employeeBHYT', 'BHYT NLĐ đóng (1.5%)'],
    ['employerBHTN', 'BHTN đơn vị đóng (1.0%)'],
    ['employeeBHTN', 'BHTN NLĐ đóng (1.0%)']
  ];

  document.getElementById('insuranceForm').innerHTML = defs
    .map(
      ([k, l]) =>
        `<div class="field"><label>${l}</label><input class="cell-input" data-ins="${k}" type="number" step="0.1" value="${
          data.params[k] * 100
        }"><span class="small">%</span></div>`
    )
    .join('');

  document.querySelectorAll('[data-ins]').forEach(el => {
    el.onchange = () => {
      data.params[el.dataset.ins] = (Number(el.value) || 0) / 100;
      save();
      render();
    };
  });

  // Bảng phân loại căn cứ đóng
  const rows = data.compliance.items;
  document.getElementById('complianceTable').innerHTML =
    '<thead><tr><th>Khoản mục thu nhập / Chi phí</th><th>Tính vào BHXH?</th><th>Tính thuế PIT?</th><th>Căn cứ pháp lý & Bản chất kế toán</th></tr></thead><tbody>' +
    rows
      .map(
        (r, i) =>
          `<tr>
            <td><b>${r[0]}</b></td>
            <td class="center"><input type="checkbox" data-comp="${i}" data-c="1" ${r[1] ? 'checked' : ''}></td>
            <td class="center"><input type="checkbox" data-comp="${i}" data-c="2" ${r[2] ? 'checked' : ''}></td>
            <td>${complianceNote(r[0])}</td>
          </tr>`
      )
      .join('') +
    '</tbody>';

  document.querySelectorAll('[data-comp]').forEach(el => {
    el.onchange = () => {
      data.compliance.items[+el.dataset.comp][+el.dataset.c] = el.checked;
      save();
      render();
    };
  });

  // Bảng tổng hợp chi phí Bảo hiểm toàn Quỹ
  const period = data.meta.currentPeriod || '2027-01';
  const staffCalculations = data.staff.map(s => calculateMonthlyStaffPayroll(s, period));
  const totBhxhSalary = staffCalculations.reduce((a, b) => a + b.bhxhSalary, 0);
  const orgTotal = staffCalculations.reduce((a, b) => a + b.insuranceOrg, 0);
  const empTotal = staffCalculations.reduce((a, b) => a + b.insuranceEmp, 0);

  document.getElementById('insuranceSummaryTable').innerHTML = `
    <thead>
      <tr>
        <th>Khoản mục Bảo hiểm</th>
        <th>Tỷ lệ Đơn vị (%)</th>
        <th>Tiền Đơn vị gánh chịu / tháng</th>
        <th>Tỷ lệ NLĐ (%)</th>
        <th>Tiền trừ lương NLĐ / tháng</th>
        <th>Tổng tiền trích nộp Bảo hiểm</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>1. Bảo hiểm xã hội (BHXH)</b></td>
        <td class="num">${pct(data.params.employerBHXH)}</td>
        <td class="num">${money(totBhxhSalary * data.params.employerBHXH)}</td>
        <td class="num">${pct(data.params.employeeBHXH)}</td>
        <td class="num">${money(totBhxhSalary * data.params.employeeBHXH)}</td>
        <td class="num"><b>${money(totBhxhSalary * (data.params.employerBHXH + data.params.employeeBHXH))}</b></td>
      </tr>
      <tr>
        <td><b>2. Bảo hiểm y tế (BHYT)</b></td>
        <td class="num">${pct(data.params.employerBHYT)}</td>
        <td class="num">${money(totBhxhSalary * data.params.employerBHYT)}</td>
        <td class="num">${pct(data.params.employeeBHYT)}</td>
        <td class="num">${money(totBhxhSalary * data.params.employeeBHYT)}</td>
        <td class="num"><b>${money(totBhxhSalary * (data.params.employerBHYT + data.params.employeeBHYT))}</b></td>
      </tr>
      <tr>
        <td><b>3. Bảo hiểm thất nghiệp (BHTN)</b></td>
        <td class="num">${pct(data.params.employerBHTN)}</td>
        <td class="num">${money(totBhxhSalary * data.params.employerBHTN)}</td>
        <td class="num">${pct(data.params.employeeBHTN)}</td>
        <td class="num">${money(totBhxhSalary * data.params.employeeBHTN)}</td>
        <td class="num"><b>${money(totBhxhSalary * (data.params.employerBHTN + data.params.employeeBHTN))}</b></td>
      </tr>
      <tr style="background:#f1f5f9; font-weight:bold;">
        <td>TỔNG CỘNG NGHĨA VỤ BẢO HIỂM TOÀN QUỸ</td>
        <td class="num">21.5%</td>
        <td class="num" style="color:var(--navy); font-size:14px">${money(orgTotal)}</td>
        <td class="num">10.5%</td>
        <td class="num" style="color:var(--danger); font-size:14px">${money(empTotal)}</td>
        <td class="num good" style="font-size:14px">${money(orgTotal + empTotal)}</td>
      </tr>
    </tbody>
  `;
}

function complianceNote(name) {
  if (name.includes('Lương ngạch bậc')) return 'Thành phần cốt lõi của tiền lương, bắt buộc đóng BHXH & chịu thuế PIT.';
  if (name.includes('KPI')) return 'Lương hiệu quả theo kết quả công việc, chịu thuế PIT theo quy định.';
  if (name.includes('thưởng')) return 'Khoản thưởng theo kết quả SXKD có quy chế, không tính BHXH, chịu thuế PIT.';
  if (name.includes('trách nhiệm')) return 'Phụ cấp chức vụ/trách nhiệm gắn với chức danh quản trị, tính BHXH và PIT.';
  if (name.includes('Thù lao')) return 'Thù lao quản trị HĐQT/BKS theo dõi riêng, chịu thuế PIT theo biểu thu nhập vãng lai/tiền công.';
  if (name.includes('Ăn')) return 'Tiền ăn giữa ca chi đúng thực tế theo ngày công, không tính BHXH và miễn thuế PIT trong định mức.';
  if (name.includes('Điện thoại') || name.includes('Xăng xe') || name.includes('Trang phục') || name.includes('Công tác')) {
    return 'Khoán chi công vụ phục vụ trực tiếp hoạt động của Quỹ, có chứng từ hóa đơn, không chịu BHXH và không tính vào thuế TNCN.';
  }
  return 'Phân loại theo bản chất, điều kiện chi và hồ sơ chứng từ thực tế.';
}

/* -------------------------------------------------------------
 * PRINT ENGINE (IN BẢNG LƯƠNG A4 TOÀN QUỸ & IN PHIẾU LƯƠNG CÁ NHÂN)
 * ------------------------------------------------------------- */
function printFullPayroll() {
  const period = data.meta.currentPeriod || '2027-01';
  const periodObj = data.monthlyData[period] || { standardDays: 22 };
  const stdDays = periodObj.standardDays || 22;

  const [y, m] = period.split('-');
  document.getElementById('printFullSubtitle').textContent =
    `Kỳ chi trả: Tháng ${m} năm ${y} · Ngày công chuẩn: ${stdDays} ngày`;

  const staffCalculations = data.staff.map(s => calculateMonthlyStaffPayroll(s, period));
  const totFixed = staffCalculations.reduce((a, b) => a + b.salaryFixed, 0);
  const totKpi = staffCalculations.reduce((a, b) => a + b.salaryKpi, 0);
  const totBonus = staffCalculations.reduce((a, b) => a + b.salaryBonus, 0);
  const totWork = staffCalculations.reduce((a, b) => a + b.allowanceWork, 0);
  const totGov = staffCalculations.reduce((a, b) => a + b.remunerationGov + b.allowanceGov, 0);
  const totGross = staffCalculations.reduce((a, b) => a + b.gross, 0);
  const totInsEmp = staffCalculations.reduce((a, b) => a + b.insuranceEmp, 0);
  const totPit = staffCalculations.reduce((a, b) => a + b.pit, 0);
  const totNet = staffCalculations.reduce((a, b) => a + b.net, 0);
  const totInsOrg = staffCalculations.reduce((a, b) => a + b.insuranceOrg, 0);

  const headHtml = `
    <thead>
      <tr>
        <th rowspan="2">STT</th>
        <th rowspan="2">Họ và tên</th>
        <th rowspan="2">Chức vụ / Vị trí</th>
        <th rowspan="2">Công</th>
        <th colspan="5">Các khoản thu nhập (₫)</th>
        <th rowspan="2">Tổng Gross</th>
        <th colspan="2">Các khoản giảm trừ (₫)</th>
        <th rowspan="2">THỰC LĨNH (NET)</th>
        <th rowspan="2" style="width:70px">Ký nhận</th>
      </tr>
      <tr>
        <th>Lương ngạch bậc</th>
        <th>Lương KPI</th>
        <th>Tiền thưởng</th>
        <th>Phụ cấp CV</th>
        <th>Thù lao QTK</th>
        <th>BHXH (10.5%)</th>
        <th>Thuế TNCN</th>
      </tr>
    </thead>
  `;

  const bodyHtml =
    '<tbody>' +
    staffCalculations
      .map((c, i) => `
        <tr>
          <td class="center">${i + 1}</td>
          <td><b>${esc(c.name)}</b></td>
          <td>${c.posName}</td>
          <td class="center">${c.workDays}</td>
          <td class="num">${num(c.salaryFixed)}</td>
          <td class="num">${num(c.salaryKpi)}</td>
          <td class="num">${num(c.salaryBonus)}</td>
          <td class="num">${num(c.allowanceWork)}</td>
          <td class="num">${num(c.remunerationGov + c.allowanceGov)}</td>
          <td class="num"><b>${num(c.gross)}</b></td>
          <td class="num">-${num(c.insuranceEmp)}</td>
          <td class="num">-${num(c.pit)}</td>
          <td class="num"><b>${num(c.net)}</b></td>
          <td></td>
        </tr>
      `)
      .join('') +
    `
      <tr style="font-weight:bold; background:#eee">
        <td colspan="4" class="center">TỔNG CỘNG TOÀN QUỸ</td>
        <td class="num">${num(totFixed)}</td>
        <td class="num">${num(totKpi)}</td>
        <td class="num">${num(totBonus)}</td>
        <td class="num">${num(totWork)}</td>
        <td class="num">${num(totGov)}</td>
        <td class="num">${num(totGross)}</td>
        <td class="num">-${num(totInsEmp)}</td>
        <td class="num">-${num(totPit)}</td>
        <td class="num">${num(totNet)}</td>
        <td></td>
      </tr>
    </tbody>
  `;

  document.getElementById('printFullTable').innerHTML = headHtml + bodyHtml;

  // Text tổng hợp bằng chữ
  document.getElementById('printFullSummaryText').innerHTML = `
    <div>- <b>Tổng số tiền thực lĩnh chi trả (bằng chữ):</b> <i>${moneyToWords(totNet)}</i>.</div>
    <div>- <b>Chi phí Bảo hiểm đơn vị (21.5%) nộp cho cơ quan BHXH:</b> ${money(totInsOrg)}.</div>
    <div>- <b>Tổng chi phí nhân sự thực tế trong tháng của Quỹ:</b> ${money(totGross + totInsOrg)}.</div>
  `;

  document.getElementById('sigDateBlock').textContent = `Quý Lộc, ngày ... tháng ${m} năm ${y}`;

  // Ẩn phiếu cá nhân, hiện bảng toàn quỹ
  document.getElementById('printAreaPayslip').classList.add('hidden-print');
  document.getElementById('printAreaFull').classList.remove('hidden-print');

  window.print();
}

function printIndividualPayslip(staffCode) {
  const period = data.meta.currentPeriod || '2027-01';
  const staff = data.staff.find(s => s[0] === staffCode);
  if (!staff) return alert('Không tìm thấy cán bộ: ' + staffCode);

  const c = calculateMonthlyStaffPayroll(staff, period);
  const [y, m] = period.split('-');

  document.getElementById('slipTitle').textContent = `PHIẾU BÁO THANH TOÁN THU NHẬP`;
  document.getElementById('slipSubtitle').textContent = `Kỳ chi trả: Tháng ${m} năm ${y}`;

  document.getElementById('slipStaffInfo').innerHTML = `
    <div><b>Họ và tên:</b> ${esc(c.name)}</div>
    <div><b>Mã nhân sự:</b> ${c.code}</div>
    <div><b>Chức danh công việc:</b> ${c.posName}</div>
    <div><b>Số ngày công thực tế:</b> ${c.workDays} / ${c.standardDays} ngày</div>
    <div><b>Tỷ lệ hoàn thành KPI:</b> ${c.kpiPercent}%</div>
    <div><b>Giảm trừ người phụ thuộc:</b> ${staff[6] || 0} người</div>
  `;

  document.getElementById('slipBreakdownTable').innerHTML = `
    <thead>
      <tr>
        <th>Khoản mục chi trả & giảm trừ</th>
        <th>Số tiền (VNĐ)</th>
        <th>Ghi chú</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1. Lương ngạch bậc (theo ngày công)</td>
        <td class="num">${money(c.salaryFixed)}</td>
        <td>Hệ số vị trí × Lương cơ bản × (% công)</td>
      </tr>
      <tr>
        <td>2. Lương hiệu quả KPI</td>
        <td class="num">${money(c.salaryKpi)}</td>
        <td>Đánh giá hoàn thành ${c.kpiPercent}% KPI</td>
      </tr>
      <tr>
        <td>3. Tiền thưởng hiệu quả</td>
        <td class="num">${money(c.salaryBonus)}</td>
        <td>Theo quy chế thi đua khen thưởng</td>
      </tr>
      <tr>
        <td>4. Phụ cấp công việc (Ăn trưa, xăng xe, ĐT...)</td>
        <td class="num">${money(c.allowanceWork)}</td>
        <td>Ăn trưa tính theo ngày công thực tế</td>
      </tr>
      ${c.remunerationGov || c.allowanceGov ? `
        <tr>
          <td>5. Phụ cấp trách nhiệm & Thù lao HĐQT/BKS</td>
          <td class="num">${money(c.remunerationGov + c.allowanceGov)}</td>
          <td>Nhiệm vụ quản trị / kiểm soát</td>
        </tr>
      ` : ''}
      <tr style="font-weight:bold; background:#f9f9f9">
        <td>TỔNG THU NHẬP TRƯỚC GIẢM TRỪ (GROSS)</td>
        <td class="num"><b>${money(c.gross)}</b></td>
        <td></td>
      </tr>
      <tr>
        <td>6. Trừ Bảo hiểm NLĐ (BHXH 8%, BHYT 1.5%, BHTN 1%)</td>
        <td class="num danger">-${money(c.insuranceEmp)}</td>
        <td>Trích nộp 10.5% lương đóng BHXH</td>
      </tr>
      <tr>
        <td>7. Tạm khấu trừ Thuế Thu nhập cá nhân (PIT)</td>
        <td class="num danger">-${money(c.pit)}</td>
        <td>Sau khi trừ gia cảnh và bảo hiểm</td>
      </tr>
      <tr style="font-weight:bold; background:#eef7ee">
        <td>8. SỐ TIỀN THỰC LĨNH (NET TAKE-HOME)</td>
        <td class="num good" style="font-size:14px"><b>${money(c.net)}</b></td>
        <td>Chuyển khoản / Tiền mặt</td>
      </tr>
    </tbody>
  `;

  document.getElementById('slipNetText').innerHTML = `
    Số tiền thực nhận: <b>${money(c.net)}</b><br>
    <i>(Bằng chữ: ${moneyToWords(c.net)})</i>
  `;

  document.getElementById('slipStaffSignName').textContent = c.name;
  document.getElementById('slipDateSign').textContent = `Quý Lộc, ngày ... tháng ${m} năm ${y}`;

  // Ẩn bảng toàn quỹ, chỉ hiện phiếu
  document.getElementById('printAreaFull').classList.add('hidden-print');
  document.getElementById('printAreaPayslip').classList.remove('hidden-print');

  window.print();
}

/**
 * Đọc số tiền tiếng Việt thành chữ chuẩn mực
 */
function moneyToWords(num) {
  num = Math.round(Number(num) || 0);
  if (num === 0) return 'Không đồng chẵn';
  if (num < 0) return 'Âm ' + moneyToWords(-num);

  const words = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

  let str = '';
  let unitIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      const chunkStr = readChunk(chunk, num >= 1000);
      str = chunkStr + ' ' + units[unitIndex] + ' ' + str;
    }
    num = Math.floor(num / 1000);
    unitIndex++;
  }

  str = str.trim() + ' đồng chẵn';
  return str.charAt(0).toUpperCase() + str.slice(1);

  function readChunk(n, hasHigher) {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    let res = '';

    if (h > 0 || hasHigher) {
      res += words[h] + ' trăm ';
    }

    if (t === 0 && u > 0) {
      if (h > 0 || hasHigher) res += 'lẻ ';
      res += words[u];
    } else if (t === 1) {
      res += 'mười ';
      if (u === 1) res += 'một';
      else if (u === 5) res += 'lăm';
      else if (u > 0) res += words[u];
    } else if (t > 1) {
      res += words[t] + ' mươi ';
      if (u === 1) res += 'mốt';
      else if (u === 5) res += 'lăm';
      else if (u > 0) res += words[u];
    }

    return res.trim();
  }
}

/* -------------------------------------------------------------
 * CLOUD SYNC & LOCAL BACKUP ENGINE
 * ------------------------------------------------------------- */
async function testCloudConnection() {
  const url = (document.getElementById('cloudEndpointUrl').value || '').trim();
  const statusEl = document.getElementById('cloudStatusMsg');
  if (!url || !url.startsWith('http')) {
    statusEl.className = 'cloud-status-msg error';
    statusEl.textContent = '❌ Vui lòng nhập đúng đường dẫn Web App Google Apps Script!';
    return;
  }

  statusEl.className = 'cloud-status-msg';
  statusEl.textContent = '⏳ Đang kiểm tra kết nối tới Google Sheets...';

  try {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=ping');
    const json = await res.json();
    if (json.status === 'success') {
      data.meta.cloudUrl = url;
      save();
      updateStatusBadges();
      statusEl.className = 'cloud-status-msg success';
      statusEl.textContent = '✅ Kết nối Google Sheets thành công lúc ' + new Date().toLocaleTimeString('vi-VN');
    } else {
      throw new Error(json.message || 'Lỗi phản hồi từ server');
    }
  } catch (err) {
    statusEl.className = 'cloud-status-msg error';
    statusEl.textContent = '❌ Lỗi kết nối: ' + err.message + ' (Vui lòng kiểm tra lại quyền truy cập Anyone trên Apps Script)';
  }
}

async function pushAllToCloud() {
  const url = (data.meta.cloudUrl || '').trim();
  const statusEl = document.getElementById('cloudStatusMsg');
  if (!url) {
    alert('Vui lòng nhập và kiểm tra kết nối URL Google Apps Script trước!');
    return;
  }

  statusEl.className = 'cloud-status-msg';
  statusEl.textContent = '⏳ Đang đồng bộ toàn bộ dữ liệu lên Google Sheets...';

  try {
    // Chuẩn bị payload
    const payload = {
      meta: data.meta,
      params: data.params,
      officialFramework: data.officialFramework,
      positions: data.positions,
      governance: data.governance,
      staff: data.staff,
      monthlyData: data.monthlyData
    };

    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'syncAll', payload: payload })
    });
    const json = await res.json();
    if (json.status === 'success') {
      data.meta.lastSync = new Date().toISOString();
      save();
      statusEl.className = 'cloud-status-msg success';
      statusEl.textContent = '✅ Đã lưu đồng bộ CSDL Google Sheets thành công!';
      alert('✅ Đã đồng bộ thành công lên Google Sheets vĩnh viễn!');
    } else {
      throw new Error(json.message || 'Lỗi ghi dữ liệu');
    }
  } catch (err) {
    statusEl.className = 'cloud-status-msg error';
    statusEl.textContent = '❌ Lỗi đồng bộ Cloud: ' + err.message;
  }
}

async function pullFromCloud() {
  const url = (data.meta.cloudUrl || '').trim();
  const statusEl = document.getElementById('cloudStatusMsg');
  if (!url) {
    alert('Vui lòng cấu hình URL Google Apps Script!');
    return;
  }

  if (!confirm('Tải dữ liệu từ Google Sheets sẽ ghi đè lên dữ liệu cục bộ hiện tại. Tiếp tục?')) return;

  statusEl.className = 'cloud-status-msg';
  statusEl.textContent = '⏳ Đang tải dữ liệu từ Google Sheets...';

  try {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=getData');
    const json = await res.json();
    if (json.status === 'success' && json.data) {
      if (json.data.positions && json.data.positions.length > 0) data.positions = json.data.positions;
      if (json.data.governance && json.data.governance.length > 0) data.governance = json.data.governance;
      if (json.data.staff && json.data.staff.length > 0) data.staff = json.data.staff;
      if (json.data.params) Object.assign(data.params, json.data.params);
      if (json.data.officialFramework) data.officialFramework = json.data.officialFramework;
      if (json.data.monthlyData) Object.assign(data.monthlyData, json.data.monthlyData);

      save();
      render();
      statusEl.className = 'cloud-status-msg success';
      statusEl.textContent = '✅ Đã cập nhật dữ liệu từ Google Sheets thành công!';
      alert('✅ Đã tải và cập nhật thành công dữ liệu từ Google Sheets!');
    } else {
      throw new Error(json.message || 'Không có dữ liệu trả về');
    }
  } catch (err) {
    statusEl.className = 'cloud-status-msg error';
    statusEl.textContent = '❌ Lỗi tải dữ liệu: ' + err.message;
  }
}

function exportJson() {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `QTDND_YenTho_Luong_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && (parsed.positions || parsed.params)) {
        data = Object.assign(structuredClone(defaultData), parsed);
        save();
        render();
        alert('✅ Đã khôi phục dữ liệu từ file JSON thành công!');
      } else {
        alert('❌ File JSON không đúng định dạng của hệ thống!');
      }
    } catch (err) {
      alert('❌ Lỗi đọc file JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/* -------------------------------------------------------------
 * EVENT HANDLERS & INITIALIZATION
 * ------------------------------------------------------------- */
function initTabs() {
  document.querySelectorAll('.tabs button').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('.tabs button').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const tabTarget = document.getElementById(b.dataset.tab);
      if (tabTarget) tabTarget.classList.add('active');
    };
  });
}

function setupGlobalEvents() {
  // Toolbar controls
  const elDate = document.getElementById('effectiveDate');
  if (elDate) {
    elDate.onchange = e => {
      data.meta.effectiveDate = e.target.value;
      save();
    };
  }

  // SỬA LỖI DROPDOWN SCENARIO
  const elScen = document.getElementById('selectedScenario');
  if (elScen) {
    elScen.onchange = e => {
      data.meta.scenario = e.target.value;
      save();
      render();
    };
  }

  const elKpi = document.getElementById('kpiCompletion');
  if (elKpi) {
    elKpi.onchange = e => {
      data.meta.kpiCompletion = Math.max(0, Number(e.target.value) || 0);
      save();
      render();
    };
  }

  // Top action buttons
  document.getElementById('btnQuickSave').onclick = () => {
    save(true);
    if (data.meta.cloudUrl) {
      pushAllToCloud();
    }
  };

  document.getElementById('btnQuickPrint').onclick = () => {
    printFullPayroll();
  };

  document.getElementById('btnPrintFullPayroll').onclick = () => {
    printFullPayroll();
  };

  document.getElementById('btnReset').onclick = () => {
    if (confirm('Khôi phục toàn bộ số liệu về mặc định ban đầu? (Dữ liệu đã sửa chưa sao lưu sẽ mất)')) {
      data = structuredClone(defaultData);
      save();
      render();
    }
  };

  // Timesheet toolbar
  document.getElementById('selectPayrollPeriod').onchange = e => {
    data.meta.currentPeriod = e.target.value;
    if (!data.monthlyData[data.meta.currentPeriod]) {
      data.monthlyData[data.meta.currentPeriod] = {
        period: data.meta.currentPeriod,
        standardDays: 22,
        timesheets: {}
      };
    }
    save();
    renderTimesheet();
    renderMonthlyPayroll();
  };

  document.getElementById('inputStandardDays').onchange = e => {
    const days = Math.max(1, Number(e.target.value) || 22);
    data.meta.standardDays = days;
    const period = data.meta.currentPeriod;
    if (data.monthlyData[period]) {
      data.monthlyData[period].standardDays = days;
    }
    save();
    renderTimesheet();
    renderMonthlyPayroll();
  };

  document.getElementById('btnFillStandardDays').onclick = () => {
    const period = data.meta.currentPeriod;
    const std = data.monthlyData[period].standardDays || 22;
    data.staff.forEach(s => {
      const code = s[0];
      if (!data.monthlyData[period].timesheets[code]) {
        data.monthlyData[period].timesheets[code] = {};
      }
      data.monthlyData[period].timesheets[code].workDays = std;
      data.monthlyData[period].timesheets[code].paidLeave = 0;
      data.monthlyData[period].timesheets[code].unpaidLeave = 0;
      data.monthlyData[period].timesheets[code].kpiPercent = 100;
    });
    save();
    renderTimesheet();
    renderMonthlyPayroll();
    alert(`✅ Đã điền chuẩn ${std} ngày công và 100% KPI cho toàn bộ ${data.staff.length} cán bộ!`);
  };

  document.getElementById('btnSaveTimesheet').onclick = () => {
    save(true);
  };

  // Thêm nhân viên
  document.getElementById('addStaff').onclick = () => {
    const n = data.staff.length + 1;
    const newCode = 'NV' + String(n).padStart(2, '0');
    data.staff.push([newCode, 'Cán bộ mới ' + n, 'P08', 1, 100, 0, 0, 'Nhân sự bổ sung']);
    save();
    render();
  };

  // Xuất CSV danh sách nhân sự
  document.getElementById('exportCsv').onclick = () => {
    const activeScen = (data.officialFramework && data.officialFramework.locked) ? data.officialFramework.scenario : data.meta.scenario;
    const rows = [['Mã NV', 'Họ và tên', 'Mã vị trí', 'Tên vị trí', 'Trạng thái', 'Hệ số', 'Lương cố định', 'KPI chuẩn', 'Thưởng chuẩn', 'Số NPT', 'Ghi chú']];
    data.staff.forEach(s => {
      const c = calcPosition(pos(s[2]), activeScen, 1);
      rows.push([s[0], s[1], s[2], c.name, s[3] ? 'Đang làm' : 'Nghỉ', c.coef, c.fixed, c.kpi, c.bonus, s[6] || 0, s[7] || '']);
    });
    downloadCsv(rows, `Danh_Sach_CBNV_QTDND_YenTho_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Xuất CSV Bảng lương tháng
  document.getElementById('btnExportMonthlyCsv').onclick = () => {
    const period = data.meta.currentPeriod || '2027-01';
    const staffCalculations = data.staff.map(s => calculateMonthlyStaffPayroll(s, period));
    const rows = [
      ['STT', 'Mã NV', 'Họ và tên', 'Chức danh', 'Công chuẩn', 'Công thực', 'Lương ngạch bậc', 'Lương KPI', 'Tiền thưởng', 'Phụ cấp công vụ', 'Thù lao QTK', 'Tổng Gross', 'BHXH NLĐ (10.5%)', 'Thuế TNCN', 'Thực Lĩnh Net', 'BHXH Đơn vị (21.5%)']
    ];
    staffCalculations.forEach((c, idx) => {
      rows.push([
        idx + 1, c.code, c.name, c.posName, c.standardDays, c.workDays,
        c.salaryFixed, c.salaryKpi, c.salaryBonus, c.allowanceWork, c.remunerationGov + c.allowanceGov,
        c.gross, c.insuranceEmp, c.pit, c.net, c.insuranceOrg
      ]);
    });
    downloadCsv(rows, `Bang_Luong_QTDND_YenTho_${period}.csv`);
  };

  // Cloud Sync events
  document.getElementById('btnTestCloud').onclick = testCloudConnection;
  document.getElementById('btnPushCloud').onclick = pushAllToCloud;
  document.getElementById('btnPullCloud').onclick = pullFromCloud;
  document.getElementById('cloudEndpointUrl').onchange = e => {
    data.meta.cloudUrl = e.target.value.trim();
    save();
  };

  // Backup JSON events
  document.getElementById('btnExportJson').onclick = exportJson;
  document.getElementById('fileImportJson').onchange = e => {
    if (e.target.files && e.target.files[0]) {
      importJson(e.target.files[0]);
    }
  };
}

function downloadCsv(rows, filename) {
  const csv = '\ufeff' + rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = filename;
  a.click();
}

// Khởi chạy ứng dụng
load();
initTabs();
setupGlobalEvents();
render();
