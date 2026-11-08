# trustprocure-kiem — bộ kiểm độc lập bộ bằng chứng TrustProcure

Một tệp JavaScript duy nhất, chạy bằng **Node.js ≥ 22.13**, **không phụ thuộc gói nào, không cần mạng, không cần tài khoản TrustProcure**.
Kiểm toán viên dùng nó để tính lại bộ bằng chứng của một gói thầu, hoặc kiểm một biên nhận nộp báo giá, trên máy của mình —
không phải tin máy chủ TrustProcure, vì bộ kiểm không nằm trên máy chủ ấy.

## Tải và kiểm tệp

Bản `v2` (2026-11-08) — đọc bộ bằng chứng **phiên bản 10 và 11** (phiên bản 11 thêm lớp «Gợi ý máy», `DAC-TA.md` §13 — lớp lịch sử, bộ kiểm
không tính lại gì từ nó). Đường dẫn ghim theo commit `12705aa`, không đổi được về sau:

```
curl -LO https://raw.githubusercontent.com/jinji-vn/trustprocure-kiem/12705aa5fd84ea1be84170ab3aaffb1399ee5713/kiem-bang-chung.mjs
sha256sum kiem-bang-chung.mjs
```

SHA-256 phải đúng bằng:

```
1c42c35916e773ab1cfed16bb72b8756e8fb272366ab1eb60f0e6f44d04aad8f
```

(Windows PowerShell: `Get-FileHash kiem-bang-chung.mjs -Algorithm SHA256`.) Lệch một ký tự thì đừng chạy.

Bản `v1` (2026-11-06, chỉ đọc bộ phiên bản 10) vẫn tải được theo commit cũ:

```
curl -LO https://raw.githubusercontent.com/jinji-vn/trustprocure-kiem/45c00f4fd064b0c7b1de1870f2cc8f631613dc53/kiem-bang-chung.mjs
sha256sum kiem-bang-chung.mjs   # b55e055ff7e0645c9e672b6759ecff1606c17d72f1f27e48062237d8eb0a1deb
```

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

Tệp này **sinh ra** từ kho TrustProcure (`tools/bo-xuat-danh-gia/phat-hanh/kiem-bang-chung.mjs`; bản `v2` từ commit `018c764`, bản `v1` từ
commit `8d4f69a`), không sửa tay. Mỗi bản phát hành ghim theo một commit của kho này; bản mới có commit và băm mới, ghi ở `SHA256SUMS` và ở
hướng dẫn người mua.

## Bản phát hành

| Bản | Ngày | Đọc bộ phiên bản | Commit ghim | SHA-256 |
|---|---|---|---|---|
| v1 | 2026-11-06 | 10 | `45c00f4fd064b0c7b1de1870f2cc8f631613dc53` | `b55e055ff7e0645c9e672b6759ecff1606c17d72f1f27e48062237d8eb0a1deb` |
| v2 | 2026-11-08 | 10, 11 | `12705aa5fd84ea1be84170ab3aaffb1399ee5713` | `1c42c35916e773ab1cfed16bb72b8756e8fb272366ab1eb60f0e6f44d04aad8f` |
| v3 | 2026-11-08 | 10, 11 (11 có yêu cầu) | <SHA_V3> | a3ef9ebc92eea0d92c8669adb29a1dfeebe12a0bb6f7b2481f67f93941f17cee |
---

*English:* a single-file, dependency-free, offline verifier for TrustProcure evidence bundles and bid receipts.
Run `node kiem-bang-chung.mjs <bundle-dir>`; the last line is `ok=true` or `ok=false`. Check the SHA-256 above before running.
