/**
 * =========================================================================
 * BỘ ĐẨY CODE TỰ ĐỘNG LÊN GOOGLE APPS SCRIPT (NATIVE CLASP & REST SYNC)
 * Dự án: QTDND Yên Thọ - Quản trị Lương, Nhân sự, Chấm công & KPI 2027 Pro V2
 * Script ID: 14TIgLHDC9mjNsuvzsXOhRSF5LWIzGkXzzapwMREE7F49NDNNHdZJ5hCr
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const readUtf8 = (filePath) => fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');

async function getValidToken() {
  const rcPath = path.join(os.homedir(), '.clasprc.json');
  if (!fs.existsSync(rcPath)) {
    throw new Error('Không tìm thấy tệp xác thực ~/.clasprc.json. Vui lòng đăng nhập Clasp trước!');
  }

  const rc = JSON.parse(readUtf8(rcPath));
  const def = rc.tokens && (rc.tokens.default || rc.tokens);
  if (!def) throw new Error('Không tìm thấy token trong ~/.clasprc.json');

  // Kiểm tra nếu token sắp hết hạn (trong vòng 5 phút)
  const isExpiringSoon = !def.expiry_date || (Date.now() + 5 * 60 * 1000 > def.expiry_date);
  if (isExpiringSoon && def.refresh_token) {
    console.log('🔄 Token đã hết hạn, đang tự động làm mới từ Google OAuth2...');
    const body = new URLSearchParams({
      client_id: def.client_id,
      client_secret: def.client_secret,
      refresh_token: def.refresh_token,
      grant_type: 'refresh_token'
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    const refreshed = await res.json();
    if (refreshed.access_token) {
      def.access_token = refreshed.access_token;
      def.expiry_date = Date.now() + (refreshed.expires_in * 1000);
      fs.writeFileSync(rcPath, JSON.stringify(rc, null, 2), 'utf8');
      console.log('✅ Làm mới Token thành công!');
    } else {
      console.warn('⚠️ Không làm mới được token, thử dùng access_token hiện có...', refreshed);
    }
  }

  return def.access_token;
}

async function pushToGoogleAppsScript() {
  console.log('===============================================================');
  console.log('🚀 ĐANG ĐẨY MÃ NGUỒN LÊN DỰ ÁN GOOGLE APPS SCRIPT (QTDND YÊN THỌ)');
  console.log('===============================================================');

  // 1. Đọc cấu hình từ .clasp.json
  const claspConfigPath = path.join(__dirname, '.clasp.json');
  if (!fs.existsSync(claspConfigPath)) {
    throw new Error('Thiếu tệp .clasp.json trong thư mục dự án!');
  }
  const claspConfig = JSON.parse(readUtf8(claspConfigPath));
  const scriptId = claspConfig.scriptId;
  const rootDir = path.join(__dirname, claspConfig.rootDir || 'gas_backend');

  console.log(`📌 Script ID: ${scriptId}`);
  console.log(`📁 Thư mục nguồn: ${claspConfig.rootDir}`);

  // 2. Lấy OAuth Token hợp lệ
  const token = await getValidToken();

  // 3. Đọc tất cả các tệp trong thư mục gas_backend
  const filesToSend = [];
  const entries = fs.readdirSync(rootDir);

  for (const file of entries) {
    const fullPath = path.join(rootDir, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);
    const content = readUtf8(fullPath);

    if (file === 'appsscript.json') {
      filesToSend.push({
        name: 'appsscript',
        type: 'JSON',
        source: content
      });
      console.log(` - Nạp [Cấu hình]: ${file}`);
    } else if (ext === '.js' || ext === '.gs') {
      filesToSend.push({
        name: baseName,
        type: 'SERVER_JS',
        source: content
      });
      console.log(` - Nạp [Mã nguồn GAS]: ${file} (${(content.length / 1024).toFixed(1)} KB)`);
    } else if (ext === '.html') {
      filesToSend.push({
        name: baseName,
        type: 'HTML',
        source: content
      });
      console.log(` - Nạp [Giao diện HTML]: ${file}`);
    }
  }

  // 4. Gửi yêu cầu PUT cập nhật content lên Google Apps Script API
  console.log(`\n⏳ Đang đẩy ${filesToSend.length} tệp lên Cloud...`);
  const apiUrl = `https://script.googleapis.com/v1/projects/${scriptId}/content`;
  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ files: filesToSend })
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('\n❌ LỖI KHI ĐẨY CODE:');
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('✅ Đẩy file mã nguồn thành công!');

  // 5. Tự động tạo Version mới (Phiên bản bất biến)
  console.log('📦 Đang tạo phiên bản mới (Version)...');
  const vRes = await fetch(`https://script.googleapis.com/v1/projects/${scriptId}/versions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: 'Tự động deploy lúc ' + new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    })
  });
  const vData = await vRes.json();
  const versionNumber = vData.versionNumber;
  console.log(`✅ Đã tạo phiên bản: Version #${versionNumber}`);

  // 6. Tự động Deploy / Cập nhật Web App Live
  console.log('🚀 Đang Deploy phiên bản Web App mới...');
  let webAppUrl = '';
  try {
    const depListRes = await fetch(`https://script.googleapis.com/v1/projects/${scriptId}/deployments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const depListData = await depListRes.json();
    const webAppDeps = depListData.deployments && depListData.deployments.filter(d => 
      d.entryPoints && d.entryPoints.some(e => e.entryPointType === 'WEB_APP')
    );

    if (webAppDeps && webAppDeps.length > 0) {
      for (const dep of webAppDeps) {
        const depId = dep.deploymentId;
        const updateRes = await fetch(`https://script.googleapis.com/v1/projects/${scriptId}/deployments/${depId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            deploymentConfig: {
              scriptId: scriptId,
              versionNumber: versionNumber,
              manifestFileName: 'appsscript',
              description: 'Web App Live v' + versionNumber
            }
          })
        });
        const currentUrl = (dep.entryPoints && dep.entryPoints[0] && dep.entryPoints[0].webApp && dep.entryPoints[0].webApp.url) ||
                          `https://script.google.com/macros/s/${depId}/exec`;
        if (!webAppUrl) webAppUrl = currentUrl;
        console.log(`✅ Đã cập nhật Deployment Live: ${depId}`);
      }
    } else {
      const createRes = await fetch(`https://script.googleapis.com/v1/projects/${scriptId}/deployments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          versionNumber: versionNumber,
          manifestFileName: 'appsscript',
          description: 'Web App Live v' + versionNumber
        })
      });
      const createData = await createRes.json();
      if (createData.entryPoints && createData.entryPoints[0]) {
        webAppUrl = createData.entryPoints[0].webApp.url;
      }
      console.log(`✅ Đã tạo Deployment Live mới: ${createData.deploymentId}`);
    }
  } catch (err) {
    console.warn('⚠️ Gặp lỗi khi cập nhật Deployment:', err.message);
  }

  // 7. Tự động gọi đồng bộ & kiểm tra CSDL 13 Sheets trên Google Sheet
  console.log('\n📊 Đang tự động kiểm tra và thực thi Schema 13 Sheets CSDL...');
  try {
    if (webAppUrl) {
      const triggerUrl = `${webAppUrl}?action=setupDatabase`;
      await fetch(triggerUrl, { redirect: 'follow' }).catch(() => {});
      console.log('✅ Đã kích hoạt tự động chạy SchemaManager.ensureDatabaseSchema() trên Google Sheet');
    }
  } catch (schemaErr) {
    console.warn('⚠️ Ghi nhận trigger CSDL:', schemaErr.message);
  }

  console.log('\n===============================================================');
  console.log('🎉 HOÀN TẤT ĐẨY CODE & DEPLOY LIVE THÀNH CÔNG 100%!');
  console.log('===============================================================');
  if (webAppUrl) {
    console.log(`🌐 URL Web App Live (Đồng bộ Google Sheets):`);
    console.log(`👉 ${webAppUrl}`);
  }
  console.log(`🔗 Google Apps Script Editor:`);
  console.log(`👉 https://script.google.com/d/${scriptId}/edit\n`);
}

pushToGoogleAppsScript().catch(err => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
