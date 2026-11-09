# trustprocure-kiem — bộ kiểm độc lập bộ bằng chứng TrustProcure

Một tệp JavaScript duy nhất, chạy bằng **Node.js ≥ 22.13**, **không phụ thuộc gói nào, không cần mạng, không cần tài khoản TrustProcure**.
Kiểm toán viên dùng nó để tính lại bộ bằng chứng của một gói thầu, hoặc kiểm một biên nhận nộp báo giá, trên máy của mình —
không phải tin máy chủ TrustProcure, vì bộ kiểm không nằm trên máy chủ ấy.

## Tải và kiểm tệp

Bản `v5` (2026-11-09) — đọc bộ bằng chứng **phiên bản 10, 11, 12 và 13**. Phiên bản 13 mang thêm, ở mỗi hàng của lượt chấm, danh sách
tệp đính kèm nhà cung cấp niêm phong cùng giá — mã tệp, tên, loại, cỡ và SHA-256 của tệp, **không** khoá hay bản mã: có tệp bên mua tải về
sau khi mở niêm phong thì băm nó và so với `sha256BanRo`; dữ liệu, không tính lại; bộ kiểm kiểm kiểu và miền (`DAC-TA.md` §7). Phiên bản 12
mang điều khoản của bản rõ niêm phong (`DAC-TA.md` §7); phiên bản 11 mang lớp «Gợi ý máy» (`DAC-TA.md` §13) và mục «Yêu cầu của gói»
(`DAC-TA.md` §11.4). Đường dẫn ghim theo commit `a9ed086`, không đổi được về sau:

```
curl -LO https://raw.githubusercontent.com/jinji-vn/trustprocure-kiem/a9ed0864ff1a6eff4794a067883f883814225d6e/kiem-bang-chung.mjs
sha256sum kiem-bang-chung.mjs
```

SHA-256 phải đúng bằng:

```
44a599964529cd734a63de9e654e06d7d867eb7287289b225d8f1ad17fe4197e
```

(Windows PowerShell: `Get-FileHash kiem-bang-chung.mjs -Algorithm SHA256`.) Lệch một ký tự thì đừng chạy.

Bản `v4` (2026-11-08, đọc bộ 10, 11 và 12) vẫn tải được theo commit cũ:

```
curl -LO https://raw.githubusercontent.com/jinji-vn/trustprocure-kiem/676138f981c7501eb9c615bbd5c6979f4ebaa761/kiem-bang-chung.mjs
sha256sum kiem-bang-chung.mjs   # a57f488539db14d96005fce4e0f541333ec5e5093bd9466b5332095c6eb56a6b
```

Bản `v3` (2026-11-08, đọc bộ 10 và 11) vẫn tải được theo commit cũ:

```
curl -LO https://raw.githubusercontent.com/jinji-vn/trustprocure-kiem/f92a81bffb525272e251e3834e7c54a7452768e7/kiem-bang-chung.mjs
sha256sum kiem-bang-chung.mjs   # a3ef9ebc92eea0d92c8669adb29a1dfeebe12a0bb6f7b2481f67f93941f17cee
```

Bản `v2` (2026-11-08, bộ 11 không có mục yêu cầu) vẫn tải được theo commit cũ:

```
curl -LO https://raw.githubusercontent.com/jinji-vn/trustprocure-kiem/12705aa5fd84ea1be84170ab3aaffb1399ee5713/kiem-bang-chung.mjs
sha256sum kiem-bang-chung.mjs   # 1c42c35916e773ab1cfed16bb72b8756e8fb272366ab1eb60f0e6f44d04aad8f
```

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

Tệp này **sinh ra** từ kho TrustProcure (`tools/bo-xuat-danh-gia/phat-hanh/kiem-bang-chung.mjs`; bản `v5` từ commit `55bc70c`, bản `v4` từ commit `9c4843f`, bản `v3` từ commit `a8e8554`, bản `v2` từ commit `018c764`, bản `v1` từ
commit `8d4f69a`), không sửa tay. Mỗi bản phát hành ghim theo một commit của kho này; bản mới có commit và băm mới, ghi ở `SHA256SUMS` và ở
hướng dẫn người mua.

## Bản phát hành

| Bản | Ngày | Đọc bộ phiên bản | Commit ghim | SHA-256 |
|---|---|---|---|---|
| v1 | 2026-11-06 | 10 | `45c00f4fd064b0c7b1de1870f2cc8f631613dc53` | `b55e055ff7e0645c9e672b6759ecff1606c17d72f1f27e48062237d8eb0a1deb` |
| v2 | 2026-11-08 | 10, 11 | `12705aa5fd84ea1be84170ab3aaffb1399ee5713` | `1c42c35916e773ab1cfed16bb72b8756e8fb272366ab1eb60f0e6f44d04aad8f` |
| v3 | 2026-11-08 | 10, 11 (11 có yêu cầu) | `f92a81bffb525272e251e3834e7c54a7452768e7` | `a3ef9ebc92eea0d92c8669adb29a1dfeebe12a0bb6f7b2481f67f93941f17cee` |
| v4 | 2026-11-08 | 10, 11, 12 (12 có điều khoản) | `676138f981c7501eb9c615bbd5c6979f4ebaa761` | `a57f488539db14d96005fce4e0f541333ec5e5093bd9466b5332095c6eb56a6b` |
| v5 | 2026-11-09 | 10, 11, 12, 13 (13 có tệp, không khoá) | `a9ed0864ff1a6eff4794a067883f883814225d6e` | `44a599964529cd734a63de9e654e06d7d867eb7287289b225d8f1ad17fe4197e` |

---

*English:* a single-file, dependency-free, offline verifier for TrustProcure evidence bundles and bid receipts.
Run `node kiem-bang-chung.mjs <bundle-dir>`; the last line is `ok=true` or `ok=false`. Check the SHA-256 above before running.
