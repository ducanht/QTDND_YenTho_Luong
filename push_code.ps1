# =========================================================================
# SCRIPT ĐẨY MÃ NGUỒN TỰ ĐỘNG LÊN GOOGLE APPS SCRIPT (CLASP PUSH)
# Dự án: QTDND Yên Thọ - Quản trị Lương, Nhân sự & KPI 2027 Pro V2
# Script ID: 14TIgLHDC9mjNsuvzsXOhRSF5LWIzGkXzzapwMREE7F49NDNNHdZJ5hCr
# =========================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "`n🚀 [1/2] Đang kiểm tra cấu hình Clasp..." -ForegroundColor Cyan
if (-not (Test-Path ".clasp.json")) {
    Write-Host "❌ Thiếu file .clasp.json!" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 [2/2] Đang đẩy code từ gas_backend/ lên Google Apps Script..." -ForegroundColor Cyan
node sync_gas.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ ĐÃ ĐẨY CODE LÊN GOOGLE APPS SCRIPT THÀNH CÔNG!" -ForegroundColor Green
    Write-Host "🔗 Mở dự án trên trình duyệt: https://script.google.com/d/14TIgLHDC9mjNsuvzsXOhRSF5LWIzGkXzzapwMREE7F49NDNNHdZJ5hCr/edit" -ForegroundColor White
} else {
    Write-Host "`n❌ Đẩy code thất bại. Vui lòng kiểm tra thông báo lỗi ở trên." -ForegroundColor Red
}
