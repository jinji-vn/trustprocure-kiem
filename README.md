# trustprocure-kiem — bộ kiểm độc lập bộ bằng chứng TrustProcure

Một tệp JavaScript duy nhất, chạy bằng **Node.js ≥ 22.13**, **không phụ thuộc gói nào, không cần mạng, không cần tài khoản TrustProcure**.
Kiểm toán viên dùng nó để tính lại bộ bằng chứng của một gói thầu, hoặc kiểm một biên nhận nộp báo giá, trên máy của mình —
không phải tin máy chủ TrustProcure, vì bộ kiểm không nằm trên máy chủ ấy.

## Tải và kiểm tệp

Bản `v1`:

```
curl -LO https://raw.githubusercontent.com/jinji-vn/trustprocure-kiem/v1/kiem-bang-chung.mjs
sha256sum kiem-bang-chung.mjs
```

SHA-256 phải đúng bằng:

```
b55e055ff7e0645c9e672b6759ecff1606c17d72f1f27e48062237d8eb0a1deb
```

(Windows PowerShell: `Get-FileHash kiem-bang-chung.mjs -Algorithm SHA256`.) Lệch một ký tự thì đừng chạy.

## Kiểm một bộ bằng chứng

Trên trang gói thầu (bước 8), bấm «Tải bộ bằng chứng»: được hai tệp `bo-bang-chung.json` và `DAC-TA.md`. Đặt cả hai vào một thư mục rồi:

```
node kiem-bang-chung.mjs <thư-mục>
```

Dòng cuối `ok=true` là bộ tính lại khớp; `ok=false` (mã thoát 1, kèm dòng `FAIL`) là có chỗ không khớp.

## Kiểm một biên nhận nộp báo giá

```
node kiem-bang-chung.mjs bien-nhan --van-ban <tệp văn bản biên nhận> --chu-ky <tệp chữ ký> --khoa <JSON khoá hoặc tệp>
```

Khoá công khai lấy tại `https://trustprocure.jinji.vn/.well-known/trustprocure-receipt-keys` và dán vào `--khoa`; bộ kiểm không tự tải.

## Nguồn

Tệp này **sinh ra** từ kho TrustProcure (`tools/bo-xuat-danh-gia/phat-hanh/kiem-bang-chung.mjs`, commit `8d4f69a`), không sửa tay.
Mỗi bản phát hành là một tag; bản mới có băm mới, ghi ở `SHA256SUMS` và ở hướng dẫn người mua.

---

*English:* a single-file, dependency-free, offline verifier for TrustProcure evidence bundles and bid receipts.
Run `node kiem-bang-chung.mjs <bundle-dir>`; the last line is `ok=true` or `ok=false`. Check the SHA-256 above before running.
