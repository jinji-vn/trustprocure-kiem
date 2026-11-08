// kiem-bang-chung.mjs — bộ kiểm bằng chứng TrustProcure trong một tệp (ADR-257, BACKLOG 575).
// TỆP SINH RA, không sửa tay. Nguồn: tools/bo-xuat-danh-gia/src/mot-tep/kiem-bang-chung.ts và các module dưới đây;
// sinh lại bằng `pnpm bang-chung:sinh-bo-kiem`. Chạy bằng node trần (>= 22.13), không phụ thuộc, không mạng:
//   node kiem-bang-chung.mjs <thu-muc-bo>
//   node kiem-bang-chung.mjs bien-nhan --van-ban <tep> --chu-ky <tep> --khoa <JSON-hoac-tep> [--dau-van-tay <hex>]
// Module gom, theo thứ tự chạy:
//   tools/bo-xuat-danh-gia/src/bo.ts
//   tools/bo-xuat-danh-gia/src/kiem-bien-nhan.ts
//   packages/danh-gia/src/dac-ta.ts
//   packages/danh-gia/src/chi-phi-hieu-dung.ts
//   tools/bo-xuat-danh-gia/src/doc-lap/tinh-lai.ts
//   packages/du-lieu-nen/src/so-thap-phan.ts
//   packages/du-lieu-nen/src/benchmark.ts
//   tools/bo-xuat-danh-gia/src/doc-lap/benchmark-lai.ts
//   tools/bo-xuat-danh-gia/src/kiem-du-lieu-nen.ts
//   packages/danh-gia/src/tco.ts
//   packages/danh-gia/src/xep-hang.ts
//   tools/bo-xuat-danh-gia/src/doc-lap/quy-doi-lai.ts
//   tools/bo-xuat-danh-gia/src/kiem-tco.ts
//   tools/bo-xuat-danh-gia/src/doc-lap/quan-tri-lai.ts
//   tools/bo-xuat-danh-gia/src/kiem-quan-tri.ts
//   tools/bo-xuat-danh-gia/src/doc-lap/rui-ro-lai.ts
//   tools/bo-xuat-danh-gia/src/kiem-rui-ro.ts
//   tools/bo-xuat-danh-gia/src/kiem-goi-y-may.ts
//   tools/bo-xuat-danh-gia/src/kiem.ts
//   tools/bo-xuat-danh-gia/src/kiem-thu-muc.ts
//   tools/bo-xuat-danh-gia/src/tham-so.ts
//   tools/bo-xuat-danh-gia/src/mot-tep/kiem-bang-chung.ts

import * as __tp_node_crypto from "node:crypto";
import * as __tp_node_fs_promises from "node:fs/promises";
import * as __tp_node_path from "node:path";
import * as __tp_node_process from "node:process";

// ---- tools/bo-xuat-danh-gia/src/bo.ts
const __tp_m1 = (() => {
const DANG_BUNDLE = "trustprocure/bo-bang-chung-danh-gia";
const PHIEN_BAN_BUNDLE = 11;
const PHIEN_BAN_DOC_DUOC = [10, PHIEN_BAN_BUNDLE];
const TEP_DU_LIEU = "bo-bang-chung.json";
const TEP_DAC_TA = "DAC-TA.md";
class BoHongError extends Error {
    constructor(duong, vande) {
        super(`bundle hỏng tại \`${duong}\`: ${vande}`);
        this.name = "BoHongError";
    }
}
function doiTuong(gt, duong) {
    if (typeof gt !== "object" || gt === null || Array.isArray(gt)) {
        throw new BoHongError(duong, "cần một object");
    }
    return gt;
}
function chuoi(o, ten, duong) {
    const gt = o[ten];
    if (typeof gt !== "string")
        throw new BoHongError(`${duong}.${ten}`, "cần một chuỗi");
    return gt;
}
function chuoiHayNull(o, ten, duong) {
    const gt = o[ten];
    if (gt === null)
        return null;
    if (typeof gt !== "string")
        throw new BoHongError(`${duong}.${ten}`, "cần một chuỗi hay null");
    return gt;
}
function chuoiTuyChon(o, ten, duong) {
    const gt = o[ten];
    if (gt === undefined)
        return undefined;
    if (typeof gt !== "string")
        throw new BoHongError(`${duong}.${ten}`, "cần một chuỗi khi có mặt");
    return gt;
}
function soNguyen(o, ten, duong) {
    const gt = o[ten];
    if (typeof gt !== "number" || !Number.isInteger(gt)) {
        throw new BoHongError(`${duong}.${ten}`, "cần một số nguyên");
    }
    return gt;
}
function soNguyenHayNull(o, ten, duong) {
    const gt = o[ten];
    if (gt === null)
        return null;
    if (typeof gt !== "number" || !Number.isInteger(gt)) {
        throw new BoHongError(`${duong}.${ten}`, "cần một số nguyên hay null");
    }
    return gt;
}
function mang(o, ten, duong) {
    const gt = o[ten];
    if (!Array.isArray(gt))
        throw new BoHongError(`${duong}.${ten}`, "cần một mảng");
    return gt;
}
function docMoc(gt, duong) {
    const o = doiTuong(gt, duong);
    return { giaTri: chuoi(o, "giaTri", duong), nguon: chuoi(o, "nguon", duong) };
}
function docThanhPhanChinhSach(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        ma: chuoi(o, "ma", duong),
        don_vi: chuoi(o, "don_vi", duong),
        he_so: chuoi(o, "he_so", duong),
    };
}
function chuoiTheoKhoa(gt, duong) {
    const o = doiTuong(gt, duong);
    const khoa = Object.keys(o);
    if (khoa.length > 16)
        throw new BoHongError(duong, "tối đa 16 khoá");
    const ra = {};
    for (const k of khoa) {
        if (k === "__proto__")
            throw new BoHongError(`${duong}.${k}`, "khoá không được phép");
        ra[k] = chuoi(o, k, duong);
    }
    return ra;
}
function docThanhPhanLuu(gt, duong) {
    const o = doiTuong(gt, duong);
    const nguon = o["nguon"] === undefined ? undefined : chuoiTheoKhoa(o["nguon"], `${duong}.nguon`);
    return {
        ma: chuoi(o, "ma", duong),
        donVi: chuoiTuyChon(o, "donVi", duong),
        heSo: chuoiTuyChon(o, "heSo", duong),
        giaTri: chuoiTuyChon(o, "giaTri", duong),
        tien: chuoiHayNull(o, "tien", duong),
        ...(nguon === undefined ? {} : { nguon }),
    };
}
function mangChuoiHayNull(o, ten, duong) {
    return o[ten] === null ? null : mangChuoi(o, ten, duong);
}
function docHang(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        bidVersionId: chuoi(o, "bidVersionId", duong),
        supplierName: chuoi(o, "supplierName", duong),
        effectiveCost: chuoiHayNull(o, "effectiveCost", duong),
        rank: soNguyenHayNull(o, "rank", duong),
        components: mang(o, "components", duong).map((x, i) => docThanhPhanLuu(x, `${duong}.components[${String(i)}]`)),
        maThieu: mangChuoiHayNull(o, "maThieu", duong),
        ghiChu: chuoiHayNull(o, "ghiChu", duong),
    };
}
function docGoiTco(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        tapMa: mangChuoiHayNull(o, "tapMa", duong),
        thamSo: o["thamSo"] === null ? null : chuoiTheoKhoa(o["thamSo"], `${duong}.thamSo`),
        soNgayGiao: soNguyenHayNull(o, "soNgayGiao", duong),
    };
}
function docCamKet(gt, duong) {
    if (gt === null)
        return null;
    const o = doiTuong(gt, duong);
    const k = doiTuong(o["khai"], `${duong}.khai`);
    const pk = `${duong}.khai`;
    return {
        hangTco: soNguyen(o, "hangTco", duong),
        hangGia: soNguyenHayNull(o, "hangGia", duong),
        effectiveCost: chuoi(o, "effectiveCost", duong),
        components: mang(o, "components", duong).map((x, i) => docThanhPhanLuu(x, `${duong}.components[${String(i)}]`)),
        khai: {
            freight: chuoiHayNull(k, "freight", pk),
            importCost: chuoiHayNull(k, "importCost", pk),
            paymentDays: soNguyenHayNull(k, "paymentDays", pk),
            leadTimeDays: soNguyenHayNull(k, "leadTimeDays", pk),
        },
        tapMa: mangChuoiHayNull(o, "tapMa", duong),
        thamSo: o["thamSo"] === null ? null : chuoiTheoKhoa(o["thamSo"], `${duong}.thamSo`),
        soNgayGiao: soNguyenHayNull(o, "soNgayGiao", duong),
        giaiTrinhLechHang: chuoiHayNull(o, "giaiTrinhLechHang", duong),
        chupLuc: docMoc(o["chupLuc"], `${duong}.chupLuc`),
    };
}
function docLuotCham(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        evaluationId: chuoi(o, "evaluationId", duong),
        policyId: chuoi(o, "policyId", duong),
        policyVersion: soNguyen(o, "policyVersion", duong),
        currency: chuoi(o, "currency", duong),
        chinhSachThanhPhan: mang(o, "chinhSachThanhPhan", duong).map((x, i) => docThanhPhanChinhSach(x, `${duong}.chinhSachThanhPhan[${String(i)}]`)),
        coBenchmark: logic(o, "coBenchmark", duong),
        taoLuc: docMoc(o["taoLuc"], `${duong}.taoLuc`),
        hang: mang(o, "hang", duong).map((x, i) => docHang(x, `${duong}.hang[${String(i)}]`)),
    };
}
function docTraoThau(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        awardId: chuoi(o, "awardId", duong),
        evaluationId: chuoi(o, "evaluationId", duong),
        bidVersionId: chuoi(o, "bidVersionId", duong),
        status: chuoi(o, "status", duong),
        reason: chuoi(o, "reason", duong),
        actedAt: docMoc(o["actedAt"], `${duong}.actedAt`),
        camKet: docCamKet(o["camKet"], `${duong}.camKet`),
    };
}
const KHUON_MOC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/u;
const KHUON_NGAY = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{6}Z)?$/u;
const KHUON_SO_KHONG_AM = /^(?=.{1,64}$)\d+(?:\.\d+)?$/u;
const KHUON_NGUONG = /^(0|[1-9][0-9]?)(\.[0-9]{1,4})?$/u;
function moc6(o, ten, duong) {
    const gt = chuoi(o, ten, duong);
    if (!KHUON_MOC.test(gt))
        throw new BoHongError(`${duong}.${ten}`, "cần một mốc ISO UTC đúng sáu chữ số lẻ (DAC-TA §8.2)");
    return gt;
}
function ngayQuanSat(o, ten, duong) {
    const gt = chuoi(o, ten, duong);
    if (!KHUON_NGAY.test(gt))
        throw new BoHongError(`${duong}.${ten}`, "cần một ngày UTC hay một mốc ISO UTC sáu chữ số lẻ (DAC-TA §8.2)");
    return gt;
}
function moc6HayNull(o, ten, duong) {
    return o[ten] === null ? null : moc6(o, ten, duong);
}
function soKhongAm(o, ten, duong) {
    const gt = chuoi(o, ten, duong);
    if (!KHUON_SO_KHONG_AM.test(gt))
        throw new BoHongError(`${duong}.${ten}`, "cần một chuỗi thập phân không âm");
    return gt;
}
function logic(o, ten, duong) {
    const gt = o[ten];
    if (typeof gt !== "boolean")
        throw new BoHongError(`${duong}.${ten}`, "cần true hay false");
    return gt;
}
function mangChuoi(o, ten, duong) {
    return mang(o, ten, duong).map((x, i) => {
        if (typeof x !== "string")
            throw new BoHongError(`${duong}.${ten}[${String(i)}]`, "cần một chuỗi");
        return x;
    });
}
function docQuanSat(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        ma: chuoi(o, "ma", duong),
        goi: chuoi(o, "goi", duong),
        ncc: chuoi(o, "ncc", duong),
        nhomNcc: chuoi(o, "nhomNcc", duong),
        ngay: ngayQuanSat(o, "ngay", duong),
        gia: soKhongAm(o, "gia", duong),
        tienTe: chuoi(o, "tienTe", duong),
        cungNguoiTao: logic(o, "cungNguoiTao", duong),
        hoiTo: mangChuoi(o, "hoiTo", duong),
        anhXa: chuoiHayNull(o, "anhXa", duong),
    };
}
function docAnhXaHoiTo(gt, duong) {
    const o = doiTuong(gt, duong);
    const t = doiTuong(o["tacGia"], `${duong}.tacGia`);
    return {
        ma: chuoi(o, "ma", duong),
        moTa: chuoi(o, "moTa", duong),
        donVi: chuoi(o, "donVi", duong),
        hangChuan: chuoiHayNull(o, "hangChuan", duong),
        nguon: chuoi(o, "nguon", duong),
        lyDo: chuoiHayNull(o, "lyDo", duong),
        tacGia: { userId: chuoi(t, "userId", `${duong}.tacGia`), hoTen: chuoiHayNull(t, "hoTen", `${duong}.tacGia`) },
        ghiLuc: ngayQuanSat(o, "ghiLuc", duong),
    };
}
function docBangQuanSat(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        mocMoGia: moc6(o, "mocMoGia", duong),
        hangChuan: chuoi(o, "hangChuan", duong),
        tuNgay: moc6(o, "tuNgay", duong),
        quanSat: mang(o, "quanSat", duong).map((x, i) => docQuanSat(x, `${duong}.quanSat[${String(i)}]`)),
        anhXaHoiTo: mang(o, "anhXaHoiTo", duong).map((x, i) => docAnhXaHoiTo(x, `${duong}.anhXaHoiTo[${String(i)}]`)),
    };
}
function docAnhXa(gt, duong) {
    if (gt === null)
        return null;
    const o = doiTuong(gt, duong);
    const t = doiTuong(o["tacGia"], `${duong}.tacGia`);
    return {
        anhXaId: chuoi(o, "anhXaId", duong),
        hangChuan: chuoiHayNull(o, "hangChuan", duong),
        nguon: chuoi(o, "nguon", duong),
        lyDo: chuoiHayNull(o, "lyDo", duong),
        tacGia: { userId: chuoi(t, "userId", `${duong}.tacGia`), hoTen: chuoiHayNull(t, "hoTen", `${duong}.tacGia`) },
        ghiLuc: moc6(o, "ghiLuc", duong),
    };
}
function docGiaDong(gt, duong) {
    if (gt === null)
        return null;
    const o = doiTuong(gt, duong);
    const gia = chuoiHayNull(o, "gia", duong);
    if (gia !== null && !KHUON_SO_KHONG_AM.test(gia))
        throw new BoHongError(`${duong}.gia`, "cần một chuỗi thập phân không âm");
    return {
        anhXaId: chuoiHayNull(o, "anhXaId", duong),
        trangThai: chuoi(o, "trangThai", duong),
        gia,
        tienTe: chuoiHayNull(o, "tienTe", duong),
        hangChuan: chuoi(o, "hangChuan", duong),
        hoiTo: mangChuoi(o, "hoiTo", duong),
    };
}
function docDongBenchmark(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        bidVersionId: chuoi(o, "bidVersionId", duong),
        lineNo: soNguyen(o, "lineNo", duong),
        nhan: chuoi(o, "nhan", duong),
        chieu: chuoiHayNull(o, "chieu", duong),
        lyDo: chuoiHayNull(o, "lyDo", duong),
        hangChuan: chuoiHayNull(o, "hangChuan", duong),
        tienTe: chuoiHayNull(o, "tienTe", duong),
        cuaSoTu: moc6HayNull(o, "cuaSoTu", duong),
        soQuanSat: soNguyenHayNull(o, "soQuanSat", duong),
        soGoi: soNguyenHayNull(o, "soGoi", duong),
        soNcc: soNguyenHayNull(o, "soNcc", duong),
        soGoiCungNguoiTao: soNguyenHayNull(o, "soGoiCungNguoiTao", duong),
        soQuanSatHoiTo: soNguyenHayNull(o, "soQuanSatHoiTo", duong),
        soLoaiTienTe: soNguyenHayNull(o, "soLoaiTienTe", duong),
        soLoaiGia0: soNguyenHayNull(o, "soLoaiGia0", duong),
        soLoaiGoiHuy: soNguyenHayNull(o, "soLoaiGoiHuy", duong),
        hoiTo: mangChuoi(o, "hoiTo", duong),
        giaDong: docGiaDong(o["giaDong"], `${duong}.giaDong`),
        anhXa: docAnhXa(o["anhXa"], `${duong}.anhXa`),
    };
}
function nguyenTrongBien(o, ten, duong, tran) {
    const gt = chuoi(o, ten, duong);
    if (!/^[1-9][0-9]?$/u.test(gt) || Number(gt) > tran)
        throw new BoHongError(`${duong}.${ten}`, `cần số nguyên 1–${String(tran)} (DAC-TA §8.4)`);
    return gt;
}
function docNhomBenchmark(gt, duong) {
    const o = doiTuong(gt, duong);
    const khoa = Object.keys(o).sort().join(",");
    const can = "cua_so_thang,nguong_lech_cao,nguong_lech_vua,phuong_phap,san_goi,san_ncc";
    if (khoa !== can)
        throw new BoHongError(duong, `cần đúng sáu khoá ${can}, gặp ${khoa}`);
    const nguong = (ten) => {
        const g = chuoi(o, ten, duong);
        if (!KHUON_NGUONG.test(g))
            throw new BoHongError(`${duong}.${ten}`, "cần ngưỡng dạng thập phân tối đa bốn chữ số lẻ (DAC-TA §8.4)");
        return g;
    };
    const vua = nguong("nguong_lech_vua");
    const cao = nguong("nguong_lech_cao");
    if (!(Number(vua) > 0 && Number(vua) < Number(cao) && Number(cao) <= 10)) {
        throw new BoHongError(duong, "cần 0 < nguong_lech_vua < nguong_lech_cao ≤ 10 (DAC-TA §8.4)");
    }
    const phuongPhap = chuoi(o, "phuong_phap", duong);
    if (phuongPhap !== "TRUNG_VI_THEO_GOI_V1")
        throw new BoHongError(`${duong}.phuong_phap`, `bộ kiểm này chỉ cài TRUNG_VI_THEO_GOI_V1`);
    return {
        cua_so_thang: nguyenTrongBien(o, "cua_so_thang", duong, 60),
        san_goi: nguyenTrongBien(o, "san_goi", duong, 50),
        san_ncc: nguyenTrongBien(o, "san_ncc", duong, 50),
        nguong_lech_vua: vua,
        nguong_lech_cao: cao,
        phuong_phap: phuongPhap,
    };
}
function docLuotChamDuLieuNen(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        evaluationId: chuoi(o, "evaluationId", duong),
        chinhSachBenchmark: docNhomBenchmark(o["chinhSachBenchmark"], `${duong}.chinhSachBenchmark`),
        mocMoGia: moc6(o, "mocMoGia", duong),
        docLuc: moc6(o, "docLuc", duong),
        dong: mang(o, "dong", duong).map((x, i) => docDongBenchmark(x, `${duong}.dong[${String(i)}]`)),
        dauVao: mang(o, "dauVao", duong).map((x, i) => {
            const d = doiTuong(x, `${duong}.dauVao[${String(i)}]`);
            const p = `${duong}.dauVao[${String(i)}]`;
            return { hangChuan: chuoi(d, "hangChuan", p), tienTe: chuoi(d, "tienTe", p), quanSat: mangChuoi(d, "quanSat", p) };
        }),
        dauVaoThieu: (() => {
            const n = soNguyen(o, "dauVaoThieu", duong);
            if (n < 0)
                throw new BoHongError(`${duong}.dauVaoThieu`, "cần một số nguyên không âm");
            return n;
        })(),
    };
}
function docDuLieuNen(gt, duong) {
    if (gt === null)
        return null;
    const o = doiTuong(gt, duong);
    const phuongPhap = chuoi(o, "phuongPhap", duong);
    if (phuongPhap !== "TRUNG_VI_THEO_GOI_V1")
        throw new BoHongError(`${duong}.phuongPhap`, "bộ kiểm này chỉ cài TRUNG_VI_THEO_GOI_V1");
    return {
        phuongPhap,
        nguonThoiGian: chuoi(o, "nguonThoiGian", duong),
        goiX: chuoi(o, "goiX", duong),
        hangMuc: mang(o, "hangMuc", duong).map((x, i) => {
            const p = `${duong}.hangMuc[${String(i)}]`;
            const h = doiTuong(x, p);
            return { lineNo: soNguyen(h, "lineNo", p), moTa: chuoi(h, "moTa", p), donVi: chuoi(h, "donVi", p), soLuong: chuoi(h, "soLuong", p) };
        }),
        bangQuanSat: mang(o, "bangQuanSat", duong).map((x, i) => docBangQuanSat(x, `${duong}.bangQuanSat[${String(i)}]`)),
        luotCham: mang(o, "luotCham", duong).map((x, i) => docLuotChamDuLieuNen(x, `${duong}.luotCham[${String(i)}]`)),
    };
}
const KHUON_BAM = /^[0-9a-f]{64}$/u;
const KHUON_THU_TU = /^(?=.{1,20}$)[0-9]+$/u;
function soHayNull(o, ten, duong) {
    return o[ten] === null ? null : soKhongAm(o, ten, duong);
}
function bam(o, ten, duong) {
    const gt = chuoi(o, ten, duong);
    if (!KHUON_BAM.test(gt))
        throw new BoHongError(`${duong}.${ten}`, "cần SHA-256 hex chữ thường (64 ký tự)");
    return gt;
}
function bamHayNull(o, ten, duong) {
    return o[ten] === null ? null : bam(o, ten, duong);
}
function thuTu(o, ten, duong) {
    const gt = chuoi(o, ten, duong);
    if (!KHUON_THU_TU.test(gt))
        throw new BoHongError(`${duong}.${ten}`, "cần số thứ tự dạng chuỗi chữ số");
    return gt;
}
function docQuanTri(gt, duong) {
    const o = doiTuong(gt, duong);
    const g = doiTuong(o["goi"], `${duong}.goi`);
    const pg = `${duong}.goi`;
    const ns = o["nganSach"] === null ? null : doiTuong(o["nganSach"], `${duong}.nganSach`);
    const pns = `${duong}.nganSach`;
    const cs = o["chinhSachNganSach"] === null ? null : doiTuong(o["chinhSachNganSach"], `${duong}.chinhSachNganSach`);
    const pcs = `${duong}.chinhSachNganSach`;
    const mangDoi = (ten, doc) => mang(o, ten, duong).map((x, i) => {
        const p = `${duong}.${ten}[${String(i)}]`;
        return doc(doiTuong(x, p), p);
    });
    const cheDo = chuoi(o, "cheDo", duong);
    if (cheDo !== "S3" && cheDo !== "MVP1")
        throw new BoHongError(`${duong}.cheDo`, `cần "S3" hay "MVP1", gặp "${cheDo}"`);
    return {
        nguonThoiGian: chuoi(o, "nguonThoiGian", duong),
        goiX: chuoi(o, "goiX", duong),
        cheDo,
        batS3Luc: moc6HayNull(o, "batS3Luc", duong),
        goi: {
            trangThai: chuoi(g, "trangThai", pg),
            nguoiTao: chuoi(g, "nguoiTao", pg),
            nguoiNop: chuoiHayNull(g, "nguoiNop", pg),
            nopLuc: moc6HayNull(g, "nopLuc", pg),
            lanNop: soNguyen(g, "lanNop", pg),
            moLuc: moc6HayNull(g, "moLuc", pg),
            requiresDualApproval: logic(g, "requiresDualApproval", pg),
        },
        nganSach: ns === null
            ? null
            : {
                estimatedValue: soKhongAm(ns, "estimatedValue", pns),
                currency: chuoi(ns, "currency", pns),
                policyId: chuoi(ns, "policyId", pns),
                tierTuSoTien: soHayNull(ns, "tierTuSoTien", pns),
                createdBy: chuoi(ns, "createdBy", pns),
            },
        chinhSachNganSach: cs === null
            ? null
            : {
                policyId: chuoi(cs, "policyId", pcs),
                version: soNguyen(cs, "version", pcs),
                currency: chuoi(cs, "currency", pcs),
                dualApprovalThreshold: soKhongAm(cs, "dualApprovalThreshold", pcs),
                tiers: cs["tiers"] === null
                    ? null
                    : mang(cs, "tiers", pcs).map((x, i) => chuoiTheoKhoa(x, `${pcs}.tiers[${String(i)}]`)),
                createdBy: chuoi(cs, "createdBy", pcs),
                effectiveFrom: moc6(cs, "effectiveFrom", pcs),
                chuKyThuHai: cs["chuKyThuHai"] === null
                    ? null
                    : (() => {
                        const k = doiTuong(cs["chuKyThuHai"], `${pcs}.chuKyThuHai`);
                        const pk = `${pcs}.chuKyThuHai`;
                        return { signedBy: chuoi(k, "signedBy", pk), signedAt: moc6(k, "signedAt", pk) };
                    })(),
            },
        loiMoi: mangDoi("loiMoi", (x, p) => ({
            id: chuoi(x, "id", p),
            supplierId: chuoi(x, "supplierId", p),
            contactId: chuoi(x, "contactId", p),
            linkChannel: chuoi(x, "linkChannel", p),
            status: chuoi(x, "status", p),
            createdAt: moc6(x, "createdAt", p),
            invitedBy: chuoiHayNull(x, "invitedBy", p),
            revokedAt: moc6HayNull(x, "revokedAt", p),
            revokedBy: chuoiHayNull(x, "revokedBy", p),
            lyDoThuHoi: chuoiHayNull(x, "lyDoThuHoi", p),
            moiSauKhiKy: logic(x, "moiSauKhiKy", p),
        })),
        ngoaiLe: mangDoi("ngoaiLe", (x, p) => ({
            id: chuoi(x, "id", p),
            hanhDong: chuoi(x, "hanhDong", p),
            ngoaiLeId: chuoiHayNull(x, "ngoaiLeId", p),
            loai: x["hanhDong"] === "LAP" ? chuoi(x, "loai", p) : chuoiHayNull(x, "loai", p),
            maLyDo: x["hanhDong"] === "LAP" ? chuoi(x, "maLyDo", p) : chuoiHayNull(x, "maLyDo", p),
            giaiTrinh: chuoi(x, "giaiTrinh", p),
            createdBy: chuoi(x, "createdBy", p),
            createdAt: moc6(x, "createdAt", p),
        })),
        chuKyMoGoi: mangDoi("chuKyMoGoi", (x, p) => ({
            id: chuoi(x, "id", p),
            approverUserId: chuoi(x, "approverUserId", p),
            approvedAt: moc6(x, "approvedAt", p),
            lanNopDaXem: soNguyenHayNull(x, "lanNopDaXem", p),
            bamNoiDung: bamHayNull(x, "bamNoiDung", p),
            bamDanhSach: bamHayNull(x, "bamDanhSach", p),
            bamNganSach: bamHayNull(x, "bamNganSach", p),
            bamGiaoHang: bam(x, "bamGiaoHang", p),
        })),
        traVe: mangDoi("traVe", (x, p) => ({
            lanNop: soNguyen(x, "lanNop", p),
            returnedBy: chuoi(x, "returnedBy", p),
            reason: chuoi(x, "reason", p),
            returnedAt: moc6(x, "returnedAt", p),
        })),
        xacMinh: mangDoi("xacMinh", (x, p) => ({
            supplierId: chuoi(x, "supplierId", p),
            loai: chuoi(x, "loai", p),
            thuTu: thuTu(x, "thuTu", p),
            hetHanAt: moc6HayNull(x, "hetHanAt", p),
            lyDo: chuoiHayNull(x, "lyDo", p),
            createdBy: chuoi(x, "createdBy", p),
            createdAt: moc6(x, "createdAt", p),
        })),
        khaiBaoXungDot: mangDoi("khaiBaoXungDot", (x, p) => ({
            id: chuoi(x, "id", p),
            userId: chuoi(x, "userId", p),
            trangThai: chuoi(x, "trangThai", p),
            supplierId: chuoiHayNull(x, "supplierId", p),
            ghiChu: chuoiHayNull(x, "ghiChu", p),
            createdAt: moc6(x, "createdAt", p),
            danhSachBam: bamHayNull(x, "danhSachBam", p),
        })),
        tinHieu: mangDoi("tinHieu", (x, p) => ({
            id: chuoi(x, "id", p),
            loai: chuoi(x, "loai", p),
            nguon: chuoi(x, "nguon", p),
            truong: doiTuong(x["truong"], `${p}.truong`),
            truongKhongChieu: mangChuoi(x, "truongKhongChieu", p),
            giaiThich: chuoi(x, "giaiThich", p),
            tinhLuc: moc6(x, "tinhLuc", p),
            createdBy: chuoi(x, "createdBy", p),
            createdAt: moc6(x, "createdAt", p),
            ghiNhan: mang(x, "ghiNhan", p).map((y, j) => {
                const pj = `${p}.ghiNhan[${String(j)}]`;
                const k = doiTuong(y, pj);
                return { createdBy: chuoi(k, "createdBy", pj), lyDo: chuoi(k, "lyDo", pj), createdAt: moc6(k, "createdAt", pj) };
            }),
        })),
        traoThau: mangDoi("traoThau", (x, p) => ({
            awardId: chuoi(x, "awardId", p),
            status: chuoi(x, "status", p),
            bidVersionId: chuoi(x, "bidVersionId", p),
            supplierId: chuoiHayNull(x, "supplierId", p),
            actedBy: chuoi(x, "actedBy", p),
            actedAt: moc6(x, "actedAt", p),
            reason: chuoi(x, "reason", p),
            soTienTrao: soHayNull(x, "soTienTrao", p),
            tienTe: chuoiHayNull(x, "tienTe", p),
            lop1: x["lop1"] === null
                ? null
                : (() => {
                    const l = doiTuong(x["lop1"], `${p}.lop1`);
                    const pl = `${p}.lop1`;
                    return {
                        bacUocLuong: soKhongAm(l, "bacUocLuong", pl),
                        bacTrao: soKhongAm(l, "bacTrao", pl),
                        bacCaoHon: soKhongAm(l, "bacCaoHon", pl),
                        chuKyCan: soNguyen(l, "chuKyCan", pl),
                    };
                })(),
            chuKy: mang(x, "chuKy", p).map((y, j) => {
                const pj = `${p}.chuKy[${String(j)}]`;
                const k = doiTuong(y, pj);
                return {
                    id: chuoi(k, "id", pj),
                    approverUserId: chuoi(k, "approverUserId", pj),
                    approvedAt: moc6(k, "approvedAt", pj),
                    vaiLucKy: mangChuoiHayNull(k, "vaiLucKy", pj),
                    thamDinhId: chuoiHayNull(k, "thamDinhId", pj),
                };
            }),
        })),
        thamDinh: mangDoi("thamDinh", (x, p) => ({
            id: chuoi(x, "id", p),
            supplierId: chuoi(x, "supplierId", p),
            loai: chuoi(x, "loai", p),
            passportVersionId: chuoiHayNull(x, "passportVersionId", p),
            thuTu: thuTu(x, "thuTu", p),
            hetHanAt: moc6HayNull(x, "hetHanAt", p),
            lyDo: chuoiHayNull(x, "lyDo", p),
            createdBy: chuoi(x, "createdBy", p),
            createdAt: moc6(x, "createdAt", p),
        })),
    };
}
function doiTuongNguyenVan(o, ten, duong) {
    return doiTuong(o[ten], `${duong}.${ten}`);
}
function chuoiTheoKhoaHayNull(o, ten, duong) {
    return o[ten] === null ? null : chuoiTheoKhoa(o[ten], `${duong}.${ten}`);
}
const LOAI_DAU_VAO_ID = ["TRAO_THAU", "LOI_MOI", "TIN_HIEU", "NGOAI_LE", "PHIEN_BAN_BAO_GIA"];
function docDauVaoRuiRo(gt, duong) {
    const o = doiTuong(gt, duong);
    const loai = chuoi(o, "loai", duong);
    const khoa = Object.keys(o).sort().join(",");
    if (loai === "DONG_CHAM") {
        if (khoa !== "bidVersionId,evaluationId,loai")
            throw new BoHongError(duong, "DONG_CHAM mang đúng loai, evaluationId, bidVersionId");
        return { loai, evaluationId: chuoi(o, "evaluationId", duong), bidVersionId: chuoi(o, "bidVersionId", duong) };
    }
    if (loai === "GOI_CHUOI") {
        if (khoa !== "bamGoi,loai")
            throw new BoHongError(duong, "GOI_CHUOI mang đúng loai, bamGoi");
        const bamGoi = chuoi(o, "bamGoi", duong);
        if (!/^[0-9a-f]{32}$/u.test(bamGoi))
            throw new BoHongError(duong, "bamGoi là 32 ký tự hex của HMAC-SHA256 có muối");
        return { loai, bamGoi };
    }
    if (loai === "NEN") {
        if (khoa !== "loai,moc,p10PhanVan,p25PhanVan,soGoiCoG,soGoiCoNguoiThang,soGoiTrongCuaSo,trungViPhanVan") {
            throw new BoHongError(duong, "NEN mang đúng loai, moc, ba số đếm và ba phân vị");
        }
        return {
            loai,
            moc: chuoi(o, "moc", duong),
            soGoiTrongCuaSo: soNguyen(o, "soGoiTrongCuaSo", duong),
            soGoiCoNguoiThang: soNguyen(o, "soGoiCoNguoiThang", duong),
            soGoiCoG: soNguyen(o, "soGoiCoG", duong),
            p10PhanVan: soNguyenHayNull(o, "p10PhanVan", duong),
            p25PhanVan: soNguyenHayNull(o, "p25PhanVan", duong),
            trungViPhanVan: soNguyenHayNull(o, "trungViPhanVan", duong),
        };
    }
    if (loai === "NHAN_BENCHMARK") {
        if (khoa !== "bidVersionId,evaluationId,lineNo,loai")
            throw new BoHongError(duong, "NHAN_BENCHMARK mang đúng loai, evaluationId, bidVersionId, lineNo");
        return { loai, evaluationId: chuoi(o, "evaluationId", duong), bidVersionId: chuoi(o, "bidVersionId", duong), lineNo: soNguyen(o, "lineNo", duong) };
    }
    const loaiId = LOAI_DAU_VAO_ID.find((l) => l === loai);
    if (loaiId === undefined)
        throw new BoHongError(`${duong}.loai`, `loại đầu vào lạ "${loai}" (DAC-TA §12.6)`);
    if (khoa !== "id,loai")
        throw new BoHongError(duong, `${loai} mang đúng loai, id`);
    return { loai: loaiId, id: chuoi(o, "id", duong) };
}
function docTaiLap(gt, duong) {
    if (gt === null)
        return null;
    const o = doiTuong(gt, duong);
    return {
        trangThai: chuoi(o, "trangThai", duong),
        muc: chuoiHayNull(o, "muc", duong),
        doTinCay: chuoiHayNull(o, "doTinCay", duong),
        bangChung: doiTuongNguyenVan(o, "bangChung", duong),
        giaiThichMau: chuoi(o, "giaiThichMau", duong),
        giaiThichThamSo: doiTuongNguyenVan(o, "giaiThichThamSo", duong),
    };
}
function docYeuToRuiRo(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        ma: chuoi(o, "ma", duong),
        trangThai: chuoi(o, "trangThai", duong),
        muc: chuoiHayNull(o, "muc", duong),
        doTinCay: chuoiHayNull(o, "doTinCay", duong),
        trongSo: soNguyenHayNull(o, "trongSo", duong),
        nguon: chuoi(o, "nguon", duong),
        thoiDiem: moc6(o, "thoiDiem", duong),
        bangChung: doiTuongNguyenVan(o, "bangChung", duong),
        giaiThichMau: chuoi(o, "giaiThichMau", duong),
        giaiThichThamSo: doiTuongNguyenVan(o, "giaiThichThamSo", duong),
        dauVao: mang(o, "dauVao", duong).map((x, i) => docDauVaoRuiRo(x, `${duong}.dauVao[${String(i)}]`)),
        ghiNhan: mang(o, "ghiNhan", duong).map((x, i) => {
            const p = `${duong}.ghiNhan[${String(i)}]`;
            const k = doiTuong(x, p);
            return { nguoi: chuoi(k, "nguoi", p), lyDo: chuoi(k, "lyDo", p), luc: moc6(k, "luc", p) };
        }),
        taiLapLucXuat: docTaiLap(o["taiLapLucXuat"], `${duong}.taiLapLucXuat`),
    };
}
function docDanhGiaRuiRo(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        awardId: chuoi(o, "awardId", duong),
        phienBanPhuongPhap: chuoi(o, "phienBanPhuongPhap", duong),
        evaluationId: chuoi(o, "evaluationId", duong),
        bidVersionId: chuoi(o, "bidVersionId", duong),
        policyId: chuoiHayNull(o, "policyId", duong),
        trongSoChinhSach: chuoiTheoKhoaHayNull(o, "trongSoChinhSach", duong),
        mocMoGia: moc6HayNull(o, "mocMoGia", duong),
        mocDeXuat: moc6(o, "mocDeXuat", duong),
        diem: soNguyenHayNull(o, "diem", duong),
        doPhu: soNguyen(o, "doPhu", duong),
        muc: chuoi(o, "muc", duong),
        coNo: logic(o, "coNo", duong),
        nguoiLap: chuoi(o, "nguoiLap", duong),
        lapLuc: moc6(o, "lapLuc", duong),
        yeuTo: mang(o, "yeuTo", duong).map((x, i) => docYeuToRuiRo(x, `${duong}.yeuTo[${String(i)}]`)),
        giaiTrinh: mang(o, "giaiTrinh", duong).map((x, i) => {
            const p = `${duong}.giaiTrinh[${String(i)}]`;
            const k = doiTuong(x, p);
            return { nguoi: chuoi(k, "nguoi", p), noiDung: chuoi(k, "noiDung", p), luc: moc6(k, "luc", p) };
        }),
    };
}
function docRuiRo(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        nguonThoiGian: chuoi(o, "nguonThoiGian", duong),
        danhGia: mang(o, "danhGia", duong).map((x, i) => docDanhGiaRuiRo(x, `${duong}.danhGia[${String(i)}]`)),
    };
}
function docGoiYMay(gt, duong) {
    const o = doiTuong(gt, duong);
    return {
        nguonThoiGian: chuoi(o, "nguonThoiGian", duong),
        goiY: mang(o, "goiY", duong).map((x, i) => {
            const p = `${duong}.goiY[${String(i)}]`;
            const k = doiTuong(x, p);
            return {
                id: chuoi(k, "id", p),
                loai: chuoi(k, "loai", p),
                nguonMay: chuoi(k, "nguonMay", p),
                phienBan: soNguyen(k, "phienBan", p),
                dauVaoBam: chuoi(k, "dauVaoBam", p),
                trangThai: chuoi(k, "trangThai", p),
                tacGia: chuoi(k, "tacGia", p),
                ghiLuc: moc6(k, "ghiLuc", p),
                nguyenVan: k,
            };
        }),
        xacNhan: mang(o, "xacNhan", duong).map((x, i) => {
            const p = `${duong}.xacNhan[${String(i)}]`;
            const k = doiTuong(x, p);
            return {
                id: chuoi(k, "id", p),
                goiYId: chuoi(k, "goiYId", p),
                o: chuoi(k, "o", p),
                ketQua: chuoi(k, "ketQua", p),
                userId: chuoi(k, "userId", p),
                ghiLuc: moc6(k, "ghiLuc", p),
                nguyenVan: k,
            };
        }),
        thamChieu: mang(o, "thamChieu", duong).map((x, i) => {
            const p = `${duong}.thamChieu[${String(i)}]`;
            const k = doiTuong(x, p);
            return { bang: chuoi(k, "bang", p), cot: chuoi(k, "cot", p), id: chuoi(k, "id", p), goiYId: chuoi(k, "goiYId", p) };
        }),
    };
}
function docBo(raw) {
    const o = doiTuong(raw, "$");
    const dang = chuoi(o, "dang", "$");
    if (dang !== DANG_BUNDLE) {
        throw new BoHongError("$.dang", `cần "${DANG_BUNDLE}", gặp "${dang}"`);
    }
    const phienBan = soNguyen(o, "phienBan", "$");
    if (!PHIEN_BAN_DOC_DUOC.includes(phienBan)) {
        throw new BoHongError("$.phienBan", `bộ kiểm này chỉ đọc phiên bản ${PHIEN_BAN_DOC_DUOC.join(", ")}`);
    }
    if (phienBan === 10 && o["goiYMay"] !== undefined && o["goiYMay"] !== null) {
        throw new BoHongError("$.goiYMay", "bộ phiên bản 10 không mang lớp gợi ý máy");
    }
    return {
        dang,
        phienBan,
        dacTaPhienBan: soNguyen(o, "dacTaPhienBan", "$"),
        dacTaSha256: chuoi(o, "dacTaSha256", "$"),
        orgId: chuoi(o, "orgId", "$"),
        rfqId: chuoi(o, "rfqId", "$"),
        xuatLuc: docMoc(o["xuatLuc"], "$.xuatLuc"),
        goiTco: docGoiTco(o["goiTco"], "$.goiTco"),
        luotCham: mang(o, "luotCham", "$").map((x, i) => docLuotCham(x, `$.luotCham[${String(i)}]`)),
        traoThau: mang(o, "traoThau", "$").map((x, i) => docTraoThau(x, `$.traoThau[${String(i)}]`)),
        duLieuNen: docDuLieuNen(o["duLieuNen"], "$.duLieuNen"),
        quanTri: docQuanTri(o["quanTri"], "$.quanTri"),
        ruiRo: docRuiRo(o["ruiRo"], "$.ruiRo"),
        goiYMay: phienBan === 10 ? null : docGoiYMay(o["goiYMay"], "$.goiYMay"),
    };
}
return Object.freeze({ DANG_BUNDLE, PHIEN_BAN_BUNDLE, PHIEN_BAN_DOC_DUOC, TEP_DU_LIEU, TEP_DAC_TA, BoHongError, docBo });
})();

// ---- tools/bo-xuat-danh-gia/src/kiem-bien-nhan.ts
const __tp_m2 = (() => {
const { createHash, createPublicKey, verify } = __tp_node_crypto;
const NHAN_DINH_DANG = "trustprocure-receipt-v1";
const THUAT_TOAN = "ECDSA_P256_SHA256";
const TRUONG_BIEN_NHAN = ["alg", "kid", "rfq_id", "bid_id", "version", "ciphertext_sha256", "submitted_at"];
const HEX64 = /^[0-9a-f]{64}$/u;
function laMucJson(x) {
    return typeof x === "object" && x !== null && !Array.isArray(x);
}
function docKhoaDaDan(json) {
    let goc;
    try {
        goc = JSON.parse(json);
    }
    catch {
        throw new Error("--khoa không phải JSON đọc được.");
    }
    if (!laMucJson(goc))
        throw new Error("--khoa phải là một đối tượng JSON.");
    const muc = Array.isArray(goc["keys"]) ? goc["keys"] : [goc];
    const ra = new Map();
    for (const m of muc) {
        if (!laMucJson(m) || typeof m["kid"] !== "string" || typeof m["spki"] !== "string") {
            throw new Error("Mỗi khoá cần `kid` và `spki` (base64) dạng chuỗi.");
        }
        const spki = Buffer.from(m["spki"], "base64");
        if (spki.length === 0 || spki.toString("base64") !== m["spki"].replace(/\s+/gu, "")) {
            throw new Error(`spki của khoá "${m["kid"]}" không phải base64 hợp lệ.`);
        }
        if (ra.has(m["kid"]))
            throw new Error(`kid "${m["kid"]}" nêu hai lần.`);
        ra.set(m["kid"], {
            kid: m["kid"],
            alg: typeof m["alg"] === "string" ? m["alg"] : "",
            spki,
            dauVanTay: createHash("sha256").update(spki).digest("hex"),
            dauVanTayKhai: typeof m["fingerprint"] === "string" ? m["fingerprint"] : null,
        });
    }
    if (ra.size === 0)
        throw new Error("--khoa không mang khoá nào.");
    return ra;
}
function docChuKy(byte) {
    const van = byte.toString("latin1").trim();
    if (van.length > 0 && /^[A-Za-z0-9+/=\s]+$/u.test(van))
        return Buffer.from(van.replace(/\s+/gu, ""), "base64");
    return byte;
}
function docVanBan(van) {
    if (!van.endsWith("\n"))
        return "văn bản biên nhận phải kết thúc bằng một dòng mới";
    const dong = van.slice(0, -1).split("\n");
    if (dong[0] !== NHAN_DINH_DANG)
        return `dòng đầu phải là "${NHAN_DINH_DANG}"`;
    if (dong.length !== TRUONG_BIEN_NHAN.length + 1)
        return `biên nhận phải có đúng ${String(TRUONG_BIEN_NHAN.length + 1)} dòng`;
    const ra = {};
    for (const [i, ten] of TRUONG_BIEN_NHAN.entries()) {
        const d = dong[i + 1] ?? "";
        if (d.includes("\r"))
            return "biên nhận mang ký tự CR — văn bản đã bị đổi xuống dòng sau khi ký";
        const vt = d.indexOf("=");
        if (vt <= 0 || d.slice(0, vt) !== ten)
            return `dòng ${String(i + 2)} phải là "${ten}=..."`;
        ra[ten] = d.slice(vt + 1);
    }
    if (ra["alg"] !== THUAT_TOAN)
        return `alg phải là ${THUAT_TOAN}`;
    if (!HEX64.test(ra["ciphertext_sha256"] ?? ""))
        return "ciphertext_sha256 không phải 64 ký tự hex thường";
    return ra;
}
function laP256(spki) {
    try {
        return createPublicKey({ key: spki, format: "der", type: "spki" }).asymmetricKeyDetails?.namedCurve === "prime256v1";
    }
    catch {
        return false;
    }
}
function kiemBienNhanBangKhoa(vanBan, chuKy, khoa, dauVanTayNeo = null) {
    const hong = (lyDo) => ({ ok: false, dong: [`LOI-BIEN-NHAN\t${lyDo}\n`, "ok=false\n"] });
    const truong = docVanBan(vanBan.toString("utf8"));
    if (typeof truong === "string")
        return hong(truong);
    const kid = truong["kid"] ?? "";
    const k = khoa.get(kid);
    if (k === undefined)
        return hong(`kid "${kid}" của biên nhận không có trong khoá đã dán`);
    if (k.dauVanTayKhai !== null && k.dauVanTayKhai !== k.dauVanTay) {
        return hong(`fingerprint khai ${k.dauVanTayKhai} khác SHA-256 của spki ${k.dauVanTay} — tài liệu khoá không nhất quán`);
    }
    if (k.alg !== "" && k.alg !== THUAT_TOAN)
        return hong(`khoá "${kid}" khai alg ${k.alg}, biên nhận cần ${THUAT_TOAN}`);
    if (!laP256(k.spki))
        return hong(`khoá "${kid}" không phải khoá công khai P-256`);
    if (dauVanTayNeo !== null && dauVanTayNeo.toLowerCase() !== k.dauVanTay) {
        return hong(`dấu vân tay của khoá "${kid}" là ${k.dauVanTay}, khác --dau-van-tay ${dauVanTayNeo.toLowerCase()}`);
    }
    let dung = false;
    try {
        dung = verify("sha256", vanBan, { key: k.spki, format: "der", type: "spki", dsaEncoding: "der" }, chuKy);
    }
    catch {
        dung = false;
    }
    if (!dung)
        return hong(`chữ ký không khớp văn bản với khoá "${kid}"`);
    return {
        ok: true,
        dong: [
            `bien-nhan\tkid=${kid}\tdau-van-tay=${k.dauVanTay}\trfq=${truong["rfq_id"] ?? ""}\tbid=${truong["bid_id"] ?? ""}` +
                `\tversion=${truong["version"] ?? ""}\tnop-luc=${truong["submitted_at"] ?? ""}\n`,
            "ok=true\n",
        ],
    };
}
return Object.freeze({ docKhoaDaDan, docChuKy, kiemBienNhanBangKhoa });
})();

// ---- packages/danh-gia/src/dac-ta.ts
const __tp_m3 = (() => {
const DAC_TA_PHIEN_BAN = 10;
const DAC_TA = `# Đặc tả phép tính của bộ bằng chứng đánh giá — TrustProcure

Phiên bản đặc tả: **10**

Văn bản này đủ để tính lại mọi con số trong \`bo-bang-chung.json\` **mà không cần một dòng mã nào
của TrustProcure** và **không cần truy cập cơ sở dữ liệu của nó**. Nếu một chỗ nào dưới đây không
đủ rõ để anh cài lại, đó là một khiếm khuyết của văn bản này, không phải của người đọc.

## 1. Mọi con số là CHUỖI thập phân, không phải số dấu phẩy động

Mọi giá trị tiền và hệ số trong bundle là chuỗi (\`"100.00"\`, \`"1.2500"\`). Đọc chúng bằng một
kiểu số nguyên chính xác tuỳ ý hay bằng số học thập phân; **không** đọc bằng \`double\`/\`float\`.
\`0.1 + 0.2 !== 0.3\` là đủ để đảo thứ tự hai báo giá cách nhau một xu, và thứ tự ấy quyết ai được
trao thầu.

## 2. Số chữ số thập phân

* Tiền (\`giaTri\`, \`tien\`, \`effectiveCost\`): **đúng 2** chữ số thập phân.
* Hệ số (\`he_so\` của chính sách): **tối đa 4** chữ số thập phân.

## 3. Chi phí hiệu dụng của một hàng

Đầu vào của một hàng gồm hai thứ, cả hai nằm trong bundle:

* \`chinhSachThanhPhan\` — mảng \`{ ma, don_vi, he_so }\` của phiên bản chính sách ĐÃ DÙNG cho
  lượt chấm ấy;
* \`components[].giaTri\` của hàng — giá trị báo giá khai cho từng mã. Với hai mã QUY ĐỔI
  (\`chi_phi_thanh_toan\`, \`chi_phi_tre\`), \`giaTri\` không do nhà cung cấp gõ mà tính từ lời khai và
  tham số của gói; nó tự tính lại được theo §9 trước khi vào bước dưới.

Thuật toán:

1. Nếu hai thành phần chính sách trùng \`ma\`, hay một \`ma\` của hàng không có trong chính sách,
   hay một \`ma\` của chính sách không có trong hàng, hay chính sách không có thành phần
   \`don_vi = "TIEN"\` nào: hàng **không tính lại được**. Đó là một kết luận, không phải một lỗi.
2. Với mỗi thành phần của **chính sách**, theo đúng thứ tự chính sách khai:
   * \`don_vi = "DIEM"\` ⇒ \`tien = null\`. Thành phần ấy **không** cộng vào tổng. Nó vẫn có mặt
     trong bảng, vì bỏ nó đi là nói dối về thứ chính sách đã khai.
   * \`don_vi = "TIEN"\` ⇒ \`tien = LÀM_TRÒN(giaTri × he_so, 2)\`.
   * \`don_vi\` khác hai giá trị trên ⇒ hàng không tính lại được.
3. \`effectiveCost\` = **tổng ĐÚNG** của mọi \`tien\` không null. Tổng **không** được làm tròn
   thêm một lần nữa.

**Làm tròn ở đâu là một quyết định, và nó được nói ra:** làm tròn TỪNG thành phần rồi cộng, chứ
không cộng rồi làm tròn một lần. Hai cách cho kết quả khác nhau — đo trên 200 000 bộ 2–6 thành
phần: khác ở **38,5 %** số bộ, lệch lớn nhất gặp được **0,03**. Cách ở đây được chọn để phép kiểm
của người ngoài là một phép CỘNG, tức công cụ yếu nhất có thể.

## 4. Luật làm tròn: NỬA-RA-XA-0

\`LÀM_TRÒN(x, 2)\` giữ 2 chữ số thập phân; phần bị cắt bằng đúng một nửa thì làm tròn **ra xa số
không**:

| x | LÀM_TRÒN(x, 2) |
|---|---|
| \`0.005\` | \`0.01\` |
| \`-0.005\` | \`-0.01\` |
| \`0.004999\` | \`0.00\` |
| \`-0.004999\` | \`0.00\` |

Đây là luật của \`round(x, 2)\` trong PostgreSQL, **không** phải luật mặc định của nhiều thư viện
(\`nửa-lên\`, hay \`nửa-về-số-chẵn\` của IEEE 754). Hai luật \`nửa-lên\` và \`nửa-ra-xa-0\` chỉ
khác nhau ở **số âm** — một bảng ca toàn số dương không phân biệt được chúng.

Kết quả \`-0.00\` viết là \`0.00\`: bảng xếp hạng không có hai số không.

## 5. Xếp hạng

1. Bỏ ra ngoài mọi hàng không có \`effectiveCost\`.
2. Sắp các hàng còn lại theo \`effectiveCost\` **tăng dần** (rẻ nhất hạng 1).
3. Hạng của hàng ở vị trí thứ \`k\` (đếm từ 1) là \`k\`, **trừ khi** \`effectiveCost\` của nó bằng
   đúng hàng liền trước — khi ấy nó nhận CÙNG hạng với hàng liền trước.
   Ví dụ bốn giá \`10, 20, 20, 30\` cho hạng \`1, 2, 2, 4\`.
4. Hàng không có \`effectiveCost\` nhận hạng \`null\`. Nó **không** lên đầu bảng và **không**
   chiếm một hạng.

## 6. Chi phí hiệu dụng và xếp hạng KHÔNG đọc đồng hồ

Không một bước nào ở §3–§5 dùng thời gian. Mọi trường thời gian của lớp chấm thầu là **tin về sự
kiện**, không phải đầu vào của phép tính — nên một đồng hồ lệch không đổi được một con số nào ở đó.

Lớp dữ liệu nền ở §8 thì **CÓ**: cửa sổ lịch sử và thứ tự "trước hay sau mốc" là đầu vào của nhãn.
Mọi mốc ở lớp ấy đến từ CÙNG đồng hồ của cơ sở dữ liệu, nên nhãn tính lại đúng **tương đối với các
mốc trong bundle** — không với thời gian thực.

Điều ấy được nói ra vì hệ thống sinh ra bundle này **có** một khiếm khuyết đồng hồ đã đo và đã
ghi: mọi mốc thời gian dưới đây đến từ đồng hồ của cơ sở dữ liệu lúc ghi, và **nguồn thời gian ấy
chưa được chứng thực**. Mỗi trường thời gian trong bundle vì thế đi kèm trường \`nguon\` nói đúng
điều đó. Đừng dùng chúng để phán xử *đúng hạn hay quá hạn*; chúng đủ để đối chiếu THỨ TỰ các sự
kiện trong cùng một bundle, và chỉ chừng ấy.

## 7. Thứ đặc tả này KHÔNG nói

Nó không nói ai được trao thầu là **đúng**. Trao thầu cho hàng hạng 1 không phải một luật của sản
phẩm: một bên mua có thể trao cho hàng hạng khác và ghi lý do. Bundle mang \`traoThau[]\` cùng hạng
của báo giá được chọn để người đọc **thấy** điều đó, không phải để một bộ kiểm phán xử nó.

Nó cũng không nói chuỗi sổ kiểm toán có bị sửa hay không — câu hỏi ấy do mốc neo ngoài trả lời
(\`pnpm neo\`), một artefact khác, ký bằng một khoá khác.

Mỗi hàng của lượt chấm mang \`ghiChu\`: ghi chú tự do nhà cung cấp viết và niêm phong **cùng giá**
(hãng, xuất xứ, chỗ chào khác mô tả), nguyên văn, hay \`null\` khi phong bì không có. Nó là **dữ liệu**,
không đi vào phép tính nào ở §3–§5 và không tính lại được; nó có mặt để người đọc thấy vì sao một bên
mua có thể chọn báo giá khác hạng 1 (xem đoạn trên).

## 8. Lớp dữ liệu nền — benchmark giá \`TRUNG_VI_THEO_GOI_V1\`

Trường \`duLieuNen\` của \`bo-bang-chung.json\`. Lớp phải mang **mọi** lượt chấm có
\`luotCham[].coBenchmark = true\` (phiên bản chính sách của lượt ấy cấu hình nhóm \`benchmark\`) và
**không** mang lượt nào có \`coBenchmark = false\`. \`null\` chỉ hợp lệ khi không lượt chấm nào có
\`coBenchmark = true\`; một lớp \`null\` trong khi có lượt cần nó là bundle **sai**, không phải
"không có gì để kiểm". Mục này đủ để tính lại **nhãn, chiều, lý do và mọi số đếm** của từng dòng của
từng báo giá trong từng lượt chấm, từ đơn giá đã quy đổi mang trong bundle.

### 8.1 Định danh băm

\`goi\` và \`ncc\` của một quan sát là định danh gói thầu và nhà cung cấp, **băm với một muối
ngẫu nhiên sinh cho riêng lần xuất này rồi vứt** (HMAC-SHA256, muối 32 byte, giữ 128 bit đầu).
Muối không nằm trong bundle. Hai mã bằng nhau ⇔ cùng một gói (hay một nhà cung cấp) **trong bundle
này**. \`goiX\` là mã của chính gói thầu của bundle, cùng muối.

\`nhomNcc\` của một quan sát là khoá **nhóm nhà cung cấp độc lập** của \`ncc\` tại \`mocMoGia\` của
bảng, băm cùng muối với một tiền tố khác: hai quan sát cùng \`nhomNcc\` ⇔ hai nhà cung cấp của chúng
là **một nhóm** — chung mười chữ số đầu của mã số thuế (mã chi nhánh \`-NNN\` gộp về gốc), chung một
email hay chung chín chữ số cuối điện thoại của bất kỳ người liên hệ nào, bắc cầu, chỉ xét hồ sơ và
người liên hệ đã có **trước** \`mocMoGia\`. Cùng \`ncc\` thì cùng \`nhomNcc\`; không mã nào nối
\`nhomNcc\` về một \`ncc\`. Phép nhóm là dữ liệu của hệ thống, không tính lại ở đây (§8.8).

Phép băm chặn **đọc ra** định danh thật từ mã. Nó **không** chặn hai thứ, và đặc tả nói ra:
* **khớp** (\`ngay\`, \`gia\`, \`tienTe\`) của một quan sát với lịch sử giá của chính tổ chức — người
  đã đọc được lịch sử ấy trong hệ thống nhận ra gói nào đứng sau một mã;
* **nối** hai bundle của cùng tổ chức qua các quan sát chung — mã khác nhau nhưng (\`ngay\`,
  \`gia\`) trùng.

Để giảm phép khớp, \`ngay\` chỉ là ngày (§8.2) và thứ tự quan sát trong bảng theo **nội dung**
(\`ngay\`, \`gia\`, \`tienTe\`, …), không theo định danh. Bundle là một nơi mang giá; chia sẻ nó
là chia sẻ giá.

Hàng ánh xạ hồi tố (§8.9) mang thêm, cho dòng của gói KHÁC mà một ánh xạ hồi tố trỏ tới: **mô tả và đơn vị** người mua đã viết,
và **họ tên** người ghi ánh xạ. Mô tả không phải giá, nhưng cùng (\`ngay\`, \`gia\`) nó giúp nhận ra gói đứng sau một mã dễ hơn — cùng
loại phép khớp ở trên, không chặn được bằng phép băm.

### 8.2 Thời điểm

Mọi mốc của lớp này — \`mocMoGia\`, \`docLuc\`, \`tuNgay\`, \`cuaSoTu\`, \`ghiLuc\` của §8.7 — là chuỗi
ISO 8601 UTC với **đúng sáu** chữ số lẻ của giây: \`2026-03-31T09:15:00.123456Z\`. Mọi mốc cùng
dạng, nên **so hai chuỗi theo thứ tự từ điển là so hai thời điểm**.

Riêng \`ngay\` của một quan sát có **hai** dạng:
* **ngày UTC trơn** \`2026-03-01\` — dạng thường;
* **mốc đủ micro giây** như trên — khi ngày UTC của nó là một **ngày biên**: ngày của
  \`mocMoGia\`, hay ngày của \`cuaSoTu\` của một lượt chấm dùng bảng ấy.

Ngoài ngày biên, ngày trơn đủ để phán xử cửa sổ bằng chính phép so chuỗi của §8.5: khi mốc \`M\`
không rơi vào ngày \`D\`, \`D\` đứng trước \`M\` theo thứ tự từ điển ⇔ mọi thời điểm của ngày
\`D\` đứng trước \`M\`. Một ngày trơn **trên** ngày biên của dòng đang tính là bundle **sai** —
bộ kiểm báo lỗi, không xếp quan sát ấy vào hay ra.

### 8.3 Cửa sổ

\`cuaSoTu\` = \`mocMoGia\` lùi \`cua_so_thang\` tháng **theo lịch ngày Việt Nam** (UTC+7, không giờ
mùa hè): cộng 7 giờ vào \`mocMoGia\`; trên ngày giờ thu được, lùi (năm, tháng) đi \`cua_so_thang\`
tháng; giữ ngày, nhưng nếu tháng đích ngắn hơn thì **kẹp về ngày cuối của tháng đích**; giữ nguyên
giờ, phút, giây và micro giây; rồi trừ 7 giờ. Năm nhuận: chia hết cho 4 và (không chia hết cho 100
hoặc chia hết cho 400).

| \`mocMoGia\` | \`cua_so_thang\` | \`cuaSoTu\` |
|---|---|---|
| \`2026-03-31T09:15:00.123456Z\` | 1 | \`2026-02-28T09:15:00.123456Z\` |
| \`2024-03-31T00:00:00.000000Z\` | 1 | \`2024-02-29T00:00:00.000000Z\` |
| \`2026-01-15T23:59:59.999999Z\` | 12 | \`2025-01-15T23:59:59.999999Z\` |
| \`2026-03-30T18:00:00.000000Z\` | 1 | \`2026-02-27T18:00:00.000000Z\` |
| \`2028-02-28T17:30:00.000007Z\` | 12 | \`2027-02-27T17:30:00.000007Z\` |

Hai hàng cuối là chỗ lịch này khác lịch UTC: \`2026-03-30T18:00:00.000000Z\` là 01:00 ngày 31/3 giờ
Việt Nam, lùi một tháng ra 01:00 ngày 28/2 giờ Việt Nam. Đây là cùng lịch với cửa sổ ngày của dải lịch
sử mua ngoài hệ thống và với tháng của cổng (e) — một lịch cho cả ba. **Bundle mang \`dacTaPhienBan\`
≤ 7 tính cửa sổ theo lịch UTC** (không cộng, không trừ 7 giờ): \`DAC-TA.md\` đi kèm chính bundle ấy là
chữ đúng cho nó.

### 8.4 Đầu vào

* \`chinhSachBenchmark\` của lượt chấm — \`cua_so_thang\`, \`san_goi\`, \`san_ncc\` (số nguyên),
  \`nguong_lech_vua\`, \`nguong_lech_cao\` (chuỗi thập phân), \`phuong_phap\`.
  Ràng buộc (bundle ngoài ràng buộc là bundle sai): \`cua_so_thang\` nguyên 1–60; \`san_goi\`,
  \`san_ncc\` nguyên 1–50; \`0 < nguong_lech_vua < nguong_lech_cao ≤ 10\`, tối đa bốn chữ số lẻ;
  \`phuong_phap = "TRUNG_VI_THEO_GOI_V1"\` (và \`duLieuNen.phuongPhap\` cũng vậy).
* \`bangQuanSat[]\` — với mỗi (\`mocMoGia\`, \`hangChuan\`): mọi quan sát hợp lệ có \`ngay\` từ
  \`tuNgay\` (biên cửa sổ **rộng nhất** trong các lượt chấm dùng bảng — không lề) tới trước
  \`mocMoGia\`. Mỗi quan sát: \`goi\`, \`ncc\`, \`ngay\` (mốc mở giá của gói chứa nó, §8.2),
  \`gia\` (đơn giá đã quy đổi về đơn vị gốc của hàng chuẩn), \`tienTe\`, \`cungNguoiTao\`,
  \`hoiTo\`, \`nhomNcc\` (§8.1), \`anhXa\` (§8.9 — không phải đầu vào của phép tính).
* \`dong[].giaDong\` — giá của CHÍNH dòng ấy tại \`docLuc\` (lúc chấm): \`trangThai\`, \`gia\`,
  \`tienTe\`, \`hangChuan\`, \`hoiTo\`, \`anhXaId\` (hàng ánh xạ hiệu lực); \`null\` khi lúc ấy không ánh xạ hiệu lực nào trỏ dòng về
  một hàng chuẩn.

### 8.5 Một dòng

**Đủ dòng:** với mỗi lượt chấm của lớp, mỗi cặp (báo giá có hạng ở lớp chấm thầu, dòng của
\`hangMuc[]\`) có **đúng một** hàng ở \`dong[]\` — không thiếu, không trùng; và không hàng nào của
\`dong[]\` thuộc một báo giá không có hạng.

1. \`giaDong = null\` ⇒ nhãn \`KHONG_DO_DUOC\`, \`lyDo = "CHUA_ANH_XA"\`.
2. \`giaDong.trangThai ≠ "HOP_LE"\` ⇒ nhãn \`KHONG_DO_DUOC\`, \`lyDo = giaDong.trangThai\`.
   Ở cả hai trường hợp, \`tienTe\`, \`cuaSoTu\`, bảy số đếm và \`soLoaiGoiHuy\` là \`null\`. Ở trường hợp 1, dòng
   **không** có \`anhXa\`, \`hangChuan = null\` và \`hoiTo = []\`.
3. Còn lại: \`p = giaDong.gia\`, \`T = giaDong.tienTe\`. Lấy bảng quan sát của (\`mocMoGia\`,
   \`giaDong.hangChuan\`). Duyệt từng quan sát:
   * \`goi = goiX\` ⇒ bỏ (không quan sát nào của chính gói này);
   * \`ngay ≥ mocMoGia\` hay \`ngay < cuaSoTu\` ⇒ bỏ;
   * \`tienTe ≠ T\` ⇒ bỏ, **đếm** vào \`soLoaiTienTe\`;
   * \`gia = 0\` ⇒ bỏ, **đếm** vào \`soLoaiGia0\`;
   * còn lại: vào **dải**.
4. Số đếm trên dải: \`soQuanSat\` = số quan sát; \`soGoi\` = số \`goi\` khác nhau; \`soNcc\` = số
   \`nhomNcc\` khác nhau — số **nhóm** nhà cung cấp độc lập (§8.1), không phải số \`ncc\`;
   \`soGoiCungNguoiTao\` = số \`goi\` khác nhau có \`cungNguoiTao = true\`;
   \`soQuanSatHoiTo\` = số quan sát có \`hoiTo\` khác rỗng. **Bundle mang \`dacTaPhienBan\` ≤ 8 đếm
   \`soNcc\` theo \`ncc\`** — ba chi nhánh của một nhà là ba.
5. **Sàn:** \`soGoi ≥ san_goi\` **và** \`soNcc ≥ san_ncc\`. Không đạt ⇒ nhãn
   \`CHUA_DU_LICH_SU\`, \`chieu = null\` (số đếm vẫn báo).
6. **Mốc so:** với mỗi \`goi\`, trung vị các \`gia\` của nó; \`m\` = trung vị của các trung vị gói.
   "Trung vị" và "tứ phân vị" ở đây là phân vị **nội suy tuyến tính**: sắp tăng \`x[0..n-1]\`, vị
   trí \`h = (n − 1) · k / 4\` (\`k = 2\` cho trung vị, \`1\`/\`3\` cho Q1/Q3), giá trị
   \`x[⌊h⌋] + (h − ⌊h⌋) · (x[⌊h⌋+1] − x[⌊h⌋])\` — cùng nghĩa \`percentile_cont\` của PostgreSQL. Phép
   tính là **thập phân chính xác**: \`h − ⌊h⌋\` chỉ là \`0\`, \`0,25\`, \`0,5\` hay \`0,75\`.
   (Q1 và Q3 là dải màn hình hiện; chúng không lưu và không đổi nhãn.)
7. **Nhãn:** \`d = |p − m|\`.
   * \`d ≤ nguong_lech_vua · m\` ⇒ \`BINH_THUONG\`, \`chieu = null\`;
   * ngược lại \`chieu = "TREN"\` nếu \`p > m\`, \`"DUOI"\` nếu \`p < m\`; rồi
     \`d ≤ nguong_lech_cao · m\` ⇒ \`LECH_VUA\`, không thì \`LECH_CAO\`.
   So bằng phép nhân, không chia. Biên tính về phía nhẹ hơn: \`d\` bằng đúng ngưỡng là chưa vượt.
8. \`cuaSoTu\` của dòng đo được (kể cả \`CHUA_DU_LICH_SU\`) là cửa sổ ở §8.3; \`tienTe = T\`;
   \`hoiTo\` của dòng là \`giaDong.hoiTo\`.
9. \`soLoaiGoiHuy\` của dòng đo được là số gói **khác** \`goiX\` mà bảng quan sát **không có** vì gói
   đã huỷ trước \`mocMoGia\`, dù giá của nó đã lộ: gói có một dòng mà ánh xạ hiệu lực tại \`mocMoGia\`
   trỏ \`giaDong.hangChuan\`, có phong bì mở **trước** lúc huỷ, và mốc mở giá của nó (phong bì mở sớm
   nhất trước lúc huỷ) nằm trong cửa sổ ở §8.3. Đếm theo hàng chuẩn, **không** theo tiền tệ. Số này
   không đổi nhãn hay số đếm nào ở trên — nó nói rằng lịch sử đã bị gọt. \`null\` ở dòng đo được
   nghĩa là lượt chấm ghi trước khi hệ thống đếm số này.

### 8.6 Đầu vào đã lưu

\`dauVao[]\` của lượt chấm liệt kê, cho mỗi (\`hangChuan\`, \`tienTe\`), mã các quan sát mà lượt chấm
ĐÃ đưa vào dải lúc chấm. Tập ấy phải **bằng** tập ở bước 3 của §8.5. \`dauVaoThieu > 0\` nghĩa là có
đầu vào đã lưu không còn trong bảng quan sát đọc lại — dữ liệu đã đổi ngoài luật chỉ-ghi-thêm, và
lượt chấm ấy không tái lập được.

### 8.7 Ánh xạ

\`dong[].anhXa\` là hàng ánh xạ mà dòng dùng: \`anhXaId\`, \`hangChuan\`, \`tacGia\` (mã người
dùng và họ tên), \`ghiLuc\`, \`nguon\`, \`lyDo\`. Khi \`giaDong ≠ null\`: \`anhXa.anhXaId\` phải
**bằng** \`giaDong.anhXaId\` (hàng hiệu lực tại \`docLuc\`), và \`dong.hangChuan\`,
\`anhXa.hangChuan\`, \`giaDong.hangChuan\` bằng nhau — câu "do ai ánh xạ" đứng trên đúng hàng mà
phép tính đã dùng. *"Dòng ấy do ai ánh xạ, lúc nào, trước hay sau khi giá của chính nó lộ"* là
\`tacGia\`, \`ghiLuc\`, và \`ghiLuc\` so với \`mocMoGia\`. \`tacGia.hoTen\` là họ tên **hiện tại**
của người dùng lúc xuất, không phải lúc ghi; \`tacGia.userId\` là thứ không đổi. \`hangMuc[]\` mang mô tả, đơn vị, số
lượng của từng dòng của gói. Đây là thông tin, không phải đầu vào của phép tính.

### 8.8 Thứ lớp này KHÔNG tính lại

* **\`soLoaiGoiHuy\`** (§8.5 bước 9) là dữ liệu của hệ thống: bundle không mang gói đã huỷ, nên số
  này không đếm lại được ở đây. Bộ kiểm chỉ đòi nó \`null\` ở dòng không đo được và không âm ở dòng đo được.
* **Phép nhóm nhà cung cấp:** \`nhomNcc\` (§8.1) là dữ liệu của hệ thống; bundle không mang mã số
  thuế, email hay điện thoại để tính lại nó.
* **Phép quy đổi đơn vị:** \`gia\` của một quan sát (thành tiền chia cho số lượng nhân hệ số quy
  đổi, qua bí danh đơn vị và phiên bản hàng chuẩn) là dữ liệu của hệ thống, không tính lại ở đây.
* **Cờ \`hoiTo\`** — hàng nền nào được ghi sau khi giá của gói chứa quan sát đã lộ — là dữ liệu. Với cờ \`ANH_XA\`, §8.9
  đối chiếu nó với hàng ánh xạ hồi tố mà quan sát trỏ tới.
* **Tính đầy đủ của bảng quan sát:** bundle cho thấy thứ đã vào dải; nó không chứng được rằng một
  quan sát nào đó KHÔNG bị bỏ sót — ngoài phép so với đầu vào đã lưu ở §8.6.
* **Bản lưu benchmark của bảng so sánh** (thứ màn mở thầu hiện) không nằm trong bundle; bundle mang
  hồ sơ benchmark của **lượt chấm**.

### 8.9 Ánh xạ hồi tố của quan sát

Mỗi bảng của \`bangQuanSat[]\` mang \`anhXaHoiTo[]\`: mỗi hàng ánh xạ **hồi tố** — hàng ánh xạ hiệu lực tại
\`mocMoGia\` của một quan sát có \`ANH_XA\` trong \`hoiTo\` — đúng một lần, gồm \`ma\` (\`a1\`, \`a2\`, … — duy nhất
trong bundle), \`moTa\` và \`donVi\` của dòng **như người mua đã viết** ở gói chứa quan sát, \`hangChuan\`, \`nguon\`
(\`TU_DONG\` hay \`NGUOI_DUYET\`), \`lyDo\`, \`tacGia\` (mã người dùng và họ tên, như §8.7) và \`ghiLuc\`. \`ghiLuc\`
có cùng hai dạng của \`ngay\` (§8.2), với cùng tập ngày biên của bảng. Mỗi quan sát mang \`anhXa\`: mã của hàng ánh xạ hồi tố
của nó, hay \`null\`.

*"Dòng «X» của một gói cũ do ai ánh xạ, lúc nào, trước hay sau khi giá của chính nó lộ"*: tìm hàng có \`moTa\` = «X», đọc
\`tacGia\` và \`ghiLuc\`; hàng nằm trong danh sách này nghĩa là ánh xạ ghi **sau** khi giá của chính gói ấy lộ (lúc ấy là
\`ngay\` của các quan sát trỏ tới hàng). Quan sát có \`anhXa = null\` dùng một ánh xạ ghi **trước** khi giá của gói chứa nó
lộ; bundle không mang người ghi hay lúc ghi của ánh xạ ấy — người ghi khi ấy là người nộp gói kia, và lúc ghi gần như trùng lúc nộp,
tức một định danh của gói (§8.1).

**Tiền đề.** Một dòng chỉ sửa được khi gói còn soạn thảo, và gói chỉ lộ giá sau khi rời soạn thảo. Nên mọi hàng ánh xạ ghi sau lúc
giá lộ mang băm hạng mục hiện tại, và cờ \`ANH_XA\` — có hàng ánh xạ của dòng ghi trong [lúc giá của gói lộ, \`mocMoGia\`) —
**tương đương** "hàng hiệu lực tại \`mocMoGia\` ghi từ lúc giá của gói lộ trở đi".

Bundle **sai** khi:
1. một quan sát có \`ANH_XA\` trong \`hoiTo\` mà \`anhXa = null\`, hay \`anhXa ≠ null\` mà không có \`ANH_XA\`;
2. \`anhXa\` trỏ một mã không có trong \`anhXaHoiTo[]\` của CHÍNH bảng ấy; một hàng của \`anhXaHoiTo[]\` không quan sát
   nào trỏ tới; hay hai hàng cùng \`ma\` trong bundle;
3. \`hangChuan\` của hàng khác \`hangChuan\` của bảng;
4. \`ghiLuc\` không đứng trước \`mocMoGia\`;
5. \`ghiLuc\` đứng trước \`ngay\` của một quan sát trỏ tới nó. So như §8.2: hai mốc đủ micro giây thì so chuỗi; còn lại so
   NGÀY — hai ngày khác nhau phán được; cùng một ngày trơn thì **không phán được**: bộ kiểm đếm và in số ca ấy, không kết luận;
6. \`ghiLuc\` là ngày trơn mà ngày ấy là một ngày biên của bảng — ngày của \`mocMoGia\`, của \`tuNgay\`, hay của \`cuaSoTu\` một
   dòng của lượt chấm dùng \`mocMoGia\` ấy (như \`ngay\` ở §8.2).

Như \`hoiTo\`, hàng ánh xạ hồi tố là **dữ liệu** của hệ thống: bộ kiểm đối chiếu nó với bảng và với cờ, không với cơ sở dữ liệu.
Hệ thống còn cưỡng chế, mà bundle không tự chứng — và chỉ khi giao dịch ghi ánh xạ ĐÃ THẤY bản rõ của gói: người ghi giữ quyền quản
lý dữ liệu; lần tự nối mang \`lyDo = "CHUAN_HOA_HOI_TO"\`, lần duyệt tay mang một lý do khác. Cờ hồi tố xét lúc ghi so với
\`ngay\`, không xét bản rõ đã thấy; nên một hàng hồi tố ghi lúc giao dịch ghi chưa thấy bản rõ — ghi đua với lần mở niêm phong — có
thể không mang lý do. Bộ kiểm không đòi lý do.

## 9. Phép quy đổi TCO

Bundle mang \`goiTco\` — ảnh chụp lúc gói mở: \`tapMa\` (tập mã thành phần của phiên bản chính sách
ghim), \`thamSo\` (nhóm khoá \`tco\` của phiên bản ấy: \`chi_phi_von_nam\`, \`ngay_thanh_toan_chuan\`,
\`ty_le_tre_ngay\`, đều là chuỗi), \`soNgayGiao\` (số ngày giao bên mua yêu cầu). Mỗi trường có thể là
\`null\` ở gói không cấu hình TCO.

Hai mã thành phần không đến thẳng từ lời khai mà QUY ĐỔI từ nó. Phần tử \`components\` của mỗi mã
ấy mang \`nguon\` — bốn chuỗi — và \`giaTri\` của nó tính lại được:

### 9.1 \`chi_phi_thanh_toan\`

\`nguon = { coSo, ngayKhai, ngayChuan, tyLe }\`.

\`giaTri = LÀM_TRÒN( max(0, ngayChuan − ngayKhai) × tyLe × coSo ÷ 365 , 2 )\`

### 9.2 \`chi_phi_tre\`

\`nguon = { coSo, ngayKhai, ngayYeuCau, tyLe }\`.

\`giaTri = LÀM_TRÒN( max(0, ngayKhai − ngayYeuCau) × tyLe × coSo , 2 )\`

Ở cả hai, \`LÀM_TRÒN\` (§4) áp **MỘT lần** lên giá trị ĐÚNG của cả biểu thức — không làm tròn sau
phép nhân hay trước phép chia. Ngày là số nguyên không âm; \`coSo\`, \`tyLe\` là số thập phân không âm.

### 9.3 Nguồn phải khớp thước của gói

Một hàng có mã quy đổi tái lập được khi và chỉ khi, với mỗi mã quy đổi của nó:

1. phần tử có \`nguon\` với ĐÚNG bốn khoá ở 9.1 hay 9.2;
2. \`coSo\` bằng ĐÚNG chuỗi \`giaTri\` của thành phần \`gia\` của CÙNG hàng;
3. \`tyLe\` bằng ĐÚNG chuỗi \`goiTco.thamSo.chi_phi_von_nam\` (9.1) hay \`goiTco.thamSo.ty_le_tre_ngay\`
   (9.2); \`ngayChuan\` bằng ĐÚNG chuỗi \`goiTco.thamSo.ngay_thanh_toan_chuan\`; \`ngayYeuCau\` bằng cách
   viết thập phân của \`goiTco.soNgayGiao\`;
4. \`giaTri\` đã lưu bằng giá trị tính lại ở 9.1 hay 9.2.

Một \`nguon\` không khớp thước của gói là một hàng chấm theo thước KHÁC thước nhà cung cấp đã thấy
lúc nộp. Sau bước này, §3 áp cho mã quy đổi như mọi mã: \`tien = LÀM_TRÒN(giaTri × he_so, 2)\`.

Khi \`goiTco.tapMa\` khác \`null\`, mảng \`ma\` của \`chinhSachThanhPhan\` của MỌI lượt chấm, theo đúng thứ
tự, phải bằng \`goiTco.tapMa\` — tập mã nhà cung cấp thấy lúc nộp là tập mã lượt chấm dùng.

### 9.4 Hàng không hạng

\`maThieu\` liệt kê mã thiếu ô khai của một hàng không có \`effectiveCost\` (hay \`TONG_VUOT_MIEN\` khi
tổng vượt miền tiền). Hàng có \`effectiveCost\` thì \`maThieu = null\`. Ngoài vế ấy, \`maThieu\` là dữ
liệu: lời khai gốc không nằm trong bundle.

\`CHAO_THIEU\`: báo giá có ít nhất một dòng nhà cung cấp đánh dấu *không chào* — \`effectiveCost\` và \`rank\`
của hàng là \`null\` theo luật «không lấy 0» (hàng chào thiếu không bao giờ đứng hạng trên hàng chào đủ), và
\`maThieu\` mang mã này. Bộ kiểm chỉ đòi hàng mang \`CHAO_THIEU\` không có hạng; dòng nào không chào là dữ liệu
của phong bì đã mở, không nằm trong bundle.

### 9.5 Thứ phần này KHÔNG tính lại

Lời khai gốc — \`ngayKhai\`, \`coSo\`, và các ô \`giaTri\` khai thẳng — đến từ phong bì đã mở, không nằm
trong bundle. Bundle chứng phép tính TỪ lời khai và thước của gói; nó không chứng lời khai là đúng
thứ nhà cung cấp đã gõ.

## 10. Cam kết của đề xuất trao thầu

\`traoThau[].camKet\` là cam kết hệ thống chụp LÚC đề xuất — điều khoản của lần đề xuất: thứ người đề
xuất đã thấy và nhận khi chọn báo giá. Chỉ hàng \`status = "PROPOSED"\` mang cam kết; đề xuất có trước
khi hệ thống chụp cam kết mang \`null\` (không lấp ngược). Gọi \`h\` là hàng của lượt chấm \`evaluationId\`
cho báo giá \`bidVersionId\` của chính hàng trao thầu ấy. Cam kết ĐẠT khi:

1. \`hangTco\` bằng \`h.rank\`; \`effectiveCost\` bằng \`h.effectiveCost\`; \`components\` bằng
   \`h.components\` — từng phần tử, từng khoá, kể cả \`nguon\`;
2. \`tapMa\`, \`thamSo\`, \`soNgayGiao\` bằng \`goiTco\`;
3. \`khai\` khớp hàng: khi hàng có mã \`chi_phi_thanh_toan\`, cách viết thập phân của \`khai.paymentDays\`
   bằng \`nguon.ngayKhai\` của mã ấy; \`chi_phi_tre\` ↔ \`khai.leadTimeDays\` cùng cách; \`van_chuyen\` ↔
   \`khai.freight\` (bằng ĐÚNG chuỗi \`giaTri\`); \`nhap_khau\` ↔ \`khai.importCost\`. Ô khai của mã KHÔNG có
   trong hàng là bốn ô hệ thống chụp nguyên văn lúc đề xuất — chép lại, không kiểm;
4. \`hangGia\` bằng hạng giá tính lại: trên các hàng CÓ hạng của cùng lượt chấm, lấy \`tien\` của phần
   tử ĐẦU TIÊN có \`ma = "gia"\`; hàng mà \`tien\` ấy vắng hay không khớp đúng khuôn
   \`^[0-9]{1,16}\\.[0-9]{2}$\` (không dấu, tối đa 16 chữ số nguyên, đúng hai chữ số lẻ) **không vào**
   phép xếp; các hàng còn lại xếp như §5. Hạng giá của báo giá được đề xuất là hạng của nó trong phép
   xếp ấy, \`null\` khi nó không vào phép xếp;
5. \`giaiTrinhLechHang\` khác \`null\` **khi và chỉ khi** \`hangGia ≠ hangTco\` (một bên \`null\` mà bên kia
   không cũng là khác). Khi khác \`null\`, nó có ít nhất một ký tự không phải khoảng trắng — khoảng trắng
   gồm cả khoảng trắng Unicode (U+00A0, U+1680, U+2000–U+200B, U+2028, U+2029, U+202F, U+205F, U+3000,
   U+FEFF) — và tối đa 2000 ký tự (điểm mã);
6. \`chupLuc\` bằng ĐÚNG chuỗi \`actedAt\` của chính hàng trao thầu — cam kết chỉ chụp trong giao dịch đề
   xuất. Gọi \`t₀\` là \`chupLuc\` sớm nhất trong bundle: một hàng \`PROPOSED\` không mang cam kết mà
   \`actedAt ≥ t₀\` (so chuỗi ISO cùng dạng) là bundle sai — từ \`t₀\` hệ thống chụp cam kết cho MỌI đề
   xuất. Khi bundle không còn cam kết nào, đề xuất không cam kết không phân biệt được với đề xuất có
   trước khi hệ thống chụp — bước này không nói gì về nó.

Một hàng trao thầu không phải \`PROPOSED\` mà mang cam kết là bundle sai. Phần này không nói lời giải
trình có thuyết phục không — đó là việc của người đọc, cùng tinh thần §7.

## 11. Lớp quản trị — vì sao gói cần bấy nhiêu nhà cung cấp và bấy nhiêu chữ ký

\`quanTri\` mang dữ liệu để TÍNH LẠI các chốt kiểm soát của gói tại đúng mốc chúng được cưỡng chế. Mọi
mốc là ISO 8601 UTC đủ sáu chữ số lẻ: so hai mốc là so chuỗi. Mọi số tiền và mốc bậc so theo GIÁ TRỊ
thập phân, không theo chuỗi (\`1000000000\` bằng \`1000000000.00\`). "Bậc" là một phần tử của
\`chinhSachNganSach.tiers\`; giá trị của nó là văn bản: số là chuỗi thập phân, \`true\`/\`false\` là chuỗi,
\`award_vai\` là văn bản JSON của một mảng chuỗi. Bậc của mốc \`x\` là bậc có \`tu_so_tien\` bằng \`x\`.

### 11.1 Hai nhóm, hai lớp

Phần này chia hai nhóm: TÍNH LẠI (11.2–11.8) và KHAI (11.9) — giá trị cơ sở dữ liệu đã cưỡng chế mà bộ
không tính lại. Ở nhóm tính lại, lớp ⑴ là giá trị cơ sở dữ liệu tính LÚC XUẤT, mang trong bộ:
\`cheDo\` và \`traoThau[].lop1\` (\`bacUocLuong\`, \`bacTrao\`, \`bacCaoHon\`, \`chuKyCan\`). Lớp ⑵ là phép tính
dưới đây. Lớp ⑴ khác lớp ⑵ là bộ sai.

Chọn bậc cho một số tiền \`v\` tiền tệ \`t\`: \`t\` phải bằng \`chinhSachNganSach.currency\` (không thì không
chọn được — bộ sai); bậc được chọn là bậc có \`tu_so_tien\` LỚN NHẤT trong các bậc có \`tu_so_tien ≤ v\`;
không bậc nào như thế thì không chọn được — bộ sai.

### 11.2 Chế độ

\`cheDo = "S3"\` khi và chỉ khi \`nganSach\`, \`nganSach.tierTuSoTien\` và \`chinhSachNganSach.tiers\` đều khác
\`null\`. Thêm: khi \`goi.nopLuc\` và \`batS3Luc\` cùng khác \`null\` và \`goi.nopLuc ≥ batS3Luc\`, \`cheDo\` phải là
\`"S3"\` — một gói nộp sau lần bật mà không bậc ghim là một gói đi lọt chốt ngân sách.

### 11.3 Bậc ước lượng và ngưỡng kép

Khi \`cheDo = "S3"\`: bậc chọn cho \`nganSach.estimatedValue\`, \`nganSach.currency\` (11.1) phải có
\`tu_so_tien\` bằng \`nganSach.tierTuSoTien\`. Mọi chế độ: \`goi.requiresDualApproval = false\` thì \`nganSach\`
khác \`null\`, \`nganSach.currency\` bằng \`chinhSachNganSach.currency\` và \`estimatedValue <
dualApprovalThreshold\`.

### 11.4 Chữ ký mở gói

Chỉ khi gói đã mở (\`goi.moLuc\` khác \`null\`). Gọi \`c = 2\` nếu \`goi.requiresDualApproval\`, không thì \`1\`.
Ứng viên là MỌI chữ ký có \`bamNoiDung\` khác \`null\` và \`approverUserId ≠ goi.nguoiTao\` — không cắt theo
mốc: cơ sở dữ liệu chỉ nhận chữ ký khi gói đang chờ duyệt, nên mọi chữ ký có trước lần mở. Gói ĐẠT khi
có một nhóm ứng viên cùng (\`bamNoiDung\`, \`bamGiaoHang\`) gồm ít nhất \`c\` người ký khác nhau — cơ sở dữ
liệu đếm đúng một nhóm như thế (nhóm khớp nội dung và số ngày giao hiện hành lúc mở).

MVP1: các ứng viên trên.

S3: ứng viên còn phải có \`lanNopDaXem\` khác \`null\`, không có phần tử \`traVe\` nào với \`returnedBy\` là
người ký và \`lanNop ≥ lanNopDaXem\`, và người ký không có khai báo \`CO_XUNG_DOT\` nào với \`createdAt ≤
moLuc\`; \`bamNganSach\` bằng \`B_ns\` và \`bamDanhSach\` bằng \`B_ds(moLuc)\` dưới đây. Luật nhóm như trên.

\`B_ns\` = SHA-256 (hex chữ thường) của byte UTF-8 của chuỗi \`NGAN_SACH|\` + \`estimatedValue\` + \`|\` +
\`currency\` + \`|\` + \`policyId\` + \`|\` + \`tierTuSoTien\` + \`|\` + \`true\` hay \`false\` (\`goi.requiresDualApproval\`)
— các trường của \`nganSach\`, đúng văn bản trong bộ.

\`B_ds(t)\` = SHA-256 của byte UTF-8 của các dòng dưới đây, xếp theo thứ tự byte, nối bằng một ký tự xuống
dòng (không ký tự cuối); không dòng nào thì là SHA-256 của chuỗi rỗng:
- mỗi lời mời có \`moiSauKhiKy = false\` và (\`revokedAt\` là \`null\` hay \`revokedAt > t\`):
  \`MOI|\` + \`supplierId\` + \`|\` + \`contactId\` + \`|\` + \`linkChannel\`;
- mỗi ngoại lệ có \`hanhDong = "LAP"\` (hàng \`RUT\` mang \`loai\`, \`maLyDo\` là \`null\`), \`loai\` là \`SINGLE_SOURCE\`, \`LIMITED_COMPETITION\` hay \`ROTATION\`,
  \`createdAt ≤ t\`, và không có ngoại lệ \`RUT\` nào trỏ nó (\`ngoaiLeId\`) với \`createdAt ≤ t\`:
  \`NGOAI_LE|\` + \`id\` + \`|\` + \`loai\` + \`|\` + \`maLyDo\` + \`|\` + SHA-256 hex của byte UTF-8 của \`giaiTrinh\`.

### 11.5 Số nhà cung cấp tối thiểu (S3, gói đã nộp)

Gọi \`B\` là bậc của \`nganSach.tierTuSoTien\`, \`t = goi.nopLuc\`, \`n\` là số lời mời có \`createdAt ≤ t\` và
(\`revokedAt\` là \`null\` hay \`revokedAt > t\`). \`B.dau_thau_chinh_thuc\` phải là \`false\`. \`n ≥
B.so_ncc_toi_thieu\` thì qua (điều kiện CẦN: cơ sở dữ liệu đếm NHÓM nhà cung cấp, nhóm không nhiều hơn
lời mời — phép gộp nhóm không tính lại, 11.9). Ngược lại \`n ≥ 1\` và có ngoại lệ \`LAP\` còn sống tại \`t\`
(như 11.4) với \`loai\` là \`SINGLE_SOURCE\` khi \`n = 1\`, \`LIMITED_COMPETITION\` khi \`n ≥ 2\`.

### 11.6 Bậc trao thầu (S3)

Mỗi phần tử \`traoThau\` có \`status = "PROPOSED"\` mang \`lop1\`. Lớp ⑵: \`bacUocLuong = tierTuSoTien\`;
\`bacTrao\` = \`tu_so_tien\` của bậc chọn cho \`soTienTrao\`, \`tienTe\` (11.1); \`bacCaoHon\` = lớn hơn của hai;
\`chuKyCan\` = \`award_so_chu_ky\` của bậc \`bacCaoHon\`. Bốn giá trị bằng \`lop1\`.

### 11.7 Chữ ký trao thầu

Mỗi phần tử \`A\` có \`status = "APPROVED"\`: phần tử đứng ngay trước nó trong \`traoThau\` (mảng xếp theo
\`actedAt\` rồi \`awardId\`) là đề xuất \`P\` — \`status = "PROPOSED"\`, cùng \`bidVersionId\`. Ứng viên là chữ ký
của \`P\` có \`approvedAt ≤ A.actedAt\` và người ký khác \`P.actedBy\`.

MVP1: số người ký khác nhau trong ứng viên ≥ 1.

S3: ứng viên còn phải có người ký không có khai báo \`CO_XUNG_DOT\` nào (với BẤT KỲ nhà cung cấp) có
\`createdAt ≤ A.actedAt\`. Dùng bậc \`H\` có \`tu_so_tien\` bằng \`bacCaoHon\` TÍNH Ở 11.6 (bằng \`P.lop1\` khi
hai lớp đồng ý). Mỗi ứng viên có \`vaiLucKy\` khác rỗng và mọi phần tử nằm trong
\`H.award_vai\`; người ký khác \`chinhSachNganSach.createdBy\`. Khi \`H.tham_dinh_truoc_trao = true\`: gọi \`Q\`
là phần tử \`thamDinh\` của nhà cung cấp \`P.supplierId\` có \`thuTu\` lớn nhất trong các phần tử có
\`createdAt ≤ A.actedAt\`; \`Q\` phải tồn tại, \`Q.loai = "QUALIFIED"\`, \`A.actedAt < Q.hetHanAt\`; ứng viên
chỉ ĐẾM khi \`thamDinhId = Q.id\`; \`Q.createdBy\` không là \`P.actedBy\` và không là người ký đếm nào. Khi
không: mọi ứng viên đếm. Số người ký khác nhau trong chữ ký đếm ≥ \`chuKyCan\` tính ở 11.6; khi \`chuKyCan = 2\`
và \`H.award_vai_khac_nhau = true\`: có hai người ký đếm khác nhau \`x\`, \`y\` và một vai của \`x\` khác một vai
của \`y\`.

### 11.8 Không đạt khi

Ngoài mọi bước trên: một \`awardId\` có ở \`traoThau\` của bộ (§10) mà không có ở \`quanTri.traoThau\`, hay
ngược lại; \`cheDo = "S3"\` mà \`lop1\` của một đề xuất vắng; một phần tử mang \`lop1\` mà không là đề
xuất của gói S3.

### 11.9 Khai — cơ sở dữ liệu đã cưỡng chế, phần này KHÔNG tính lại

\`bamNoiDung\` và \`bamGiaoHang\` (chỉ đòi bằng nhau trong chữ ký đếm); phép gộp nhóm nhà cung cấp của số
tối thiểu; xoay vòng; hậu kiểm số báo giá lúc duyệt trao thầu; người ký độc lập (ngoài tập loại trừ) lúc
mở và lúc trao; nhãn \`moiSauKhiKy\`; \`vaiLucKy\` (cơ sở dữ liệu đặt lúc ký); thẩm định trên phiên bản
Passport MỚI NHẤT, xác minh của nhà cung cấp còn hiệu lực lúc thẩm định, người thẩm định ngoài tập loại trừ
của gói; ghi nhận tín hiệu trước hành
động nó chặn; khai báo \`KHONG_XUNG_DOT\` của bậc đòi khai. Bộ KHÔNG mang cờ hiệu lực nào tính lúc xuất:
cơ sở dữ liệu cưỡng chế lúc hành động, bộ mang dữ liệu để tính lại tại đúng mốc.

### 11.10 Thông tin, không phán xử

Khai báo \`CO_XUNG_DOT\` có \`createdAt\` SAU lúc duyệt của một trao thầu mà người khai đã ký: bộ kiểm BÁO
(cảnh báo), không làm trượt — lần duyệt đúng tại lúc diễn ra (chủ dự án chốt). Giới hạn, nói ra: mốc
khai là giờ BẮT ĐẦU giao dịch khai; một lời khai bắt đầu trước lần duyệt mà ghi xong sau nó làm bước
11.7 trượt dù cơ sở dữ liệu chưa thấy lời khai lúc duyệt — chặt hơn cơ sở dữ liệu, không bao giờ lỏng
hơn. Cùng hình dạng ở mốc cắt \`approvedAt ≤ A.actedAt\` của 11.7: một chữ ký ghi xong trong lúc giao
dịch duyệt đang chạy mà mang giờ bắt đầu MUỘN hơn nó bị loại — trượt oan, không bao giờ cho qua oan.
\`revokedAt\` của lời mời và \`goi.moLuc\` ở tổ chức chưa bật do bên gọi ghi (ở tổ chức đã bật, \`moLuc\` là
giờ bắt đầu giao dịch mở — cơ sở dữ liệu đòi); tín hiệu, lần ghi nhận,
xác minh và lý do thu hồi đi ra để người đọc thấy.

## 12. Lớp rủi ro — đánh giá của đề xuất trao thầu (\`RUI_RO_V1\`, \`RUI_RO_V2\`)

\`ruiRo.danhGia\` mang mỗi ĐÁNH GIÁ RỦI RO của gói: một đánh giá cho một đề xuất trao thầu (\`awardId\` — một phần tử \`PROPOSED\` của
\`traoThau\`), ghi trong chính giao dịch đề xuất ở tổ chức đã bật lớp kiểm soát của S3. Mỗi đánh giá mang các HÀNG YẾU TỐ (\`yeuTo\`), đầu
vào đã ghim của từng hàng (\`dauVao\`), các lần ghi nhận (\`ghiNhan\`) và lời giải trình của người ký (\`giaiTrinh\`), nguyên văn. Định danh là
định danh THÔ của các hàng cùng gói và của người, như §11 — các phép đối chiếu dưới đây nối chúng với lớp quản trị và lớp chấm thầu. Mọi
mốc là ISO 8601 UTC đủ sáu chữ số lẻ, giờ BẮT ĐẦU giao dịch ghi (so chuỗi là so thời gian). Mọi tỷ lệ là PHẦN VẠN, số nguyên, làm tròn
xuống: \`⌊a · 10000 / b⌋\`. Mọi số đếm là số nguyên ≥ 0.

Đánh giá là CHỈ BÁO cần xem xét, không phải kết luận về một người hay một nhà cung cấp. Bộ KHÔNG mang người gây ra của yếu tố.

### 12.1 Hai nhóm, ba lớp

Phần này chia hai nhóm: TÍNH LẠI (12.2–12.8) và KHAI (12.9). Ở nhóm tính lại:
- lớp ⑴ là giá trị ĐÃ LƯU: \`trangThai\`, \`muc\`, \`doTinCay\`, \`bangChung\`, \`giaiThichMau\`, \`giaiThichThamSo\` của từng hàng (ứng dụng tính
  lúc đề xuất); \`trongSo\`, \`nguon\`, \`thoiDiem\` của từng hàng và \`diem\`, \`doPhu\`, \`muc\`, \`coNo\` của đánh giá (cơ sở dữ liệu đặt lúc đề xuất);
- lớp ⑴b là \`taiLapLucXuat\` của mỗi hàng trừ \`DO_PHU\`: sáu trường đầu của lớp ⑴ mà hệ thống TÍNH LẠI LÚC XUẤT bộ, bằng chính phép tính
  của nó, trên ĐÚNG đầu vào đã ghim và dữ liệu gốc mà bộ không mang (dòng bản rõ, giờ nộp từng phiên bản). Bộ kiểm ngoại tuyến không tự
  chứng được lớp ⑴b; nó đòi lớp ⑴b BẰNG lớp ⑴ từng trường (đối tượng so không kể thứ tự khoá). Khác nhau nghĩa là hàng lưu không phải kết
  quả của phép tính trên đầu vào của chính nó;
- lớp ⑵ là phép tính dưới đây, từ dữ liệu trong bộ.
Lớp ⑴ khác lớp ⑴b hay lớp ⑵ là bộ sai.

### 12.2 Hằng của phương pháp

Hai phiên bản cài: \`RUI_RO_V1\` và \`RUI_RO_V2\`. Chúng có CÙNG tập mã, CÙNG trọng số mặc định, CÙNG sàn trọng số, CÙNG mẫu số của độ
phủ và CÙNG mọi ngưỡng; chúng khác nhau ĐÚNG một chỗ: mã nào mang \`CHUA_CAI\` (chưa cài phép tính). Một đánh giá có
\`phienBanPhuongPhap\` ngoài hai tên ấy là một đánh giá phần này không phán: bộ sai với bộ kiểm cài phần này. Mã mẫu giải thích mang
phiên bản: \`<mã>_V1_<trạng thái>\` hay \`<mã>_V2_<trạng thái>\`.

| Mã | Trọng số mặc định | Sàn | Có lịch sử | Ở V1 | Ở V2 |
|---|---|---|---|---|---|
| F1 | 20 | 10 | có | \`CHUA_CAI\` | tính (chuỗi) |
| F2b | 15 | 8 | có | \`CHUA_CAI\` | tính (chuỗi) |
| F3 | 15 | 8 | có | tính | tính |
| F4 | 5 | 3 | có | \`CHUA_CAI\` | tính (chuỗi) |
| F5 | 10 | 5 | không | tính | tính |
| F6 | 10 | 5 | không | tính | tính |
| F7 | 5 | 3 | không | tính | tính |
| F8 | 10 | 5 | không | \`CHUA_CAI\` | \`CHUA_CAI\` |
| F9 | 10 | 5 | không | tính | tính |
| F10 | 10 | 5 | không | tính | tính |
| F11 | 5 | 3 | không | tính | tính |

Ngưỡng độ phủ: 60 %. Ngưỡng mức: \`CAO\` khi điểm ≥ 60, \`VUA\` khi điểm ≥ 30. Điểm của một mức: \`XANH\` 0, \`VANG\` 50, \`DO\` 100. Ngoài mười
một mã còn hàng \`DO_PHU\` — hàng của độ phủ thấp, không trọng số.

### 12.3 Tập hàng và trọng số

\`yeuTo\` có đúng một hàng cho mỗi mã của bảng 12.2, cộng một hàng \`DO_PHU\` khi và chỉ khi \`muc\` của đánh giá là \`KHONG_XAC_DINH\`, không
hàng nào khác. Mọi hàng có \`thoiDiem = mocDeXuat\`. \`nguon\` theo mã: F3 \`price_benchmark_results+bid_dong_tho\`, F5 \`vendor_bid_versions\`,
F6 \`governance_signals+rfq_sourcing_exceptions\`, F7 \`bid_dong_tho\`, F9 \`rfq_evaluation_lines+bid_dong_tho\`, F10
\`rfq_evaluation_lines+rfq_invitations\`, F11 \`rfq_awards\`, \`DO_PHU\` \`rui_ro_tong_hop\`, mã \`CHUA_CAI\` ở V1 \`CHUA_CAI\`.

\`trongSoChinhSach\` là trọng số khai trên phiên bản chính sách ghim của gói (\`policyId\`), hay \`null\`. Khi khác \`null\`: đúng mười một khoá
của bảng 12.2, mỗi giá trị là một chuỗi gồm một chữ số 1–9 theo sau bởi không quá hai chữ số 0–9, và không nhỏ hơn sàn của mã. \`trongSo\`
của một hàng bằng giá trị ấy (đọc như số nguyên) khi \`trongSoChinhSach\` khác \`null\`, không thì bằng trọng số mặc định; hàng \`DO_PHU\` có
\`trongSo = null\`. Trọng số chỉ đổi ĐIỂM — độ phủ đọc trọng số MẶC ĐỊNH (12.5).

### 12.4 Một hàng

\`giaiThichMau\` = mã + \`_V1_\` + \`trangThai\` (ví dụ \`F3_V1_CO_DU_LIEU\`). \`muc\` và \`doTinCay\` là \`null\` khi và chỉ khi \`trangThai\` khác
\`CO_DU_LIEU\`. Mỗi nhánh dưới đây nêu ĐÚNG tập khoá của \`bangChung\` và ĐÚNG tập khoá của \`giaiThichThamSo\` (giá trị tham số bằng giá trị
cùng khoá trong \`bangChung\`, trừ chỗ nêu khác); một phần vạn là số nguyên trong [0, 10000].

**F1, F2b, F4, F8** — \`trangThai = CHUA_CAI\`; \`bangChung\` và \`giaiThichThamSo\` rỗng.

**F3** — giá dòng của báo giá được đề xuất so với dải nội bộ. Theo \`lyDo\`:
- \`CHUA_CAU_HINH\` hay \`KHONG_CO_GIA_TRI\`: \`CHUA_DU_LICH_SU\`; khoá \`soDong\`, \`lyDo\`; tham số \`soDong\`.
- \`DO_PHU_THAP\`: \`CHUA_DU_LICH_SU\`; khoá \`soDong\`, \`soDongDoDuoc\`, \`doPhuPhanVan\`, \`lyDo\`, với \`doPhuPhanVan < 5000\` và
  \`soDongDoDuoc ≤ soDong\`; tham số \`soDong\`, \`doPhuPhanVan\`.
- không có \`lyDo\`: \`CO_DU_LIEU\`; khoá \`soDong\`, \`soDongDoDuoc\`, \`soDongLechCaoTren\`, \`doPhuPhanVan\`, \`tyLeLechCaoTrenPhanVan\`, với
  \`doPhuPhanVan ≥ 5000\`, \`1 ≤ soDongDoDuoc ≤ soDong\`, \`soDongLechCaoTren ≤ soDongDoDuoc\`, và \`soDongLechCaoTren = 0\` thì
  \`tyLeLechCaoTrenPhanVan = 0\`. \`muc\`: \`DO\` khi \`tyLeLechCaoTrenPhanVan ≥ 3000\`, \`VANG\` khi ≥ 1000, còn lại \`XANH\`. \`doTinCay\`: \`THAP\`
  khi \`doPhuPhanVan < 10000\`, còn lại \`VUA\`. Tham số \`doPhuPhanVan\`, \`tyLeLechCaoTrenPhanVan\`.
Phần vạn làm tròn xuống giữ đúng phép so ngưỡng: với \`k\` nguyên, \`⌊x⌋ ≥ k\` khi và chỉ khi \`x ≥ k\`.

**F5** — nhịp nộp trong vòng của báo giá được đề xuất. \`CO_DU_LIEU\`; khoá \`soNccNopCuoi10Phut\`, \`soCap60Giay\`, \`soLanSuaCuaN10Phut\`,
\`cap\`; \`cap\` là mảng các cặp, mỗi cặp một mảng hai chuỗi khác nhau, không hai cặp nào cùng hai chuỗi; \`soCap60Giay\` bằng số cặp. \`muc\`:
\`DO\` khi \`soCap60Giay ≥ 2\`; \`VANG\` khi \`soCap60Giay ≥ 1\` hay \`soLanSuaCuaN10Phut ≥ 3\`; còn lại \`XANH\`. \`doTinCay = CAO\`. Tham số ba số
đếm.

**F6** — tín hiệu kiểm soát và ngoại lệ cạnh tranh của gói. \`CO_DU_LIEU\`; khoá \`tinHieu\`, \`ngoaiLe\` — mỗi khoá một mảng đối tượng đúng
hai khoá \`loai\`, \`id\`. \`loai\` của tín hiệu là \`ESTIMATE_UNDERSTATED\` hay \`INVITE_LIST_NARROWED\` (tín hiệu ĐỎ) hay \`EARLY_CLOSE\`; của
ngoại lệ là \`SINGLE_SOURCE\`, \`LIMITED_COMPETITION\`, \`ROTATION\`, \`LOW_ACTUAL_COMPETITION\` hay \`LIST_NARROWED_BELOW_MIN\`. \`muc\`: \`DO\` khi
có tín hiệu đỏ; \`VANG\` khi có tín hiệu khác hay có ngoại lệ; còn lại \`XANH\`. \`doTinCay = CAO\`. Tham số \`soTinHieuDo\`, \`soTinHieuKhac\`,
\`soNgoaiLe\` — ba số đếm từ hai mảng.

**F7** — tính nguyên vẹn của báo giá được đề xuất. \`lyDo = TONG_KHONG_DOC_DUOC\`: \`KHONG_AP_DUNG\`, khoá \`lyDo\`, tham số rỗng. Còn lại
\`CO_DU_LIEU\`; khoá \`soDong\`, \`soDongHong\`, \`soDongThieu\`, \`soDongLa\`; \`muc\` \`DO\` khi \`soDongHong + soDongThieu + soDongLa > 0\`, không thì
\`XANH\`; \`doTinCay = CAO\`; tham số \`soDongHong\`, \`soDongThieu\`, \`soDongLa\`.

**F9** — phân bổ giá giữa các dòng. Có \`lyDo\`: \`KHONG_AP_DUNG\`, khoá \`soBaoGiaTheoDong\`, \`lyDo\`, tham số \`soBaoGiaTheoDong\`, với \`lyDo\`
là \`N_KHONG_DOC_DUOC_THEO_DONG\` (mọi \`soBaoGiaTheoDong\`), \`DUOI_BA_BAO_GIA\` (\`soBaoGiaTheoDong < 3\`), \`KHONG_CO_GIA_TRI\` hay
\`DUOI_BA_BAO_GIA_CO_GIA_TRI\` (\`soBaoGiaTheoDong ≥ 3\`). Không có \`lyDo\`: \`CO_DU_LIEU\`; khoá \`soBaoGiaTheoDong\`, \`soDong\`, \`soDongTySoTu2\`,
\`soDongTySoDen05\`, \`tySoLonNhat\`, \`tyLeGiaTriTySoTu2PhanVan\`, với \`soBaoGiaTheoDong ≥ 3\`, \`soDongTySoTu2 ≤ soDong\`,
\`soDongTySoDen05 ≤ soDong\`, \`soDongTySoTu2 = 0\` thì \`tyLeGiaTriTySoTu2PhanVan = 0\`, và \`tySoLonNhat\` là \`null\` hay một chuỗi thập phân
đúng hai chữ số lẻ. \`muc\`: \`DO\` khi \`tyLeGiaTriTySoTu2PhanVan ≥ 3000\`, \`VANG\` khi ≥ 1000, còn lại \`XANH\`. \`doTinCay\`: \`THAP\` khi
\`soBaoGiaTheoDong < 6\`, còn lại \`VUA\`. Tham số \`soBaoGiaTheoDong\`, \`soDongTySoTu2\`, \`tyLeGiaTriTySoTu2PhanVan\`.

**F10** — cạnh tranh thực. \`CO_DU_LIEU\`; khoá \`soBaoGiaDocDuoc\`, \`soLoiMoiConSong\`; \`muc\` \`DO\` khi \`soBaoGiaDocDuoc ≤ 1\`, \`VANG\` khi
bằng 2, còn lại \`XANH\`; \`doTinCay = CAO\`; tham số hai số.

**F11** — đề xuất trước bị huỷ hay rút. \`CO_DU_LIEU\`; khoá \`soDeXuatTruocDaHuyHayRut\`; \`muc\` \`DO\` khi ≥ 2, \`VANG\` khi bằng 1, \`XANH\`
khi 0; \`doTinCay = CAO\`; tham số một số.

**\`DO_PHU\`** — \`CO_DU_LIEU\`, \`muc = DO\`, \`doTinCay = CAO\`; khoá \`doPhuPhanVan\`, bằng \`doPhu\` của đánh giá; tham số như vậy.

Không khoá nào của \`bangChung\` hay \`giaiThichThamSo\`, ở bất kỳ độ sâu nào kể cả trong mảng, trùng (không phân biệt hoa thường) một khoá
tiền: \`tien\`, \`gia\`, \`so_tien\`, \`soTien\`, \`amount\`, \`unitPrice\`, \`totalAmount\`, \`don_gia\`, \`donGia\`, \`thanh_tien\`, \`thanhTien\`,
\`price\`, \`total\`, \`effective_cost\`, \`effectiveCost\`, \`estimated_value\`, \`estimatedValue\`, \`gia_tri\`, \`giaTri\`, \`freight\`, \`importCost\`.
Mọi giá trị của \`giaiThichThamSo\` là vô hướng.

**CỬA SỔ của ba yếu tố chuỗi (chỉ \`RUI_RO_V2\`).** F1, F2b và F4 KHÔNG đọc cả 12 tháng: chúng đọc **120 gói mở giá GẦN
NHẤT** trong 12 tháng tới mốc mở giá của gói này (chưa huỷ tại mốc), rồi mới áp vế *có người thắng tại mốc* và vế *chia nhà cung
cấp*. Trần 120 là thuộc tính CỦA PHIÊN BẢN phương pháp — nó nằm trong bảng phương pháp của \`RUI_RO_V2\`, và mỗi đánh giá đã ghim
phiên bản của mình, nên một bộ cũ đọc lại vẫn theo đúng trần của nó; đổi trần là một phiên bản phương pháp MỚI. Vì trần áp TRƯỚC
hai vế kia, chuỗi có thể NGẮN HƠN 120 dù tổ chức còn gói đủ điều kiện ngoài cửa sổ: số gói thật sự vào chuỗi là \`soGoiChuoi\`, và
số hàng đầu vào \`GOI_CHUOI\` bằng chính nó. Lý do có trần là hiệu năng, và nó đo được: chi phí một đánh giá tăng tuyến tính theo
số gói chuỗi, nên không có trần thì một tổ chức nhiều gói làm giao dịch đề xuất vượt trần thời gian của một câu lệnh.

#### F1 — khoảng cách thắng–nhì ổn định bất thường (chỉ \`RUI_RO_V2\`)

Khoá: \`soGoiChuoi\`, \`soGoiCoG\`, \`soNccChung\`, \`trungViGPhanVan\`, \`madGPhanVan\`, \`nenSoGoiCoG\`, \`nenP10PhanVan\`,
\`nenP25PhanVan\`, \`lyDo\`. \`soGoiChuoi\` là số gói của CHUỖI (gói khác của tổ chức TRONG CỬA SỔ ở trên — 120 gói mở
giá gần nhất trong 12 tháng tới mốc mở giá của gói này, chưa huỷ tại mốc — có người thắng tại mốc, và chia với gói này ≥ 2 nhà
cung cấp còn lời mời sống tại mốc); \`soGoiCoG\` là số gói
trong chuỗi tính được \`g\` = (giá hạng 2 − giá hạng 1) / giá hạng 1 trên thành phần \`gia\` của lượt chấm gói ấy (đồng hạng 1 ⇒ 0;
dưới hai giá đọc được ⇒ không tính được). \`g\` theo PHẦN VẠN, làm tròn xuống.

- \`soGoiChuoi = 0\` ⇒ \`KHONG_AP_DUNG\`, \`lyDo = KHONG_CO_CHUOI\`;
- \`soGoiCoG < 6\` ⇒ \`CHUA_DU_LICH_SU\`, \`lyDo = CHUOI_NGAN\`;
- còn lại \`CO_DU_LIEU\`: \`trungViGPhanVan\` là trung vị của dãy \`g\` (dãy chẵn: trung bình hai phần tử giữa, làm tròn nửa-ra-xa-0
  tới số nguyên phần vạn), \`madGPhanVan\` là trung vị của dãy \`|g − trungViGPhanVan|\` (cùng phép làm tròn). **Mức suy từ ĐÚNG hai
  con số ấy:** \`DO\` khi \`trungViGPhanVan < 100\` VÀ \`madGPhanVan < 50\`; \`VANG\` khi \`< 200\` VÀ \`< 100\`; còn lại \`XANH\`. Ba
  khoá \`nen*\` là BỐI CẢNH của tổ chức, KHÔNG quyết định mức.
- Độ tin cậy theo \`soGoiCoG\`: \`< 12\` ⇒ \`THAP\`, \`< 24\` ⇒ \`VUA\`, còn lại \`CAO\`.

Bộ KHÔNG mang \`g\` của từng gói khác, cũng không mang giá nào: hai con số thống kê cộng ảnh chụp nền là tất cả những gì cần để ra
mức. Tính lại CHÍNH hai con số ấy từ dữ liệu gốc chỉ làm được trên cơ sở dữ liệu.

#### F2b — mẫu luân phiên thắng (chỉ \`RUI_RO_V2\`)

Khoá: \`soGoiChuoi\`, \`soNccChuoi\`, \`lechToiDa\`, \`coThangLienNhau\`, \`lyDo\`. Chuỗi như F1 nhưng đòi ≥ 3 nhà cung cấp chung.
\`soNccChuoi\` là số nhà cung cấp KHÁC NHAU thắng trong chuỗi; \`lechToiDa\` = số lần thắng nhiều nhất − ít nhất; \`coThangLienNhau\`
là có nhà cung cấp nào thắng hai gói liền nhau (chuỗi xếp theo mốc mở giá) hay không.

- \`soGoiChuoi < 9\` ⇒ \`CHUA_DU_LICH_SU\`, \`lyDo = CHUOI_NGAN\`;
- *đều* ⇔ \`soNccChuoi ≥ 2\` VÀ \`lechToiDa ≤ 1\` VÀ \`coThangLienNhau = false\`. Đều và \`soGoiChuoi ≥ 12\` ⇒ \`DO\`; đều ⇒ \`VANG\`;
  không đều ⇒ \`XANH\`.
- Độ tin cậy theo \`soGoiChuoi\`: \`< 18\` ⇒ \`THAP\`, \`< 36\` ⇒ \`VUA\`, còn lại \`CAO\`.

#### F4 — tập trung nhà cung cấp (chỉ \`RUI_RO_V2\`)

Khoá: \`soGoiNhom\`, \`soGoiNThang\`, \`tyPhanPhanVan\`, \`lyDo\`. \`soGoiNhom\` là số gói CÙNG NHÓM HÀNG của gói này có người thắng
tại MỐC NGÀY của ảnh chụp nền (đầu ngày Việt Nam của mốc mở giá), trong CỬA SỔ ấy (120 gói mở giá gần nhất của nhóm hàng trong
12 tháng tới mốc ngày), chưa huỷ tại mốc ấy — chính
\`soGoiCoNguoiThang\` của đầu vào \`NEN\`. \`soGoiNThang\` là số gói trong đó mà nhà cung cấp được đề xuất thắng — bằng số đầu vào
\`GOI_CHUOI\` của hàng này.

- gói không có nhóm hàng ⇒ \`KHONG_AP_DUNG\`, \`lyDo = GOI_KHONG_NHOM_HANG\`;
- \`soGoiNhom < 8\` ⇒ \`CHUA_DU_LICH_SU\`, \`lyDo = NHOM_IT_GOI\`;
- còn lại \`CO_DU_LIEU\`: \`tyPhanPhanVan = ⌊soGoiNThang · 10000 / soGoiNhom⌋\`; \`DO\` khi \`soGoiNThang · 100 ≥ 60 · soGoiNhom\`,
  \`VANG\` khi \`≥ 40 ·\`, còn lại \`XANH\`. Độ tin cậy theo \`soGoiNhom\`: \`< 16\` ⇒ \`THAP\`, \`< 32\` ⇒ \`VUA\`, còn lại \`CAO\`.

#### F11 ở \`RUI_RO_V2\`

Ở V2 hàng F11 mang thêm khoá \`deXuatTruocCoNo\` (\`true\`, \`false\` hay \`null\` — \`null\` là *không có đánh giá cùng phiên bản trên
đề xuất đã huỷ nào*). Mức: \`DO\` khi \`soDeXuatTruocDaHuyHayRut ≥ 2\` HAY \`deXuatTruocCoNo = true\`; \`VANG\` khi bằng 1; còn lại
\`XANH\`. Ở V1 hàng F11 không mang khoá ấy và mức chỉ theo số lần huỷ.

### 12.5 Tổng hợp

Gọi \`P(m)\` là trọng số MẶC ĐỊNH của mã \`m\`, \`W\` là \`trongSo\` của hàng. Trên các hàng khác \`DO_PHU\`:
- \`mau\` = tổng \`P(m)\` trên các mã có lịch sử; \`tu\` = tổng \`P(m)\` trên các mã có lịch sử có \`trangThai = CO_DU_LIEU\`;
  \`doPhu = ⌊tu · 10000 / mau⌋\`;
- \`w\` = tổng \`W\`, \`s\` = tổng \`W\` nhân điểm của \`muc\`, trên các hàng \`CO_DU_LIEU\`; \`diem = null\` khi \`w = 0\`, không thì
  \`⌊(2s + w) / (2w)⌋\` — \`s / w\` làm tròn nửa-ra-xa-0 (§4);
- \`muc\`: \`KHONG_XAC_DINH\` khi \`tu · 100 < 60 · mau\`; không thì \`CAO\` khi \`diem ≥ 60\`; không thì \`VUA\` khi \`diem ≥ 30\` hay có hàng
  \`muc = DO\`; còn lại \`THAP\` (\`diem = null\` đọc như 0);
- \`coNo\` đúng khi có hàng \`muc = DO\` hay \`muc\` của đánh giá là \`KHONG_XAC_DINH\`.
Ở \`RUI_RO_V1\` chỉ F3 là mã có lịch sử có phép tính, nên \`doPhu ≤ 2727\` và mọi đánh giá là \`KHONG_XAC_DINH\`, \`coNo = true\`.

Bộ kiểm tính tổng hợp HAI lần: trên \`muc\` ĐÃ LƯU của các hàng (phép tính của cơ sở dữ liệu) và trên \`muc\` tính lại ở 12.4. Cả hai phải
bằng \`diem\`, \`doPhu\`, \`muc\`, \`coNo\` của đánh giá.

### 12.6 Đầu vào đã ghim

Mỗi hàng mang \`dauVao\`: các hàng dữ liệu hệ thống đọc khi tính nó, ghim lúc đề xuất. Một đầu vào có \`loai\`:
- \`DONG_CHAM\` (\`evaluationId\`, \`bidVersionId\`) — một hàng của \`luotCham[].hang\`;
- \`NHAN_BENCHMARK\` (\`evaluationId\`, \`bidVersionId\`, \`lineNo\`) — một hàng của \`duLieuNen.luotCham[].dong\`;
- \`TRAO_THAU\`, \`LOI_MOI\`, \`TIN_HIEU\`, \`NGOAI_LE\` (\`id\`) — một phần tử của \`quanTri.traoThau\` (\`awardId\`), \`quanTri.loiMoi\`,
  \`quanTri.tinHieu\`, \`quanTri.ngoaiLe\`;
- \`PHIEN_BAN_BAO_GIA\` (\`id\`) — một phiên bản báo giá, kể cả bản sửa trung gian (không lớp nào khác mang);
- \`GOI_CHUOI\` (\`bamGoi\`) — một gói KHÁC của chuỗi, chỉ ở \`RUI_RO_V2\`. Không id thô: \`bamGoi\` là 32 ký tự hex đầu của
  \`HMAC-SHA256(muối, "goi:" || id gói)\` với CÙNG muối ngẫu nhiên của lần xuất ấy, cùng phép băm mà §8 và §11 dùng — nên ba lớp nối
  được với nhau bằng mã băm mà bộ không nói gói nào;
- \`NEN\` (\`moc\`, \`soGoiTrongCuaSo\`, \`soGoiCoNguoiThang\`, \`soGoiCoG\`, \`p10PhanVan\`, \`p25PhanVan\`, \`trungViPhanVan\`) — ảnh
  chụp nền của tổ chức tại MỐC NGÀY \`moc\` (đầu ngày Việt Nam), chỉ ở \`RUI_RO_V2\`: số đếm và phân vị của \`g\`, không một định danh
  nào, không một số tiền nào. Ba phân vị cùng có hay cùng vắng (\`null\` khi \`soGoiCoG = 0\`).
Gọi đề xuất là \`P\`, lượt chấm và báo giá của nó là \`L\` và \`N\`, \`M = mocDeXuat\`. Đầu vào ĐẠT khi:
- mã \`CHUA_CAI\` của phiên bản ấy và \`DO_PHU\`: không đầu vào;
- F1, F2b, F4 ở \`RUI_RO_V1\`: không đầu vào (chúng là \`CHUA_CAI\`). Ở \`RUI_RO_V2\`: chỉ \`GOI_CHUOI\` và \`NEN\`, tối đa MỘT \`NEN\`;
  F1 và F2b có \`soGoiChuoi\` bằng số hàng \`GOI_CHUOI\`, F4 có \`soGoiNThang\` bằng số hàng ấy; F2b không mang \`NEN\`; F4 cần \`NEN\`
  (trừ ca \`GOI_KHONG_NHOM_HANG\`, khi ấy không có đầu vào nào) và \`soGoiNhom\` bằng \`soGoiCoNguoiThang\` của nó; F1 khớp
  \`nenSoGoiCoG\`, \`nenP10PhanVan\`, \`nenP25PhanVan\` với \`NEN\` khi có;
- F3: chỉ \`DONG_CHAM\` và \`NHAN_BENCHMARK\`; đúng một \`DONG_CHAM\`, là (\`L\`, \`N\`); mọi \`NHAN_BENCHMARK\` thuộc (\`L\`, \`N\`). \`lyDo =
  CHUA_CAU_HINH\` khi và chỉ khi \`duLieuNen\` không mang lượt chấm \`L\`, và khi ấy không có \`NHAN_BENCHMARK\`. Khi \`duLieuNen\` mang \`L\`: tập
  \`lineNo\` bằng tập \`lineNo\` các hàng \`dong\` của \`L\` có \`bidVersionId = N\`; \`soDongDoDuoc\` không vượt số hàng ấy có \`nhan\` là
  \`BINH_THUONG\`, \`LECH_VUA\` hay \`LECH_CAO\`; \`soDongLechCaoTren\` không vượt số hàng ấy có \`nhan = LECH_CAO\` và \`chieu = TREN\`;
- F5: chỉ \`PHIEN_BAN_BAO_GIA\`; \`N\` nằm trong tập; mỗi chuỗi trong \`cap\` là \`id\` một lời mời của lớp quản trị;
- F6: chỉ \`TIN_HIEU\` và \`NGOAI_LE\`. Tập \`id\` tín hiệu ghim bằng tập \`id\` của \`bangChung.tinHieu\`; mỗi tín hiệu ấy có ở lớp quản trị cùng
  \`loai\`, với \`createdAt ≤ M\`, và tín hiệu \`ESTIMATE_UNDERSTATED\` có \`truong.award = awardId\`. Tập \`id\` ngoại lệ ghim bằng tập \`id\` của
  \`bangChung.ngoaiLe\`, và bằng tập các ngoại lệ \`LAP\` của lớp quản trị có \`loai\` là một trong năm loại của F6, \`createdAt ≤ M\`, mà không
  ngoại lệ \`RUT\` nào trỏ tới (\`ngoaiLeId\`) với \`createdAt ≤ M\`; \`loai\` trong bằng chứng bằng \`loai\` ở lớp quản trị;
- F7: đúng một đầu vào, \`DONG_CHAM\` (\`L\`, \`N\`);
- F9: chỉ \`DONG_CHAM\`, tập bằng mọi hàng của \`luotCham[L].hang\`; \`soBaoGiaTheoDong\` không vượt số hàng ấy;
- F10: tập \`DONG_CHAM\` bằng các hàng có \`effectiveCost\` khác \`null\` của \`luotCham[L].hang\`, và \`soBaoGiaDocDuoc\` bằng số ấy; mỗi
  \`LOI_MOI\` là một lời mời của lớp quản trị, và \`soLoiMoiConSong\` bằng số \`LOI_MOI\`; không loại nào khác;
- F11: chỉ \`TRAO_THAU\`, tập bằng mọi phần tử \`quanTri.traoThau\` khác \`P\` có \`actedAt ≤ M\`; \`soDeXuatTruocDaHuyHayRut\` bằng số phần tử
  trong tập có \`status\` là \`CANCELLED\` hay \`WITHDRAWN\`.
Phép đối chiếu này bắt một bằng chứng SAI đi cùng mức sai ở F6, F10, F11 và một phần ở F3, F9 ngay ngoại tuyến; phần còn lại của F3, F5,
F7, F9 tính từ dòng bản rõ và giờ nộp — lớp ⑴b mang phép tính ấy (12.1).

### 12.7 Chốt trên chữ ký — điều kiện cần

Gọi \`C\` là tập chữ ký của \`P\` (\`quanTri.traoThau\`, phần tử \`awardId = P\`, \`chuKy\`). Mọi phần tử của \`giaiTrinh\` có một chữ ký trong \`C\`
cùng người (\`nguoi = approverUserId\`) và cùng mốc (\`luc = approvedAt\` — giải trình ghi trong cùng giao dịch với chữ ký). Khi \`coNo\` (tính
ở 12.5) đúng:
1. mỗi chữ ký trong \`C\` có đúng một giải trình cùng người, cùng mốc;
2. không ghi nhận nào có \`nguoi\` là người ký của một chữ ký trong \`C\`;
3. khi \`C\` khác rỗng, mỗi hàng \`muc = DO\` có một ghi nhận của người KHÔNG thuộc tập \`T\`; riêng F6 còn đạt khi mỗi tín hiệu đỏ của
   \`bangChung.tinHieu\` có một ghi nhận ở lớp quản trị (\`tinHieu[].ghiNhan\`) trên một tín hiệu cùng \`loai\`, cùng \`truong\`, của người không
   thuộc \`T\`. \`T\` gồm \`actedBy\` của \`P\` và của mọi phần tử \`quanTri.traoThau\` có \`actedAt ≤ M\`, \`goi.nguoiTao\`, \`goi.nguoiNop\`,
   \`nganSach.createdBy\`, \`chinhSachNganSach.createdBy\`.
Vế 3 KHÔNG xét mốc của ghi nhận: cơ sở dữ liệu xét mọi ghi nhận đã ghi xong lúc chữ ký được xét, mà mốc của một ghi nhận là giờ bắt đầu
giao dịch của nó — có thể muộn hơn mốc của chữ ký. \`T\` là một phần của tập loại trừ mà cơ sở dữ liệu dùng: phần này là điều kiện CẦN,
không bao giờ chặt hơn cơ sở dữ liệu. Mọi ghi nhận nằm trên một hàng \`muc = DO\`.

### 12.8 Không đạt khi

Ngoài mọi bước trên: một \`awardId\` của \`danhGia\` không là phần tử \`PROPOSED\` của \`traoThau\`, hay hai đánh giá cùng \`awardId\`;
\`evaluationId\`, \`bidVersionId\` khác của phần tử ấy; \`nguoiLap\` khác \`actedBy\` của nó ở lớp quản trị; \`mocDeXuat\` hay \`lapLuc\` khác
\`actedAt\` của nó ở lớp quản trị; một phần tử \`PROPOSED\` của \`quanTri.traoThau\` có \`actedAt\` không nhỏ hơn \`mocDeXuat\` SỚM NHẤT
của \`danhGia\` mà không có đánh giá — từ lúc đánh giá đầu tiên ra đời, tổ chức đã bật lớp kiểm soát (một chiều) và cơ sở dữ liệu đòi
mọi đề xuất mang đánh giá lúc ghi, nên một đề xuất như thế là một đánh giá đã bị bỏ khỏi bộ.

### 12.9 Khai — cơ sở dữ liệu đã cưỡng chế, phần này KHÔNG tính lại

Thống kê của F3, F5, F7, F9 từ dữ liệu gốc (dòng bản rõ, giờ nộp từng phiên bản) — chỉ tính lại được trên cơ sở dữ liệu: lớp ⑴b mang kết
quả ấy, và đường ký tính lại trước mỗi chữ ký ở đề xuất nổ chốt; mọi luật của bộ đọc đầu vào mà 12.6 không nêu, kể cả *bằng chứng hiện
tại* của tín hiệu; trọn tập loại trừ của người ghi nhận, khai báo xung đột và quyền duyệt của người ghi nhận; cửa sổ xác thực hai lớp của
người ký. Không bước nào ở phần này dùng đồng hồ ngoài phép so các mốc trong bộ.

### 12.10 Thông tin, không phán xử

Đề xuất \`PROPOSED\` không có đánh giá mà ghi TRƯỚC \`mocDeXuat\` sớm nhất của \`danhGia\` (hay bộ không có đánh giá nào) — ghi trước
khi tổ chức có lớp này, hay ở tổ chức chưa bật: bộ kiểm đếm và in, không làm trượt.
\`policyId\` khác \`policyId\` của lượt chấm \`L\`: bộ kiểm báo, không làm trượt — lượt chấm ghi trước khi gói có phiên bản ghim giữ phiên bản
lúc chấm.

## 13. Lớp gợi ý máy — lịch sử đề xuất và xác nhận (bundle phiên bản 11)

\`goiYMay\` mang mọi hàng \`goiY\` của gói — máy (tất định hay mô hình) đề xuất gì: \`loai\`, \`nguonMay\`, mô hình và vùng nếu có,
\`phienBan\` của bộ gợi ý, \`dauVaoBam\` (SHA-256 hex của đầu vào chính tắc), \`dauVao\`, \`dauRa\` nguyên văn, \`trangThai\`, token và
chi phí — và mọi hàng \`xacNhan\`: người nào (\`userId\`) xác nhận ô nào (\`o\`) với kết quả nào (\`CHAP_NHAN\`, \`SUA\`, \`BAC\`) và giá
trị cuối. \`thamChieu\` liệt kê từng cột \`goi_y_id\` ở bảng nghiệp vụ trỏ tới một gợi ý (rỗng khi chưa bảng nào mang cột ấy).

**Lớp này là lịch sử, không phải phép tính.** Không con số nào của §3–§12 đọc nó; bộ kiểm **không dùng nó để tính lại bất kỳ con số
nào**, và đổi một dòng ở lớp này không đổi kết quả \`ok\`. Nó có mặt để người đọc thấy máy đã gợi ý gì và người đã quyết gì — cả hai
đều có người ký: hàng gợi ý mang \`tacGia\`, hàng xác nhận mang \`userId\`.

Bộ kiểm chỉ kiểm hai điều về chính lớp ấy, và chúng làm trượt:
1. mỗi \`xacNhan[].goiYId\` là \`id\` của một phần tử \`goiY\` có mặt;
2. mỗi \`thamChieu[].goiYId\` là \`id\` của một phần tử \`goiY\` có mặt **và** có ít nhất một hàng \`xacNhan\` trỏ tới nó — một gợi ý đã đi vào
   dữ liệu nghiệp vụ mà không ai xác nhận là một gợi ý máy quyết thay người.
Ngoài ra \`id\` của \`goiY\` và của \`xacNhan\` không trùng trong lớp. Bundle phiên bản 10 không mang lớp này; bộ kiểm đọc nó như trước.
`;
return Object.freeze({ DAC_TA_PHIEN_BAN, DAC_TA });
})();

// ---- packages/danh-gia/src/chi-phi-hieu-dung.ts
const __tp_m4 = (() => {
const SO_LE_TIEN = 2;
const SO_LE_HE_SO = 4;
function docSo(chuoi, soLe) {
    const s = chuoi.trim();
    if (!/^-?\d+(\.\d+)?$/.test(s))
        return null;
    const am = s.startsWith("-");
    const [nguyen = "", le = ""] = (am ? s.slice(1) : s).split(".");
    if (le.length > soLe)
        return null;
    const v = BigInt(nguyen + (le + "0".repeat(soLe)).slice(0, soLe));
    return am ? -v : v;
}
function vietSo(v, soLe) {
    const chia = 10n ** BigInt(soLe);
    const am = v < 0n;
    const t = am ? -v : v;
    const le = String(t % chia).padStart(soLe, "0");
    return `${am ? "-" : ""}${t / chia}${soLe === 0 ? "" : `.${le}`}`;
}
function lamTron(v, tuSoLe, veSoLe) {
    if (veSoLe > tuSoLe)
        throw new RangeError("lamTron chỉ THU tỉ lệ, không nới");
    const chia = 10n ** BigInt(tuSoLe - veSoLe);
    if (chia === 1n)
        return v;
    const am = v < 0n;
    const t = am ? -v : v;
    const q = (t + chia / 2n) / chia;
    return am ? -q : q;
}
function tinhChiPhiHieuDung(chinhSach, dauVao) {
    const theoMa = new Map();
    for (const d of dauVao) {
        if (theoMa.has(d.ma))
            return { lyDo: "DAU_VAO_TRUNG_MA", ma: d.ma };
        theoMa.set(d.ma, d.giaTri);
    }
    const maChinhSach = new Set(chinhSach.map((c) => c.ma));
    for (const d of dauVao) {
        if (!maChinhSach.has(d.ma))
            return { lyDo: "DAU_VAO_THUA", ma: d.ma };
    }
    if (!chinhSach.some((c) => c.donVi === "TIEN"))
        return { lyDo: "KHONG_CO_THANH_PHAN_TIEN" };
    const components = [];
    let tong = 0n;
    for (const c of chinhSach) {
        const gia = theoMa.get(c.ma);
        if (gia === undefined)
            return { lyDo: "THIEU_DAU_VAO", ma: c.ma };
        const h = docSo(c.heSo, SO_LE_HE_SO);
        if (h === null)
            return { lyDo: "HE_SO_KHONG_DOC_DUOC", ma: c.ma };
        const g = docSo(gia, SO_LE_TIEN);
        if (g === null)
            return { lyDo: "GIA_TRI_KHONG_DOC_DUOC", ma: c.ma };
        if (c.donVi === "DIEM") {
            components.push({ ma: c.ma, donVi: c.donVi, heSo: c.heSo, giaTri: gia, tien: null });
            continue;
        }
        const tien = lamTron(g * h, SO_LE_TIEN + SO_LE_HE_SO, SO_LE_TIEN);
        tong += tien;
        components.push({
            ma: c.ma,
            donVi: c.donVi,
            heSo: c.heSo,
            giaTri: gia,
            tien: vietSo(tien, SO_LE_TIEN),
        });
    }
    return { effectiveCost: vietSo(tong, SO_LE_TIEN), components };
}
function laTuChoi(kq) {
    return "lyDo" in kq;
}
return Object.freeze({ SO_LE_TIEN, SO_LE_HE_SO, docSo, vietSo, lamTron, tinhChiPhiHieuDung, laTuChoi });
})();

// ---- tools/bo-xuat-danh-gia/src/doc-lap/tinh-lai.ts
const __tp_m5 = (() => {
const KHUON_SO = /^-?\d+(?:\.\d+)?$/u;
function chuanHoa(am, chuSo, soLe) {
    let dau = 0;
    while (dau < chuSo.length - soLe - 1 && chuSo[dau] === 0)
        dau += 1;
    const cat = chuSo.slice(dau);
    const laKhong = cat.every((c) => c === 0);
    return { am: laKhong ? false : am, chuSo: cat, soLe };
}
function docThapPhan(chuoi) {
    const s = chuoi.trim();
    if (!KHUON_SO.test(s))
        return null;
    const am = s.startsWith("-");
    const than = am ? s.slice(1) : s;
    const [nguyen = "", le = ""] = than.split(".");
    const chuSo = [...nguyen, ...le].map((c) => c.charCodeAt(0) - 48);
    return chuanHoa(am, chuSo, le.length);
}
function vietThapPhan(x) {
    const can = x.soLe + 1;
    const d = x.chuSo.length >= can ? [...x.chuSo] : [...new Array(can - x.chuSo.length).fill(0), ...x.chuSo];
    const cat = d.length - x.soLe;
    const nguyen = d.slice(0, cat).join("");
    const le = d.slice(cat).join("");
    return `${x.am ? "-" : ""}${nguyen}${x.soLe === 0 ? "" : `.${le}`}`;
}
function soSanhDay(a, b) {
    for (let i = 0; i < a.length; i += 1) {
        const x = a[i] ?? 0;
        const y = b[i] ?? 0;
        if (x !== y)
            return x < y ? -1 : 1;
    }
    return 0;
}
function canTrai(a, b) {
    const n = Math.max(a.length, b.length);
    const dem = (d) => [...new Array(n - d.length).fill(0), ...d];
    return [dem(a), dem(b)];
}
function congDay(a, b) {
    const [x, y] = canTrai(a, b);
    const ra = [];
    let nho = 0;
    for (let i = x.length - 1; i >= 0; i -= 1) {
        const t = (x[i] ?? 0) + (y[i] ?? 0) + nho;
        ra.push(t % 10);
        nho = t >= 10 ? 1 : 0;
    }
    if (nho > 0)
        ra.push(nho);
    return ra.reverse();
}
function truDay(a, b) {
    const [x, y] = canTrai(a, b);
    const ra = [];
    let muon = 0;
    for (let i = x.length - 1; i >= 0; i -= 1) {
        let t = (x[i] ?? 0) - (y[i] ?? 0) - muon;
        if (t < 0) {
            t += 10;
            muon = 1;
        }
        else {
            muon = 0;
        }
        ra.push(t);
    }
    return ra.reverse();
}
function nhan(a, b) {
    const n = a.chuSo.length;
    const m = b.chuSo.length;
    const tich = new Array(n + m).fill(0);
    for (let i = n - 1; i >= 0; i -= 1) {
        for (let j = m - 1; j >= 0; j -= 1) {
            const t = (a.chuSo[i] ?? 0) * (b.chuSo[j] ?? 0) + (tich[i + j + 1] ?? 0);
            tich[i + j + 1] = t % 10;
            tich[i + j] = (tich[i + j] ?? 0) + Math.floor(t / 10);
        }
    }
    return chuanHoa(a.am !== b.am, tich, a.soLe + b.soLe);
}
function cong(a, b) {
    if (a.soLe !== b.soLe)
        throw new RangeError("cong đòi hai số cùng số chữ số thập phân");
    if (a.am === b.am)
        return chuanHoa(a.am, congDay(a.chuSo, b.chuSo), a.soLe);
    const [x, y] = canTrai(a.chuSo, b.chuSo);
    const cmp = soSanhDay(x, y);
    if (cmp === 0)
        return chuanHoa(false, [0], a.soLe);
    return cmp > 0
        ? chuanHoa(a.am, truDay(x, y), a.soLe)
        : chuanHoa(b.am, truDay(y, x), a.soLe);
}
function thuVe(x, veSoLe) {
    if (veSoLe > x.soLe)
        throw new RangeError("thuVe chỉ THU số chữ số thập phân, không nới");
    const bo = x.soLe - veSoLe;
    if (bo === 0)
        return x;
    const giu = x.chuSo.slice(0, Math.max(0, x.chuSo.length - bo));
    const duoi = x.chuSo.slice(Math.max(0, x.chuSo.length - bo));
    const nua = [5, ...new Array(bo - 1).fill(0)];
    const [a, b] = canTrai(duoi, nua);
    const len = soSanhDay(a, b) >= 0 ? congDay(giu.length === 0 ? [0] : giu, [1]) : giu;
    return chuanHoa(x.am, len.length === 0 ? [0] : len, veSoLe);
}
function soSanh(a, b) {
    if (a.soLe !== b.soLe)
        throw new RangeError("soSanh đòi hai số cùng số chữ số thập phân");
    if (a.am !== b.am)
        return a.am ? -1 : 1;
    const [x, y] = canTrai(a.chuSo, b.chuSo);
    const cmp = soSanhDay(x, y);
    return a.am ? -cmp : cmp;
}
const SO_LE_TIEN = 2;
function khongTinhDuoc(kq) {
    return "lyDo" in kq;
}
function tinhLai(chinhSach, dauVao) {
    const theoMa = new Map();
    for (const d of dauVao) {
        if (theoMa.has(d.ma))
            return { lyDo: "DAU_VAO_TRUNG_MA", ma: d.ma };
        theoMa.set(d.ma, d.giaTri);
    }
    const maChinhSach = new Set(chinhSach.map((c) => c.ma));
    for (const d of dauVao) {
        if (!maChinhSach.has(d.ma))
            return { lyDo: "DAU_VAO_THUA", ma: d.ma };
    }
    if (!chinhSach.some((c) => c.don_vi === "TIEN"))
        return { lyDo: "KHONG_CO_THANH_PHAN_TIEN" };
    const components = [];
    let tong = chuanHoa(false, [0], SO_LE_TIEN);
    for (const c of chinhSach) {
        if (!theoMa.has(c.ma))
            return { lyDo: "THIEU_DAU_VAO", ma: c.ma };
        if (c.don_vi !== "TIEN" && c.don_vi !== "DIEM")
            return { lyDo: "DON_VI_LA", ma: c.ma };
        if (c.don_vi === "DIEM") {
            components.push({ ma: c.ma, donVi: c.don_vi, tien: null });
            continue;
        }
        const gia = theoMa.get(c.ma) ?? null;
        if (gia === null)
            return { lyDo: "GIA_TRI_VANG", ma: c.ma };
        const h = docThapPhan(c.he_so);
        if (h === null)
            return { lyDo: "HE_SO_KHONG_DOC_DUOC", ma: c.ma };
        const g = docThapPhan(gia);
        if (g === null)
            return { lyDo: "GIA_TRI_KHONG_DOC_DUOC", ma: c.ma };
        const tien = thuVe(nhan(g, h), SO_LE_TIEN);
        tong = cong(tong, tien);
        components.push({ ma: c.ma, donVi: c.don_vi, tien: vietThapPhan(tien) });
    }
    return { effectiveCost: vietThapPhan(tong), components };
}
function xepHangLai(gia) {
    const doc = gia
        .map((g, i) => ({ i, v: g === null ? null : docThapPhan(g) }))
        .filter((x) => x.v !== null)
        .sort((a, b) => soSanh(a.v, b.v));
    const hang = new Array(gia.length).fill(null);
    let truoc = null;
    let hangTruoc = 0;
    doc.forEach((x, viTri) => {
        const h = truoc !== null && soSanh(x.v, truoc) === 0 ? hangTruoc : viTri + 1;
        hang[x.i] = h;
        truoc = x.v;
        hangTruoc = h;
    });
    return hang;
}
return Object.freeze({ docThapPhan, vietThapPhan, nhan, cong, thuVe, soSanh, SO_LE_TIEN, khongTinhDuoc, tinhLai, xepHangLai });
})();

// ---- packages/du-lieu-nen/src/so-thap-phan.ts
const __tp_m6 = (() => {
const DANG = /^(-?)([0-9]+)(?:\.([0-9]+))?$/u;
function docThapPhan(chuoi) {
    const k = DANG.exec(chuoi);
    if (k === null)
        throw new RangeError(`không phải số thập phân: ${JSON.stringify(chuoi)}`);
    const le = k[3] ?? "";
    const m = BigInt(`${k[2]}${le}`);
    return { m: k[1] === "-" ? -m : m, s: le.length };
}
const MUOI = 10n;
function nangThang(x, s) {
    return x.m * MUOI ** BigInt(s - x.s);
}
function canBang(a, b) {
    const s = Math.max(a.s, b.s);
    return [nangThang(a, s), nangThang(b, s), s];
}
function cong(a, b) {
    const [x, y, s] = canBang(a, b);
    return { m: x + y, s };
}
function tru(a, b) {
    const [x, y, s] = canBang(a, b);
    return { m: x - y, s };
}
function nhan(a, b) {
    return { m: a.m * b.m, s: a.s + b.s };
}
function triTuyetDoi(a) {
    return a.m < 0n ? { m: -a.m, s: a.s } : a;
}
function soSanh(a, b) {
    const [x, y] = canBang(a, b);
    return x < y ? -1 : x > y ? 1 : 0;
}
function chiaLuyThua2(a, k) {
    if (!Number.isInteger(k) || k < 0)
        throw new RangeError("số mũ của 2 phải là số nguyên không âm");
    return { m: a.m * 5n ** BigInt(k), s: a.s + k };
}
function nhanNguyen(a, n) {
    if (!Number.isSafeInteger(n))
        throw new RangeError("hệ số phải là số nguyên an toàn");
    return { m: a.m * BigInt(n), s: a.s };
}
function chuoiThapPhan(a) {
    let m = a.m;
    let s = a.s;
    while (s > 0 && m % MUOI === 0n) {
        m /= MUOI;
        s -= 1;
    }
    const am = m < 0n;
    const tuyet = (am ? -m : m).toString().padStart(s + 1, "0");
    const nguyen = tuyet.slice(0, tuyet.length - s);
    const le = tuyet.slice(tuyet.length - s);
    return `${am ? "-" : ""}${nguyen}${le === "" ? "" : `.${le}`}`;
}
function phanViTu(daySapXep, tu) {
    const n = daySapXep.length;
    if (n === 0)
        throw new RangeError("phân vị của dãy rỗng");
    const viTri = tu * (n - 1);
    const duoi = Math.floor(viTri / 4);
    const du = viTri % 4;
    const a = daySapXep[duoi];
    if (du === 0)
        return a;
    const b = daySapXep[duoi + 1];
    return cong(a, chiaLuyThua2(nhanNguyen(tru(b, a), du), 2));
}
function sapTang(day) {
    return [...day].sort((x, y) => soSanh(x, y));
}
return Object.freeze({ docThapPhan, cong, tru, nhan, triTuyetDoi, soSanh, chiaLuyThua2, nhanNguyen, chuoiThapPhan, phanViTu, sapTang });
})();

// ---- packages/du-lieu-nen/src/benchmark.ts
const __tp_m7 = (() => {
const { chuoiThapPhan, docThapPhan, nhan, phanViTu, sapTang, soSanh, triTuyetDoi, tru } = __tp_m6;
const PHUONG_PHAP_BENCHMARK = "TRUNG_VI_THEO_GOI_V1";
const LECH_VN_MICRO = 7n * 3600000000n;
const NHAN_BENCHMARK = ["BINH_THUONG", "LECH_VUA", "LECH_CAO", "CHUA_DU_LICH_SU", "KHONG_DO_DUOC"];
const NHOM_BENCHMARK_MAU = {
    cua_so_thang: "12",
    san_goi: "3",
    san_ncc: "3",
    nguong_lech_vua: "0.05",
    nguong_lech_cao: "0.10",
    phuong_phap: PHUONG_PHAP_BENCHMARK,
};
const KHOA_NHOM = ["cua_so_thang", "san_goi", "san_ncc", "nguong_lech_vua", "nguong_lech_cao", "phuong_phap"];
const NGUYEN = /^[1-9][0-9]?$/u;
const NGUONG = /^(0|[1-9][0-9]?)(\.[0-9]{1,4})?$/u;
function docNhomBenchmark(tho) {
    if (tho === null || tho === undefined)
        return null;
    if (typeof tho !== "object" || Array.isArray(tho))
        throw new Error("nhóm benchmark không phải đối tượng");
    const o = tho;
    const khoa = Object.keys(o).sort();
    if (khoa.join(",") !== [...KHOA_NHOM].sort().join(","))
        throw new Error("nhóm benchmark sai tập khoá");
    for (const k of KHOA_NHOM)
        if (typeof o[k] !== "string")
            throw new Error(`khoá benchmark ${k} không phải chuỗi`);
    const c = o;
    if (c.phuong_phap !== PHUONG_PHAP_BENCHMARK)
        throw new Error("phương pháp benchmark lạ");
    for (const k of ["cua_so_thang", "san_goi", "san_ncc"]) {
        if (!NGUYEN.test(c[k]))
            throw new Error(`khoá benchmark ${k} không phải số nguyên dương`);
    }
    for (const k of ["nguong_lech_vua", "nguong_lech_cao"]) {
        if (!NGUONG.test(c[k]))
            throw new Error(`khoá benchmark ${k} sai dạng`);
    }
    const vua = docThapPhan(c.nguong_lech_vua);
    const cao = docThapPhan(c.nguong_lech_cao);
    const cuaSo = Number(c.cua_so_thang);
    const sanGoi = Number(c.san_goi);
    const sanNcc = Number(c.san_ncc);
    if (cuaSo > 60 ||
        sanGoi > 50 ||
        sanNcc > 50 ||
        vua.m <= 0n ||
        soSanh(vua, cao) >= 0 ||
        soSanh(cao, { m: 10n, s: 0 }) > 0) {
        throw new Error("nhóm benchmark ngoài biên");
    }
    return {
        cuaSoThang: cuaSo,
        sanGoi,
        sanNcc,
        nguongLechVua: c.nguong_lech_vua,
        nguongLechCao: c.nguong_lech_cao,
        phuongPhap: PHUONG_PHAP_BENCHMARK,
    };
}
function truThang(mocMicro, thang) {
    if (!Number.isInteger(thang) || thang < 0)
        throw new RangeError("số tháng phải là số nguyên không âm");
    const vn = mocMicro + LECH_VN_MICRO;
    const ms = vn >= 0n ? vn / 1000n : -((-vn + 999n) / 1000n);
    const du = vn - ms * 1000n;
    const d = new Date(Number(ms));
    const tong = d.getUTCFullYear() * 12 + d.getUTCMonth() - thang;
    const nam = Math.floor(tong / 12);
    const thangDich = tong - nam * 12;
    const ngayCuoi = new Date(Date.UTC(nam, thangDich + 1, 0)).getUTCDate();
    const moi = Date.UTC(nam, thangDich, Math.min(d.getUTCDate(), ngayCuoi), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
    return BigInt(moi) * 1000n + du - LECH_VN_MICRO;
}
function tinhDai(quanSat, vao) {
    const cuaSoTu = truThang(vao.mocMoGia, vao.nhom.cuaSoThang);
    const dung = [];
    let soLoaiTienTe = 0;
    let soLoaiGia0 = 0;
    for (const q of quanSat) {
        if (q.trangThai !== "HOP_LE" || q.rfqId === vao.rfqId)
            continue;
        if (q.ngayQuanSat >= vao.mocMoGia || q.ngayQuanSat < cuaSoTu)
            continue;
        if (q.tienTe !== vao.tienTe) {
            soLoaiTienTe += 1;
            continue;
        }
        if (q.donGiaQuyDoi === null)
            throw new Error("quan sát HOP_LE không có đơn giá quy đổi");
        const p = docThapPhan(q.donGiaQuyDoi);
        if (p.m < 0n)
            throw new Error("đơn giá quy đổi âm");
        if (p.m === 0n) {
            soLoaiGia0 += 1;
            continue;
        }
        dung.push(q);
    }
    const theoGoi = new Map();
    const cungNguoiTao = new Set();
    for (const q of dung) {
        const ds = theoGoi.get(q.rfqId) ?? [];
        ds.push(docThapPhan(q.donGiaQuyDoi));
        theoGoi.set(q.rfqId, ds);
        if (q.goiCungNguoiTao)
            cungNguoiTao.add(q.rfqId);
    }
    const soGoi = theoGoi.size;
    const soNcc = new Set(dung.map((q) => (vao.demNcc === "THEO_NHOM" ? q.nhomNcc : q.supplierId))).size;
    const duSan = soGoi >= vao.nhom.sanGoi && soNcc >= vao.nhom.sanNcc;
    const mocSo = duSan ? mocSoTheoGoi([...theoGoi.values()]) : null;
    return {
        tienTe: vao.tienTe,
        cuaSoTu,
        soQuanSat: dung.length,
        soGoi,
        soNcc,
        soGoiCungNguoiTao: cungNguoiTao.size,
        soQuanSatHoiTo: dung.filter((q) => q.hoiTo.length > 0).length,
        soLoaiTienTe,
        soLoaiGia0,
        duSan,
        mocSo,
        dauVao: dung,
    };
}
function mocSoTheoGoi(cacGoi) {
    const trungViGoi = sapTang(cacGoi.map((ds) => phanViTu(sapTang(ds), 2)));
    return {
        q1: chuoiThapPhan(phanViTu(trungViGoi, 1)),
        trungVi: chuoiThapPhan(phanViTu(trungViGoi, 2)),
        q3: chuoiThapPhan(phanViTu(trungViGoi, 3)),
    };
}
function ganNhan(gia, dai, nhom) {
    if (!dai.duSan || dai.mocSo === null)
        return { nhan: "CHUA_DU_LICH_SU", chieu: null };
    const p = docThapPhan(gia);
    const m = docThapPhan(dai.mocSo.trungVi);
    const lech = triTuyetDoi(tru(p, m));
    if (soSanh(lech, nhan(docThapPhan(nhom.nguongLechVua), m)) <= 0)
        return { nhan: "BINH_THUONG", chieu: null };
    const chieu = soSanh(p, m) > 0 ? "TREN" : "DUOI";
    if (soSanh(lech, nhan(docThapPhan(nhom.nguongLechCao), m)) <= 0)
        return { nhan: "LECH_VUA", chieu };
    return { nhan: "LECH_CAO", chieu };
}
function nhanMotDong(quanSat, vao) {
    const dai = tinhDai(quanSat, vao);
    return { dai, ...ganNhan(vao.gia, dai, vao.nhom) };
}
return Object.freeze({ PHUONG_PHAP_BENCHMARK, LECH_VN_MICRO, NHAN_BENCHMARK, NHOM_BENCHMARK_MAU, docNhomBenchmark, truThang, tinhDai, mocSoTheoGoi, ganNhan, nhanMotDong });
})();

// ---- tools/bo-xuat-danh-gia/src/doc-lap/benchmark-lai.ts
const __tp_m8 = (() => {
const { cong, docThapPhan, nhan, soSanh } = __tp_m5;
const KHUON_MOC = /^(\d{4})-(\d{2})-(\d{2})(T\d{2}:\d{2}:\d{2}\.\d{6}Z)$/u;
function laNamNhuan(nam) {
    return nam % 4 === 0 && (nam % 100 !== 0 || nam % 400 === 0);
}
const NGAY_TRONG_THANG = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function ngayCuoi(nam, thang) {
    return thang === 2 && laNamNhuan(nam) ? 29 : (NGAY_TRONG_THANG[thang - 1] ?? 31);
}
const KHUON_MOC_GIO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})(:\d{2}:\d{2}\.\d{6}Z)$/u;
function dichGio(moc, soGio) {
    const k = KHUON_MOC_GIO.exec(moc);
    if (k === null)
        throw new RangeError(`mốc sai dạng §8.2: ${moc}`);
    let nam = Number(k[1]);
    let thang = Number(k[2]);
    let ngay = Number(k[3]);
    let gio = Number(k[4]) + soGio;
    while (gio >= 24) {
        gio -= 24;
        ngay += 1;
        if (ngay > ngayCuoi(nam, thang)) {
            ngay = 1;
            thang += 1;
            if (thang > 12) {
                thang = 1;
                nam += 1;
            }
        }
    }
    while (gio < 0) {
        gio += 24;
        ngay -= 1;
        if (ngay < 1) {
            thang -= 1;
            if (thang < 1) {
                thang = 12;
                nam -= 1;
            }
            ngay = ngayCuoi(nam, thang);
        }
    }
    const hai = (n) => String(n).padStart(2, "0");
    return `${String(nam).padStart(4, "0")}-${hai(thang)}-${hai(ngay)}T${hai(gio)}${k[5] ?? ""}`;
}
function luiThang(moc, soThang) {
    return dichGio(luiThangTrenTruong(dichGio(moc, 7), soThang), -7);
}
function luiThangTrenTruong(moc, soThang) {
    const k = KHUON_MOC.exec(moc);
    if (k === null)
        throw new RangeError(`mốc sai dạng §8.2: ${moc}`);
    const nam = Number(k[1]);
    const thang = Number(k[2]);
    const ngay = Number(k[3]);
    const tong = nam * 12 + (thang - 1) - soThang;
    const namDich = Math.floor(tong / 12);
    const thangDich = tong - namDich * 12 + 1;
    const ngayDich = Math.min(ngay, ngayCuoi(namDich, thangDich));
    const hai = (n) => String(n).padStart(2, "0");
    return `${String(namDich).padStart(4, "0")}-${hai(thangDich)}-${hai(ngayDich)}${k[4] ?? ""}`;
}
function thapPhan(chuoi) {
    const x = docThapPhan(chuoi);
    if (x === null)
        throw new RangeError(`không phải số thập phân: ${chuoi}`);
    return x;
}
function noi(x, soLe) {
    if (soLe < x.soLe)
        throw new RangeError("noi chỉ nới");
    return { am: x.am, chuSo: [...x.chuSo, ...new Array(soLe - x.soLe).fill(0)], soLe };
}
function canLe(a, b) {
    const n = Math.max(a.soLe, b.soLe);
    return [noi(a, n), noi(b, n)];
}
function soSanhTuDo(a, b) {
    const [x, y] = canLe(a, b);
    return soSanh(x, y);
}
function tru(a, b) {
    const [x, y] = canLe(a, b);
    return cong(x, { ...y, am: !y.am });
}
function laKhong(x) {
    return x.chuSo.every((c) => c === 0);
}
const PHAN_LE_VI_TRI = ["0", "0.25", "0.5", "0.75"];
function phanVi(daySapTang, k) {
    const n = daySapTang.length;
    if (n === 0)
        throw new RangeError("phân vị của dãy rỗng");
    const tuSo = (n - 1) * k;
    const duoi = Math.floor(tuSo / 4);
    const du = tuSo - duoi * 4;
    const a = daySapTang[duoi];
    if (du === 0)
        return a;
    const b = daySapTang[duoi + 1];
    const [x, y] = canLe(a, nhan(thapPhan(PHAN_LE_VI_TRI[du]), tru(b, a)));
    return cong(x, y);
}
function sapTang(day) {
    return [...day].sort(soSanhTuDo);
}
const KHONG_SO = {
    tienTe: null,
    cuaSoTu: null,
    soQuanSat: null,
    soGoi: null,
    soNcc: null,
    soGoiCungNguoiTao: null,
    soQuanSatHoiTo: null,
    soLoaiTienTe: null,
    soLoaiGia0: null,
    dauVao: null,
};
function tinhLaiDong(giaDong, quanSat, vao) {
    if (giaDong === null)
        return { nhan: "KHONG_DO_DUOC", chieu: null, lyDo: "CHUA_ANH_XA", ...KHONG_SO };
    if (giaDong.trangThai !== "HOP_LE" || giaDong.gia === null || giaDong.tienTe === null) {
        return { nhan: "KHONG_DO_DUOC", chieu: null, lyDo: giaDong.trangThai, ...KHONG_SO };
    }
    const tienTe = giaDong.tienTe;
    const cuaSoTu = luiThang(vao.mocMoGia, Number(vao.nhom.cua_so_thang));
    const dai = [];
    let soLoaiTienTe = 0;
    let soLoaiGia0 = 0;
    const ngayBien = new Set([vao.mocMoGia.slice(0, 10), cuaSoTu.slice(0, 10)]);
    for (const q of quanSat) {
        if (q.ngay.length === 10 && ngayBien.has(q.ngay)) {
            throw new RangeError(`quan sát ${q.ma} mang ngày trơn ${q.ngay} trên một ngày biên — §8.2 đòi đủ micro giây ở ngày ấy`);
        }
        if (q.goi === vao.goiX)
            continue;
        if (q.ngay >= vao.mocMoGia || q.ngay < cuaSoTu)
            continue;
        if (q.tienTe !== tienTe) {
            soLoaiTienTe += 1;
            continue;
        }
        if (laKhong(thapPhan(q.gia))) {
            soLoaiGia0 += 1;
            continue;
        }
        dai.push(q);
    }
    const goi = new Map();
    for (const q of dai) {
        const ds = goi.get(q.goi);
        if (ds === undefined)
            goi.set(q.goi, [thapPhan(q.gia)]);
        else
            ds.push(thapPhan(q.gia));
    }
    const soGoi = goi.size;
    const soNcc = new Set(dai.map((q) => q.nhomNcc)).size;
    const dem = {
        tienTe,
        cuaSoTu,
        soQuanSat: dai.length,
        soGoi,
        soNcc,
        soGoiCungNguoiTao: new Set(dai.filter((q) => q.cungNguoiTao).map((q) => q.goi)).size,
        soQuanSatHoiTo: dai.filter((q) => q.hoiTo.length > 0).length,
        soLoaiTienTe,
        soLoaiGia0,
        dauVao: dai.map((q) => q.ma),
    };
    if (soGoi < Number(vao.nhom.san_goi) || soNcc < Number(vao.nhom.san_ncc)) {
        return { nhan: "CHUA_DU_LICH_SU", chieu: null, lyDo: null, ...dem };
    }
    const trungViGoi = sapTang([...goi.values()].map((ds) => phanVi(sapTang(ds), 2)));
    const m = phanVi(trungViGoi, 2);
    const p = thapPhan(giaDong.gia);
    const hieu = tru(p, m);
    const d = { ...hieu, am: false };
    if (soSanhTuDo(d, nhan(thapPhan(vao.nhom.nguong_lech_vua), m)) <= 0) {
        return { nhan: "BINH_THUONG", chieu: null, lyDo: null, ...dem };
    }
    const chieu = soSanhTuDo(p, m) > 0 ? "TREN" : "DUOI";
    if (soSanhTuDo(d, nhan(thapPhan(vao.nhom.nguong_lech_cao), m)) <= 0)
        return { nhan: "LECH_VUA", chieu, lyDo: null, ...dem };
    return { nhan: "LECH_CAO", chieu, lyDo: null, ...dem };
}
return Object.freeze({ luiThang, tinhLaiDong });
})();

// ---- tools/bo-xuat-danh-gia/src/kiem-du-lieu-nen.ts
const __tp_m9 = (() => {
const { docNhomBenchmark, nhanMotDong } = __tp_m7;
const { tinhLaiDong } = __tp_m8;
function micro(iso) {
    const day = iso.length === 10 ? `${iso}T12:00:00.000000Z` : iso;
    return BigInt(Date.parse(`${day.slice(0, 23)}Z`)) * 1000n + BigInt(day.slice(23, 26));
}
function isoMicro(m) {
    return `${new Date(Number(m / 1000n)).toISOString().slice(0, 23)}${String(m % 1000n).padStart(3, "0")}Z`;
}
const HAM_THUAN_BENCHMARK_THAT = (quanSat, vao) => {
    const nhom = docNhomBenchmark(vao.nhom);
    if (nhom === null)
        throw new Error("nhóm benchmark rỗng");
    const qs = quanSat.map((q) => ({
        rfqId: q.goi,
        supplierId: q.ncc,
        bidVersionId: q.ma,
        lineNo: 1,
        anhXaId: null,
        ngayQuanSat: micro(q.ngay),
        trangThai: "HOP_LE",
        donGiaQuyDoi: q.gia,
        tienTe: q.tienTe,
        hoiTo: q.hoiTo,
        goiCungNguoiTao: q.cungNguoiTao,
        nhomNcc: q.nhomNcc,
    }));
    const kq = nhanMotDong(qs, { rfqId: vao.goiX, tienTe: vao.tienTe, mocMoGia: micro(vao.mocMoGia), nhom, gia: vao.gia, demNcc: "THEO_NHOM" });
    const d = kq.dai;
    return {
        nhan: kq.nhan,
        chieu: kq.chieu,
        dauVao: d.dauVao.map((q) => q.bidVersionId),
        cuaSoTu: isoMicro(d.cuaSoTu),
        soDem: [d.soQuanSat, d.soGoi, d.soNcc, d.soGoiCungNguoiTao, d.soQuanSatHoiTo, d.soLoaiTienTe, d.soLoaiGia0],
    };
};
function soThoiDiem(a, b) {
    if (a.length > 10 && b.length > 10)
        return a < b ? "TRUOC" : "TU_DO_TRO_DI";
    const ngayA = a.slice(0, 10);
    const ngayB = b.slice(0, 10);
    if (ngayA < ngayB)
        return "TRUOC";
    if (ngayA > ngayB)
        return "TU_DO_TRO_DI";
    return "KHONG_PHAN_DUOC";
}
function kiemAnhXaHoiTo(dln) {
    const loi = [];
    let soHang = 0;
    let soKhongPhanDuoc = 0;
    const maTrongBo = new Set();
    for (const b of dln.bangQuanSat) {
        const ten = `bảng (${b.mocMoGia}, ${b.hangChuan})`;
        const ngayBien = new Set([b.mocMoGia, b.tuNgay].map((t) => t.slice(0, 10)));
        for (const l of dln.luotCham) {
            if (l.mocMoGia !== b.mocMoGia)
                continue;
            for (const d of l.dong)
                if (d.cuaSoTu !== null)
                    ngayBien.add(d.cuaSoTu.slice(0, 10));
        }
        const theoMa = new Map();
        for (const a of b.anhXaHoiTo) {
            soHang += 1;
            if (maTrongBo.has(a.ma))
                loi.push(`${ten}: hai hàng ánh xạ hồi tố cùng mã ${a.ma} (§8.9 ⑵)`);
            maTrongBo.add(a.ma);
            theoMa.set(a.ma, a);
            if (a.ghiLuc.length === 10 && ngayBien.has(a.ghiLuc)) {
                loi.push(`${ten}: hàng ánh xạ hồi tố ${a.ma} mang ngày trơn ${a.ghiLuc} trên một ngày biên — cần đủ micro giây (§8.2, §8.9)`);
            }
            if (a.hangChuan !== b.hangChuan) {
                loi.push(`${ten}: hàng ánh xạ hồi tố ${a.ma} trỏ hàng chuẩn ${a.hangChuan ?? "null"}, khác hàng chuẩn của bảng (§8.9 ⑶)`);
            }
            if (soThoiDiem(a.ghiLuc, b.mocMoGia) !== "TRUOC") {
                loi.push(`${ten}: hàng ánh xạ hồi tố ${a.ma} ghi lúc ${a.ghiLuc}, không đứng trước mốc mở giá (§8.9 ⑷)`);
            }
        }
        const duocTro = new Set();
        for (const q of b.quanSat) {
            const coCo = q.hoiTo.includes("ANH_XA");
            if (coCo !== (q.anhXa !== null)) {
                loi.push(`${ten}: quan sát ${q.ma} ${coCo ? "mang cờ ANH_XA mà không trỏ hàng ánh xạ hồi tố nào" : `trỏ ${String(q.anhXa)} mà không mang cờ ANH_XA`} (§8.9 ⑴)`);
                continue;
            }
            if (q.anhXa === null)
                continue;
            const a = theoMa.get(q.anhXa);
            if (a === undefined) {
                loi.push(`${ten}: quan sát ${q.ma} trỏ ${q.anhXa}, không có trong hàng ánh xạ hồi tố của bảng (§8.9 ⑵)`);
                continue;
            }
            duocTro.add(a.ma);
            const so = soThoiDiem(a.ghiLuc, q.ngay);
            if (so === "TRUOC") {
                loi.push(`${ten}: quan sát ${q.ma} mang cờ ANH_XA mà hàng ${a.ma} ghi lúc ${a.ghiLuc}, TRƯỚC lúc giá của gói chứa nó lộ (${q.ngay}) (§8.9 ⑸)`);
            }
            else if (so === "KHONG_PHAN_DUOC") {
                soKhongPhanDuoc += 1;
            }
        }
        for (const a of b.anhXaHoiTo)
            if (!duocTro.has(a.ma))
                loi.push(`${ten}: hàng ánh xạ hồi tố ${a.ma} không quan sát nào trỏ tới (§8.9 ⑵)`);
    }
    return { loi, soHang, soKhongPhanDuoc };
}
const TRUONG_SO_SANH = [
    "nhan",
    "chieu",
    "lyDo",
    "tienTe",
    "cuaSoTu",
    "soQuanSat",
    "soGoi",
    "soNcc",
    "soGoiCungNguoiTao",
    "soQuanSatHoiTo",
    "soLoaiTienTe",
    "soLoaiGia0",
];
function kiemMotDong(dln, luot, d, hamThuan, dauVaoTinh) {
    const noi = [];
    const ten = `lượt ${luot.evaluationId} · báo giá ${d.bidVersionId} · dòng ${String(d.lineNo)}`;
    const bang = d.giaDong === null || d.giaDong.trangThai !== "HOP_LE"
        ? []
        : dln.bangQuanSat.find((b) => b.mocMoGia === luot.mocMoGia && b.hangChuan === d.giaDong?.hangChuan)?.quanSat;
    if (bang === undefined) {
        return { evaluationId: luot.evaluationId, bidVersionId: d.bidVersionId, lineNo: d.lineNo, ketLuan: "LECH", noi: [`${ten}: không có bảng quan sát của (mốc, hàng chuẩn) — không tính lại được`] };
    }
    let tinh;
    try {
        tinh = tinhLaiDong(d.giaDong, bang, { goiX: dln.goiX, mocMoGia: luot.mocMoGia, nhom: luot.chinhSachBenchmark });
    }
    catch (e) {
        return { evaluationId: luot.evaluationId, bidVersionId: d.bidVersionId, lineNo: d.lineNo, ketLuan: "LECH", noi: [`${ten}: ${e instanceof Error ? e.message : String(e)}`] };
    }
    for (const truong of TRUONG_SO_SANH) {
        if (tinh[truong] !== d[truong]) {
            noi.push(`${ten}: \`${truong}\` đã lưu ${JSON.stringify(d[truong])}, tính lại ra ${JSON.stringify(tinh[truong])}`);
        }
    }
    if (d.soLoaiGoiHuy !== null && (d.soLoaiGoiHuy < 0 || d.nhan === "KHONG_DO_DUOC")) {
        noi.push(`${ten}: \`soLoaiGoiHuy\` = ${String(d.soLoaiGoiHuy)} ở dòng ${d.nhan === "KHONG_DO_DUOC" ? "không đo được" : "đo được"} — cần null hay số không âm của dòng đo được`);
    }
    if (d.giaDong !== null && [...d.hoiTo].sort().join(",") !== [...d.giaDong.hoiTo].sort().join(",")) {
        noi.push(`${ten}: cờ hồi tố đã lưu [${d.hoiTo.join(",")}] khác giá của dòng [${d.giaDong.hoiTo.join(",")}]`);
    }
    if (d.giaDong === null) {
        if (d.anhXa !== null || d.hangChuan !== null || d.hoiTo.length > 0) {
            noi.push(`${ten}: dòng không có ánh xạ hiệu lực mà hàng đã lưu mang ánh xạ, hàng chuẩn hay cờ hồi tố`);
        }
    }
    else {
        if (d.anhXa === null || d.anhXa.anhXaId !== d.giaDong.anhXaId) {
            noi.push(`${ten}: hàng ánh xạ đã lưu ${d.anhXa?.anhXaId ?? "null"} KHÁC hàng hiệu lực tại lúc chấm ${d.giaDong.anhXaId ?? "null"}`);
        }
        if (d.hangChuan !== d.giaDong.hangChuan || (d.anhXa !== null && d.anhXa.hangChuan !== d.giaDong.hangChuan)) {
            noi.push(`${ten}: hàng chuẩn của hàng đã lưu / của hàng ánh xạ khác hàng chuẩn của giá dòng (${d.giaDong.hangChuan})`);
        }
    }
    if (tinh.dauVao !== null && d.giaDong?.tienTe !== null && d.giaDong !== null) {
        const khoa = `${d.giaDong.hangChuan}|${d.giaDong.tienTe ?? ""}`;
        const co = dauVaoTinh.get(khoa);
        const moi = [...tinh.dauVao].sort().join(",");
        if (co !== undefined && [...co].sort().join(",") !== moi) {
            noi.push(`${ten}: hai dòng cùng (hàng chuẩn, tiền tệ) tính ra hai tập quan sát khác nhau`);
        }
        dauVaoTinh.set(khoa, tinh.dauVao);
    }
    if (d.giaDong !== null && d.giaDong.trangThai === "HOP_LE" && d.giaDong.gia !== null && d.giaDong.tienTe !== null) {
        try {
            const ht = hamThuan(bang, {
                goiX: dln.goiX,
                mocMoGia: luot.mocMoGia,
                nhom: luot.chinhSachBenchmark,
                tienTe: d.giaDong.tienTe,
                gia: d.giaDong.gia,
            });
            const demDocLap = [
                tinh.soQuanSat,
                tinh.soGoi,
                tinh.soNcc,
                tinh.soGoiCungNguoiTao,
                tinh.soQuanSatHoiTo,
                tinh.soLoaiTienTe,
                tinh.soLoaiGia0,
            ];
            if (ht.nhan !== tinh.nhan ||
                ht.chieu !== tinh.chieu ||
                ht.cuaSoTu !== tinh.cuaSoTu ||
                ht.soDem.join(",") !== demDocLap.join(",") ||
                [...ht.dauVao].sort().join(",") !== [...(tinh.dauVao ?? [])].sort().join(",")) {
                noi.push(`${ten}: HAI LỚP BẤT ĐỒNG — hàm thuần ra ${ht.nhan}/${String(ht.chieu)}, bản cài độc lập ra ${tinh.nhan}/${String(tinh.chieu)}`);
            }
        }
        catch (e) {
            noi.push(`${ten}: lớp gọi hàm thuần ném: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    return { evaluationId: luot.evaluationId, bidVersionId: d.bidVersionId, lineNo: d.lineNo, ketLuan: noi.length === 0 ? "DAT" : "LECH", noi };
}
function kiemDuLieuNen(bo, hamThuan = HAM_THUAN_BENCHMARK_THAT) {
    const dln = bo.duLieuNen;
    const canBenchmark = bo.luotCham.filter((l) => l.coBenchmark).map((l) => l.evaluationId);
    if (dln === null) {
        if (canBenchmark.length === 0)
            return null;
        return {
            soDong: 0,
            soDat: 0,
            soLech: 0,
            dong: [],
            loi: [`lớp dữ liệu nền VẮNG mà ${String(canBenchmark.length)} lượt chấm có phiên bản chính sách cấu hình benchmark`],
            soAnhXaHoiTo: 0,
            soKhongPhanDuoc: 0,
        };
    }
    const loi = [];
    const dong = [];
    for (const id of canBenchmark) {
        if (!dln.luotCham.some((l) => l.evaluationId === id)) {
            loi.push(`lượt chấm ${id} có phiên bản chính sách cấu hình benchmark mà lớp dữ liệu nền không mang nó`);
        }
    }
    for (const luot of dln.luotCham) {
        const luotCham = bo.luotCham.find((l) => l.evaluationId === luot.evaluationId);
        if (luotCham === undefined)
            loi.push(`lớp dữ liệu nền mang lượt chấm ${luot.evaluationId} KHÔNG có ở lớp chấm thầu`);
        else if (!luotCham.coBenchmark)
            loi.push(`lớp dữ liệu nền mang lượt chấm ${luot.evaluationId} mà chính sách của nó KHÔNG cấu hình benchmark`);
        if (luotCham !== undefined) {
            const daThay = new Set();
            const trung = [];
            for (const d of luot.dong) {
                const k = `${d.bidVersionId}:${String(d.lineNo)}`;
                if (daThay.has(k))
                    trung.push(k);
                daThay.add(k);
            }
            const thieu = luotCham.hang
                .flatMap((h) => dln.hangMuc.map((m) => `${h.bidVersionId}:${String(m.lineNo)}`))
                .filter((k) => !daThay.has(k));
            if (trung.length > 0)
                loi.push(`lượt ${luot.evaluationId}: hàng benchmark TRÙNG (${trung.join(", ")})`);
            if (thieu.length > 0)
                loi.push(`lượt ${luot.evaluationId}: THIẾU hàng benchmark cho (báo giá:dòng) ${thieu.join(", ")}`);
        }
        if (luot.dauVaoThieu > 0) {
            loi.push(`lượt ${luot.evaluationId}: ${String(luot.dauVaoThieu)} đầu vào đã lưu không còn trong bảng quan sát đọc lại (§8.6)`);
        }
        const dauVaoTinh = new Map();
        for (const d of luot.dong) {
            if (luotCham !== undefined && !luotCham.hang.some((h) => h.bidVersionId === d.bidVersionId)) {
                loi.push(`lượt ${luot.evaluationId}: báo giá ${d.bidVersionId} có nhãn benchmark mà không có trong bảng xếp hạng`);
            }
            dong.push(kiemMotDong(dln, luot, d, hamThuan, dauVaoTinh));
        }
        for (const dv of luot.dauVao) {
            const tinh = dauVaoTinh.get(`${dv.hangChuan}|${dv.tienTe}`);
            if (tinh === undefined) {
                loi.push(`lượt ${luot.evaluationId}: đầu vào đã lưu của (${dv.hangChuan}, ${dv.tienTe}) không ứng với dòng đo được nào`);
            }
            else if ([...tinh].sort().join(",") !== [...dv.quanSat].sort().join(",")) {
                loi.push(`lượt ${luot.evaluationId}: đầu vào đã lưu của (${dv.hangChuan}, ${dv.tienTe}) có ${String(dv.quanSat.length)} quan sát, ` +
                    `tính lại ra ${String(tinh.length)} — hai tập khác nhau`);
            }
        }
        for (const [khoa, tinh] of dauVaoTinh) {
            if (tinh.length > 0 && !luot.dauVao.some((dv) => `${dv.hangChuan}|${dv.tienTe}` === khoa)) {
                loi.push(`lượt ${luot.evaluationId}: (${khoa.replace("|", ", ")}) tính lại ra ${String(tinh.length)} quan sát mà không có đầu vào đã lưu nào`);
            }
        }
    }
    const anhXa = kiemAnhXaHoiTo(dln);
    loi.push(...anhXa.loi);
    const soDat = dong.filter((d) => d.ketLuan === "DAT").length;
    return { soDong: dong.length, soDat, soLech: dong.length - soDat, dong, loi, soAnhXaHoiTo: anhXa.soHang, soKhongPhanDuoc: anhXa.soKhongPhanDuoc };
}
return Object.freeze({ HAM_THUAN_BENCHMARK_THAT, kiemAnhXaHoiTo, kiemDuLieuNen });
})();

// ---- packages/danh-gia/src/tco.ts
const __tp_m10 = (() => {
const { docSo, vietSo } = __tp_m4;
const MA_GIA = "gia";
const MA_VAN_CHUYEN = "van_chuyen";
const MA_NHAP_KHAU = "nhap_khau";
const MA_CHI_PHI_THANH_TOAN = "chi_phi_thanh_toan";
const MA_CHI_PHI_TRE = "chi_phi_tre";
const MA_CO_NGUON = [MA_GIA, MA_VAN_CHUYEN, MA_NHAP_KHAU, MA_CHI_PHI_THANH_TOAN, MA_CHI_PHI_TRE];
const MA_KHONG_NGUON = {
    chat_luong: "chi phí chất lượng cần tỷ lệ lỗi từ phiếu nhập kho (GRN), chưa có nguồn dữ liệu tới S5",
    thue: "thuế GTGT khấu trừ được không phải chi phí, và mã này đã bị bỏ (ADR-097 ⑻)",
};
const TRAN_TIEN_X100 = 10n ** 18n;
const MA_TONG_VUOT_MIEN = "TONG_VUOT_MIEN";
function vuotMienTien(tien) {
    const v = docSo(tien, 2);
    return v === null || v >= TRAN_TIEN_X100;
}
const SO_LE_CHI_PHI_VON = 4;
const SO_LE_TY_LE_TRE = 6;
const THAM_SO_TRONG = { chiPhiVonNam: null, ngayThanhToanChuan: null, tyLeTreNgay: null };
function docNhomTco(tho) {
    if (tho === null || typeof tho !== "object" || Array.isArray(tho))
        return THAM_SO_TRONG;
    const o = tho;
    const lay = (k) => (typeof o[k] === "string" ? o[k] : null);
    return {
        chiPhiVonNam: lay("chi_phi_von_nam"),
        ngayThanhToanChuan: lay("ngay_thanh_toan_chuan"),
        tyLeTreNgay: lay("ty_le_tre_ngay"),
    };
}
function kiemChinhSachTco(thanhPhan, thamSo, soNgayGiao) {
    const daThay = new Set();
    for (const c of thanhPhan) {
        if (c.donVi !== "TIEN") {
            return {
                lyDo: "THANH_PHAN_CHUA_CO_NGUON",
                ma: c.ma,
                cau: `thành phần "${c.ma}" là điểm phi giá (DIEM), mà chưa có màn chấm điểm nào cho nó`,
            };
        }
        const khongNguon = Object.hasOwn(MA_KHONG_NGUON, c.ma) ? MA_KHONG_NGUON[c.ma] : undefined;
        if (khongNguon !== undefined) {
            return { lyDo: "THANH_PHAN_CHUA_CO_NGUON", ma: c.ma, cau: `thành phần "${c.ma}" không chấm được: ${khongNguon}` };
        }
        if (!MA_CO_NGUON.includes(c.ma)) {
            return {
                lyDo: "THANH_PHAN_CHUA_CO_NGUON",
                ma: c.ma,
                cau: `thành phần "${c.ma}" không có nguồn dữ liệu; mã chấm được là ${MA_CO_NGUON.map((m) => `"${m}"`).join(", ")}`,
            };
        }
        if (daThay.has(c.ma)) {
            return { lyDo: "CHINH_SACH_TCO_SAI", ma: c.ma, cau: `thành phần "${c.ma}" khai hai lần` };
        }
        daThay.add(c.ma);
        const h = docSo(c.heSo, 4);
        if (h === null || h !== 10000n) {
            return {
                lyDo: "CHINH_SACH_TCO_SAI",
                ma: c.ma,
                cau: `hệ số của thành phần tiền "${c.ma}" là "${c.heSo}", không phải 1 — tiền cộng với tiền, không nhân hệ số (L8)`,
            };
        }
    }
    if (!daThay.has(MA_GIA)) {
        return { lyDo: "CHINH_SACH_TCO_SAI", ma: null, cau: `không khai thành phần "${MA_GIA}" — chi phí hiệu dụng phải gồm giá` };
    }
    if (daThay.has(MA_CHI_PHI_THANH_TOAN) && (thamSo.chiPhiVonNam === null || thamSo.ngayThanhToanChuan === null)) {
        return {
            lyDo: "THANH_PHAN_CHUA_CO_NGUON",
            ma: MA_CHI_PHI_THANH_TOAN,
            cau: `thành phần "${MA_CHI_PHI_THANH_TOAN}" cần chi phí vốn một năm và kỳ thanh toán chuẩn ở nhóm khoá tco, mà phiên bản không khai`,
        };
    }
    if (daThay.has(MA_CHI_PHI_TRE) && thamSo.tyLeTreNgay === null) {
        return {
            lyDo: "THANH_PHAN_CHUA_CO_NGUON",
            ma: MA_CHI_PHI_TRE,
            cau: `thành phần "${MA_CHI_PHI_TRE}" cần tỷ lệ chi phí trễ mỗi ngày ở nhóm khoá tco, mà phiên bản không khai`,
        };
    }
    if (daThay.has(MA_CHI_PHI_TRE) && soNgayGiao === null) {
        return {
            lyDo: "THANH_PHAN_CHUA_CO_NGUON",
            ma: MA_CHI_PHI_TRE,
            cau: `thành phần "${MA_CHI_PHI_TRE}" cần số ngày giao yêu cầu của gói, mà gói không khai`,
        };
    }
    return null;
}
function chiaLamTron(tu, mau) {
    return (2n * tu + mau) / (2n * mau);
}
function batBuoc(gt, ten) {
    if (gt === null)
        throw new RangeError(`${ten} không đọc được — đầu vào phải đi qua bộ đọc SQL và CHECK của nhóm khoá tco`);
    return gt;
}
function chiPhiThanhToan(tong, ngayChuan, ngayKhai, tyLeNam) {
    const t = batBuoc(docSo(tong, 2), "tổng tiền");
    const r = batBuoc(docSo(tyLeNam, SO_LE_CHI_PHI_VON), "chi phí vốn");
    const d = BigInt(Math.max(0, ngayChuan - ngayKhai));
    return vietSo(chiaLamTron(d * r * t, 365n * 10n ** BigInt(SO_LE_CHI_PHI_VON)), 2);
}
function chiPhiTre(tong, ngayYeuCau, ngayKhai, tyLeNgay) {
    const t = batBuoc(docSo(tong, 2), "tổng tiền");
    const r = batBuoc(docSo(tyLeNgay, SO_LE_TY_LE_TRE), "tỷ lệ trễ");
    const d = BigInt(Math.max(0, ngayKhai - ngayYeuCau));
    return vietSo(chiaLamTron(d * r * t, 10n ** BigInt(SO_LE_TY_LE_TRE)), 2);
}
function dauVaoTco(thanhPhan, thamSo, soNgayGiao, o) {
    const maThieu = [];
    const dauVao = [];
    const nguon = new Map();
    for (const c of thanhPhan) {
        switch (c.ma) {
            case MA_GIA:
                if (o.tongTien === null)
                    maThieu.push(c.ma);
                else
                    dauVao.push({ ma: c.ma, giaTri: o.tongTien });
                break;
            case MA_VAN_CHUYEN:
                if (o.phiVanChuyen === null)
                    maThieu.push(c.ma);
                else
                    dauVao.push({ ma: c.ma, giaTri: o.phiVanChuyen });
                break;
            case MA_NHAP_KHAU:
                if (o.chiPhiNhapKhau === null)
                    maThieu.push(c.ma);
                else
                    dauVao.push({ ma: c.ma, giaTri: o.chiPhiNhapKhau });
                break;
            case MA_CHI_PHI_THANH_TOAN: {
                if (o.soNgayThanhToan === null) {
                    maThieu.push(c.ma);
                    break;
                }
                if (o.tongTien === null || thamSo.chiPhiVonNam === null || thamSo.ngayThanhToanChuan === null)
                    break;
                const ngayChuan = Number(thamSo.ngayThanhToanChuan);
                const gt = chiPhiThanhToan(o.tongTien, ngayChuan, o.soNgayThanhToan, thamSo.chiPhiVonNam);
                if (vuotMienTien(gt)) {
                    maThieu.push(c.ma);
                    break;
                }
                dauVao.push({ ma: c.ma, giaTri: gt });
                nguon.set(c.ma, {
                    coSo: o.tongTien,
                    ngayKhai: String(o.soNgayThanhToan),
                    ngayChuan: thamSo.ngayThanhToanChuan,
                    tyLe: thamSo.chiPhiVonNam,
                });
                break;
            }
            case MA_CHI_PHI_TRE: {
                if (o.soNgayGiaoKhai === null) {
                    maThieu.push(c.ma);
                    break;
                }
                if (o.tongTien === null || thamSo.tyLeTreNgay === null || soNgayGiao === null)
                    break;
                const gt = chiPhiTre(o.tongTien, soNgayGiao, o.soNgayGiaoKhai, thamSo.tyLeTreNgay);
                if (vuotMienTien(gt)) {
                    maThieu.push(c.ma);
                    break;
                }
                dauVao.push({ ma: c.ma, giaTri: gt });
                nguon.set(c.ma, {
                    coSo: o.tongTien,
                    ngayKhai: String(o.soNgayGiaoKhai),
                    ngayYeuCau: String(soNgayGiao),
                    tyLe: thamSo.tyLeTreNgay,
                });
                break;
            }
            default:
                throw new RangeError(`mã "${c.ma}" không có nguồn — gọi kiemChinhSachTco trước`);
        }
    }
    return maThieu.length > 0 ? { maThieu } : { dauVao, nguon };
}
function laThieuOKhai(kq) {
    return "maThieu" in kq;
}
return Object.freeze({ MA_GIA, MA_VAN_CHUYEN, MA_NHAP_KHAU, MA_CHI_PHI_THANH_TOAN, MA_CHI_PHI_TRE, MA_CO_NGUON, MA_KHONG_NGUON, TRAN_TIEN_X100, MA_TONG_VUOT_MIEN, vuotMienTien, SO_LE_CHI_PHI_VON, SO_LE_TY_LE_TRE, THAM_SO_TRONG, docNhomTco, kiemChinhSachTco, chiPhiThanhToan, chiPhiTre, dauVaoTco, laThieuOKhai });
})();

// ---- packages/danh-gia/src/xep-hang.ts
const __tp_m11 = (() => {
function xepHang(gia) {
    const doc = gia
        .map((g, i) => ({ i, v: g === null ? null : BigInt(g.replace(".", "")) }))
        .filter((x) => x.v !== null)
        .sort((a, b) => (a.v < b.v ? -1 : a.v > b.v ? 1 : 0));
    const hang = new Array(gia.length).fill(null);
    let truoc = null;
    let hangTruoc = 0;
    doc.forEach((x, viTri) => {
        const h = truoc !== null && x.v === truoc ? hangTruoc : viTri + 1;
        hang[x.i] = h;
        truoc = x.v;
        hangTruoc = h;
    });
    return hang;
}
return Object.freeze({ xepHang });
})();

// ---- tools/bo-xuat-danh-gia/src/doc-lap/quy-doi-lai.ts
const __tp_m12 = (() => {
const { docThapPhan, nhan, thuVe, vietThapPhan, xepHangLai } = __tp_m5;
const KHUON_NGAY = /^(0|[1-9][0-9]{0,4})$/u;
const KHUON_KHONG_AM = /^(?=.{1,64}$)\d+(?:\.\d+)?$/u;
const KHUON_TIEN = /^[0-9]{1,16}\.[0-9]{2}$/u;
function docNgay(chuoi) {
    return KHUON_NGAY.test(chuoi) ? Number(chuoi) : null;
}
function khongAm(chuoi) {
    return KHUON_KHONG_AM.test(chuoi) ? docThapPhan(chuoi) : null;
}
function itNhat(x, soLe) {
    return x.soLe >= soLe ? x : { am: x.am, chuSo: [...x.chuSo, ...new Array(soLe - x.soLe).fill(0)], soLe };
}
function chiaNgan(x, mau, themLe) {
    if (x.am)
        throw new RangeError("chiaNgan chỉ chia số không âm");
    if (!Number.isInteger(mau) || mau <= 0 || mau > 1_000_000)
        throw new RangeError("chiaNgan chỉ chia cho số nguyên dương nhỏ");
    const bi = [...x.chuSo, ...new Array(themLe).fill(0)];
    const thuong = [];
    let du = 0;
    for (const c of bi) {
        du = du * 10 + c;
        thuong.push(Math.floor(du / mau));
        du %= mau;
    }
    return { am: false, chuSo: thuong, soLe: x.soLe + themLe };
}
function chiPhiThanhToanLai(coSo, ngayKhai, ngayChuan, tyLe) {
    const t = khongAm(coSo);
    const r = khongAm(tyLe);
    const k = docNgay(ngayKhai);
    const c = docNgay(ngayChuan);
    if (t === null || r === null || k === null || c === null)
        return null;
    const d = docThapPhan(String(Math.max(0, c - k)));
    if (d === null)
        return null;
    const tich = itNhat(nhan(nhan(d, r), t), 2);
    return vietThapPhan(thuVe(chiaNgan(tich, 365, 1), 2));
}
function chiPhiTreLai(coSo, ngayKhai, ngayYeuCau, tyLe) {
    const t = khongAm(coSo);
    const r = khongAm(tyLe);
    const k = docNgay(ngayKhai);
    const y = docNgay(ngayYeuCau);
    if (t === null || r === null || k === null || y === null)
        return null;
    const d = docThapPhan(String(Math.max(0, k - y)));
    if (d === null)
        return null;
    return vietThapPhan(thuVe(itNhat(nhan(nhan(d, r), t), 2), 2));
}
function hangGiaLai(hang, bidVersionId) {
    return bangHangGiaLai(hang).get(bidVersionId) ?? null;
}
function bangHangGiaLai(hang) {
    const coHang = hang.filter((h) => h.rank !== null);
    const gia = coHang.map((h) => (h.tienGia !== null && KHUON_TIEN.test(h.tienGia) ? h.tienGia : null));
    const xep = xepHangLai(gia);
    return new Map(coHang.map((h, i) => [h.bidVersionId, xep[i] ?? null]));
}
return Object.freeze({ chiaNgan, chiPhiThanhToanLai, chiPhiTreLai, hangGiaLai, bangHangGiaLai });
})();

// ---- tools/bo-xuat-danh-gia/src/kiem-tco.ts
const __tp_m13 = (() => {
const { chiPhiThanhToan, chiPhiTre } = __tp_m10; const { xepHang } = __tp_m11;
const { bangHangGiaLai, chiPhiThanhToanLai, chiPhiTreLai } = __tp_m12;
const MA_THANH_TOAN = "chi_phi_thanh_toan";
const MA_TRE = "chi_phi_tre";
const KHOA_THANH_TOAN = ["coSo", "ngayChuan", "ngayKhai", "tyLe"];
const KHOA_TRE = ["coSo", "ngayKhai", "ngayYeuCau", "tyLe"];
const KHUON_NGAY = /^(0|[1-9][0-9]{0,4})$/u;
const KHUON_TIEN = /^[0-9]{1,16}\.[0-9]{2}$/u;
function boc(f) {
    try {
        return f();
    }
    catch {
        return null;
    }
}
const QUY_DOI_THAT = {
    thanhToan: (coSo, ngayKhai, ngayChuan, tyLe) => KHUON_NGAY.test(ngayKhai) && KHUON_NGAY.test(ngayChuan)
        ? boc(() => chiPhiThanhToan(coSo, Number(ngayChuan), Number(ngayKhai), tyLe))
        : null,
    tre: (coSo, ngayKhai, ngayYeuCau, tyLe) => KHUON_NGAY.test(ngayKhai) && KHUON_NGAY.test(ngayYeuCau)
        ? boc(() => chiPhiTre(coSo, Number(ngayYeuCau), Number(ngayKhai), tyLe))
        : null,
    xepHang: (gia) => xepHang(gia),
};
function thanhPhanGia(hang) {
    return hang.components.find((c) => c.ma === "gia");
}
function haiLop(nhan, luu, docLap, thuan) {
    const noi = [];
    const lechDocLap = docLap === null || docLap !== luu;
    const lechThuan = thuan === null || thuan !== luu;
    if (lechDocLap) {
        noi.push(`lớp độc lập: ${nhan} đã lưu ${String(luu)}, tính lại ra ${docLap === null ? "KHÔNG tính được" : docLap}`);
    }
    if (lechThuan) {
        noi.push(`lớp hàm thuần: ${nhan} đã lưu ${String(luu)}, tính lại ra ${thuan === null ? "KHÔNG tính được" : thuan}`);
    }
    if (!lechDocLap && lechThuan) {
        noi.push("HAI LỚP BẤT ĐỒNG: lớp độc lập nói ĐẠT, lớp hàm thuần nói LỆCH — một trong hai bản cài đang sai");
    }
    if (lechDocLap && !lechThuan) {
        noi.push("HAI LỚP BẤT ĐỒNG: lớp hàm thuần nói ĐẠT, lớp độc lập nói LỆCH — hình dạng của một lỗi NẰM TRONG phép quy đổi của lượt chấm (ADR-059)");
    }
    return noi;
}
function kiemQuyDoiHang(goi, hang, hamThuan = QUY_DOI_THAT) {
    const noi = [];
    if (hang.effectiveCost !== null && hang.maThieu !== null) {
        noi.push(`hàng có effectiveCost mà mang maThieu [${hang.maThieu.join(", ")}] (§9.4)`);
    }
    const gia = thanhPhanGia(hang);
    for (const c of hang.components) {
        if (c.ma !== MA_THANH_TOAN && c.ma !== MA_TRE)
            continue;
        const ten = `thành phần "${c.ma}"`;
        const khoa = c.ma === MA_THANH_TOAN ? KHOA_THANH_TOAN : KHOA_TRE;
        if (c.nguon === undefined) {
            noi.push(`${ten} là mã quy đổi mà không mang \`nguon\` (§9.3 bước 1)`);
            continue;
        }
        const n = c.nguon;
        const coKhoa = Object.keys(n).sort().join(",");
        if (coKhoa !== khoa.join(",")) {
            noi.push(`${ten}: \`nguon\` cần đúng khoá ${khoa.join(",")}, gặp ${coKhoa} (§9.3 bước 1)`);
            continue;
        }
        const coSo = n["coSo"] ?? "";
        const ngayKhai = n["ngayKhai"] ?? "";
        const tyLe = n["tyLe"] ?? "";
        if (gia?.giaTri === undefined || coSo !== gia.giaTri) {
            noi.push(`${ten}: nguon.coSo ${coSo} khác giaTri của "gia" ${String(gia?.giaTri)} (§9.3 bước 2)`);
        }
        if (c.ma === MA_THANH_TOAN) {
            const ngayChuan = n["ngayChuan"] ?? "";
            const tyLeGoi = goi.thamSo?.["chi_phi_von_nam"];
            const ngayChuanGoi = goi.thamSo?.["ngay_thanh_toan_chuan"];
            if (tyLe !== tyLeGoi)
                noi.push(`${ten}: nguon.tyLe ${tyLe} khác goiTco.thamSo.chi_phi_von_nam ${String(tyLeGoi)} (§9.3 bước 3)`);
            if (ngayChuan !== ngayChuanGoi) {
                noi.push(`${ten}: nguon.ngayChuan ${ngayChuan} khác goiTco.thamSo.ngay_thanh_toan_chuan ${String(ngayChuanGoi)} (§9.3 bước 3)`);
            }
            noi.push(...haiLop(`giaTri của ${ten}`, c.giaTri, chiPhiThanhToanLai(coSo, ngayKhai, ngayChuan, tyLe), hamThuan.thanhToan(coSo, ngayKhai, ngayChuan, tyLe)));
        }
        else {
            const ngayYeuCau = n["ngayYeuCau"] ?? "";
            const tyLeGoi = goi.thamSo?.["ty_le_tre_ngay"];
            const yeuCauGoi = goi.soNgayGiao === null ? null : String(goi.soNgayGiao);
            if (tyLe !== tyLeGoi)
                noi.push(`${ten}: nguon.tyLe ${tyLe} khác goiTco.thamSo.ty_le_tre_ngay ${String(tyLeGoi)} (§9.3 bước 3)`);
            if (ngayYeuCau !== yeuCauGoi) {
                noi.push(`${ten}: nguon.ngayYeuCau ${ngayYeuCau} khác goiTco.soNgayGiao ${String(yeuCauGoi)} (§9.3 bước 3)`);
            }
            noi.push(...haiLop(`giaTri của ${ten}`, c.giaTri, chiPhiTreLai(coSo, ngayKhai, ngayYeuCau, tyLe), hamThuan.tre(coSo, ngayKhai, ngayYeuCau, tyLe)));
        }
    }
    return noi;
}
function soQuyDoi(hang) {
    return hang.components.filter((c) => c.ma === MA_THANH_TOAN || c.ma === MA_TRE).length;
}
function kiemTapMa(goi, luot) {
    if (goi.tapMa === null)
        return [];
    const ma = luot.chinhSachThanhPhan.map((c) => c.ma);
    if (ma.length === goi.tapMa.length && ma.every((m, i) => m === goi.tapMa?.[i]))
        return [];
    return [`lượt chấm ${luot.evaluationId}: tập mã [${ma.join(", ")}] khác goiTco.tapMa [${goi.tapMa.join(", ")}] (§9.3)`];
}
function bangThanhPhan(a, b) {
    const khoa = ["ma", "donVi", "heSo", "giaTri", "tien"];
    if (khoa.some((k) => a[k] !== b[k]))
        return false;
    return bangChuoiTheoKhoa(a.nguon ?? null, b.nguon ?? null);
}
function bangChuoiTheoKhoa(a, b) {
    if (a === null || b === null)
        return a === b;
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]);
}
function bangMang(a, b) {
    if (a === null || b === null)
        return a === b;
    return a.length === b.length && a.every((x, i) => x === b[i]);
}
function tienGiaDau(h) {
    const g = thanhPhanGia(h);
    return g === undefined ? null : g.tien;
}
function bangHangGiaThuan(luot, hamThuan) {
    const coHang = luot.hang.filter((h) => h.rank !== null);
    const gia = coHang.map((h) => {
        const t = tienGiaDau(h);
        return t !== null && KHUON_TIEN.test(t) ? t : null;
    });
    const xep = hamThuan.xepHang(gia);
    return new Map(coHang.map((h, i) => [h.bidVersionId, xep[i] ?? null]));
}
const KY_TU_KHONG_TRANG = /[^\s\u00a0\u1680\u2000-\u200b\u2028\u2029\u202f\u205f\u3000\ufeff]/u;
function giaiTrinhHopLe(s) {
    return KY_TU_KHONG_TRANG.test(s) && [...s].length <= 2000;
}
function kiemMotCamKet(bo, awardId, h, k, hangGia) {
    const noi = [];
    const ten = `cam kết của trao thầu ${awardId}`;
    if (k.hangTco !== h.rank)
        noi.push(`${ten}: hangTco ${String(k.hangTco)} khác hạng của hàng ${String(h.rank)} (§10 bước 1)`);
    if (k.effectiveCost !== h.effectiveCost) {
        noi.push(`${ten}: effectiveCost ${k.effectiveCost} khác của hàng ${String(h.effectiveCost)} (§10 bước 1)`);
    }
    if (k.components.length !== h.components.length || k.components.some((c, i) => !bangThanhPhan(c, h.components[i]))) {
        noi.push(`${ten}: components khác components của hàng (§10 bước 1)`);
    }
    if (!bangMang(k.tapMa, bo.goiTco.tapMa))
        noi.push(`${ten}: tapMa khác goiTco.tapMa (§10 bước 2)`);
    if (!bangChuoiTheoKhoa(k.thamSo, bo.goiTco.thamSo))
        noi.push(`${ten}: thamSo khác goiTco.thamSo (§10 bước 2)`);
    if (k.soNgayGiao !== bo.goiTco.soNgayGiao) {
        noi.push(`${ten}: soNgayGiao ${String(k.soNgayGiao)} khác goiTco.soNgayGiao ${String(bo.goiTco.soNgayGiao)} (§10 bước 2)`);
    }
    for (const c of h.components) {
        if (c.ma === MA_THANH_TOAN && c.nguon?.["ngayKhai"] !== (k.khai.paymentDays === null ? undefined : String(k.khai.paymentDays))) {
            noi.push(`${ten}: khai.paymentDays ${String(k.khai.paymentDays)} khác nguon.ngayKhai của "${MA_THANH_TOAN}" (§10 bước 3)`);
        }
        if (c.ma === MA_TRE && c.nguon?.["ngayKhai"] !== (k.khai.leadTimeDays === null ? undefined : String(k.khai.leadTimeDays))) {
            noi.push(`${ten}: khai.leadTimeDays ${String(k.khai.leadTimeDays)} khác nguon.ngayKhai của "${MA_TRE}" (§10 bước 3)`);
        }
        if (c.ma === "van_chuyen" && c.giaTri !== (k.khai.freight ?? undefined)) {
            noi.push(`${ten}: khai.freight ${String(k.khai.freight)} khác giaTri của "van_chuyen" (§10 bước 3)`);
        }
        if (c.ma === "nhap_khau" && c.giaTri !== (k.khai.importCost ?? undefined)) {
            noi.push(`${ten}: khai.importCost ${String(k.khai.importCost)} khác giaTri của "nhap_khau" (§10 bước 3)`);
        }
    }
    const docLap = hangGia.docLap.get(h.bidVersionId) ?? null;
    const thuan = hangGia.thuan.get(h.bidVersionId) ?? null;
    const viet = (x) => (x === null ? "null" : String(x));
    noi.push(...haiLop(`hangGia của ${ten}`, viet(k.hangGia), viet(docLap), viet(thuan)).map((d) => `${d} (§10 bước 4)`));
    const lech = k.hangGia !== k.hangTco;
    if (lech && k.giaiTrinhLechHang === null) {
        noi.push(`${ten}: hạng giá ${viet(k.hangGia)} khác hạng chi phí ${String(k.hangTco)} mà KHÔNG có giải trình (§10 bước 5)`);
    }
    if (!lech && k.giaiTrinhLechHang !== null) {
        noi.push(`${ten}: hạng giá bằng hạng chi phí (${String(k.hangTco)}) mà có giải trình (§10 bước 5)`);
    }
    if (k.giaiTrinhLechHang !== null && !giaiTrinhHopLe(k.giaiTrinhLechHang)) {
        noi.push(`${ten}: giải trình rỗng (chỉ khoảng trắng) hay dài quá 2000 ký tự — không phải thứ hệ thống nhận (§10 bước 5)`);
    }
    return noi;
}
function kiemCamKet(bo, hamThuan = QUY_DOI_THAT) {
    const loi = [];
    let soCamKet = 0;
    let soDat = 0;
    let soDeXuatKhongCamKet = 0;
    const luotTheoId = new Map(bo.luotCham.map((l) => [l.evaluationId, l]));
    const hangTheoLuot = new Map(bo.luotCham.map((l) => [l.evaluationId, new Map(l.hang.map((h) => [h.bidVersionId, h]))]));
    const hangGiaTheoLuot = new Map();
    const hangGiaCua = (luot) => {
        const co = hangGiaTheoLuot.get(luot.evaluationId);
        if (co !== undefined)
            return co;
        const moi = {
            docLap: bangHangGiaLai(luot.hang.map((x) => ({ bidVersionId: x.bidVersionId, rank: x.rank, tienGia: tienGiaDau(x) }))),
            thuan: bangHangGiaThuan(luot, hamThuan),
        };
        hangGiaTheoLuot.set(luot.evaluationId, moi);
        return moi;
    };
    let chupSomNhat = null;
    for (const t of bo.traoThau) {
        const c = t.camKet?.chupLuc.giaTri;
        if (c !== undefined && (chupSomNhat === null || c < chupSomNhat))
            chupSomNhat = c;
    }
    for (const t of bo.traoThau) {
        if (t.camKet === null) {
            if (t.status === "PROPOSED") {
                soDeXuatKhongCamKet += 1;
                if (chupSomNhat !== null && t.actedAt.giaTri >= chupSomNhat) {
                    loi.push(`đề xuất ${t.awardId} lúc ${t.actedAt.giaTri} KHÔNG mang cam kết, mà bundle có cam kết chụp từ ${chupSomNhat} — ` +
                        "từ mốc ấy mọi đề xuất đều được chụp (§10 bước 6)");
                }
            }
            continue;
        }
        soCamKet += 1;
        if (t.status !== "PROPOSED") {
            loi.push(`trao thầu ${t.awardId} ở trạng thái ${t.status} mà mang cam kết — chỉ đề xuất mang cam kết (§10)`);
            continue;
        }
        if (t.camKet.chupLuc.giaTri !== t.actedAt.giaTri) {
            loi.push(`cam kết của trao thầu ${t.awardId} chụp lúc ${t.camKet.chupLuc.giaTri}, khác lúc đề xuất ${t.actedAt.giaTri} — ` +
                "cam kết chỉ chụp trong chính giao dịch đề xuất (§10 bước 6)");
        }
        const luot = luotTheoId.get(t.evaluationId);
        const h = hangTheoLuot.get(t.evaluationId)?.get(t.bidVersionId);
        if (luot === undefined || h === undefined) {
            loi.push(`cam kết của trao thầu ${t.awardId} trỏ một hàng KHÔNG có trong bundle (§10)`);
            continue;
        }
        const noi = kiemMotCamKet(bo, t.awardId, h, t.camKet, hangGiaCua(luot));
        if (noi.length === 0)
            soDat += 1;
        loi.push(...noi);
    }
    return { soCamKet, soDat, soDeXuatKhongCamKet, loi };
}
return Object.freeze({ MA_THANH_TOAN, MA_TRE, QUY_DOI_THAT, kiemQuyDoiHang, soQuyDoi, kiemTapMa, kiemCamKet });
})();

// ---- tools/bo-xuat-danh-gia/src/doc-lap/quan-tri-lai.ts
const __tp_m14 = (() => {
const { createHash } = __tp_node_crypto;
const { docThapPhan, soSanh } = __tp_m5;
function soSanhGiaTri(a, b) {
    const n = Math.max(a.soLe, b.soLe);
    const can = (x) => x.soLe === n ? x : { am: x.am, chuSo: [...x.chuSo, ...new Array(n - x.soLe).fill(0)], soLe: n };
    return soSanh(can(a), can(b));
}
const LOAI_TRONG_DANH_SACH = ["SINGLE_SOURCE", "LIMITED_COMPETITION", "ROTATION"];
function sha256(s) {
    return createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");
}
function thuTuByteUtf8(a, b) {
    return Buffer.compare(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}
function nhomDongNhat(ds) {
    const nhom = new Map();
    for (const a of ds) {
        const k = `${String(a.bamNoiDung)}|${a.bamGiaoHang}`;
        nhom.set(k, (nhom.get(k) ?? new Set()).add(a.approverUserId));
    }
    return Math.max(0, ...[...nhom.values()].map((s) => s.size));
}
function soNguoi(ds) {
    return new Set(ds.map((x) => x.approverUserId)).size;
}
function tinhLaiQuanTri(qt) {
    const loi = [];
    const canhBao = [];
    const bac = new Map();
    const ns = qt.nganSach;
    const cs = qt.chinhSachNganSach;
    const tiers = cs?.tiers ?? null;
    const so = (x, noi) => {
        const v = docThapPhan(x);
        if (v === null)
            loi.push(`${noi}: "${x}" không đọc được như một số thập phân`);
        return v;
    };
    const bacTheoMoc = (moc, noi) => {
        const m = so(moc, noi);
        if (m === null || tiers === null)
            return null;
        const b = tiers.find((t) => {
            const tu = t["tu_so_tien"] === undefined ? null : docThapPhan(t["tu_so_tien"]);
            return tu !== null && soSanhGiaTri(tu, m) === 0;
        });
        if (b === undefined)
            loi.push(`${noi}: không bậc nào của phiên bản chính sách có tu_so_tien = ${moc}`);
        return b ?? null;
    };
    const chonBac = (v, t, noi) => {
        if (cs === null || tiers === null) {
            loi.push(`${noi}: không có phiên bản chính sách có bậc để chọn bậc`);
            return null;
        }
        if (t !== cs.currency) {
            loi.push(`${noi}: tiền tệ ${t} khác tiền tệ chính sách ${cs.currency} — không chọn được bậc (§11.1)`);
            return null;
        }
        const gv = so(v, noi);
        if (gv === null)
            return null;
        let tot = null;
        for (const b of tiers) {
            const c = b["tu_so_tien"];
            const tu = c === undefined ? null : docThapPhan(c);
            if (c === undefined || tu === null) {
                loi.push(`${noi}: một bậc không có tu_so_tien đọc được`);
                return null;
            }
            if (soSanhGiaTri(tu, gv) <= 0 && (tot === null || soSanhGiaTri(tu, tot.so) > 0))
                tot = { chuoi: c, so: tu };
        }
        if (tot === null)
            loi.push(`${noi}: không bậc nào có tu_so_tien ≤ ${v} (§11.1)`);
        return tot?.chuoi ?? null;
    };
    const coXungDotTruoc = (nguoi, t) => qt.khaiBaoXungDot.some((d) => d.userId === nguoi && d.trangThai === "CO_XUNG_DOT" && d.createdAt <= t);
    const ngoaiLeSong = (t) => qt.ngoaiLe.filter((e) => e.hanhDong === "LAP" &&
        e.loai !== null &&
        e.createdAt <= t &&
        !qt.ngoaiLe.some((r) => r.hanhDong === "RUT" && r.ngoaiLeId === e.id && r.createdAt <= t));
    const s3 = ns !== null && ns.tierTuSoTien !== null && tiers !== null;
    const cheDo = s3 ? "S3" : "MVP1";
    if (!s3 && qt.goi.nopLuc !== null && qt.batS3Luc !== null && qt.goi.nopLuc >= qt.batS3Luc) {
        loi.push(`gói nộp lúc ${qt.goi.nopLuc}, SAU lần bật S3 (${qt.batS3Luc}), mà không có bậc ghim (§11.2)`);
    }
    if (s3 && ns !== null && ns.tierTuSoTien !== null) {
        const tu = chonBac(ns.estimatedValue, ns.currency, "bậc ước lượng");
        const a = tu === null ? null : docThapPhan(tu);
        const b = docThapPhan(ns.tierTuSoTien);
        if (a !== null && b !== null && soSanhGiaTri(a, b) !== 0) {
            loi.push(`bậc ước lượng tính lại ra ${String(tu)}, ngân sách ghi tierTuSoTien ${ns.tierTuSoTien} (§11.3)`);
        }
    }
    if (!qt.goi.requiresDualApproval) {
        if (ns === null || cs === null) {
            loi.push("gói không cần phê duyệt kép mà không có ngân sách (§11.3)");
        }
        else if (ns.currency !== cs.currency) {
            loi.push(`gói không cần phê duyệt kép mà tiền tệ ngân sách ${ns.currency} khác chính sách ${cs.currency} (§11.3)`);
        }
        else {
            const v = so(ns.estimatedValue, "ước lượng");
            const n = so(cs.dualApprovalThreshold, "ngưỡng kép");
            if (v !== null && n !== null && soSanhGiaTri(v, n) >= 0) {
                loi.push(`gói không cần phê duyệt kép mà ước lượng ${ns.estimatedValue} ≥ ngưỡng ${cs.dualApprovalThreshold} (§11.3)`);
            }
        }
    }
    let soNguoiKyMoGoi = null;
    const mo = qt.goi.moLuc;
    if (mo !== null) {
        const can = qt.goi.requiresDualApproval ? 2 : 1;
        let ungVien = qt.chuKyMoGoi.filter((a) => a.bamNoiDung !== null && a.approverUserId !== qt.goi.nguoiTao);
        if (s3 && ns !== null && ns.tierTuSoTien !== null) {
            const bNs = sha256(`NGAN_SACH|${ns.estimatedValue}|${ns.currency}|${ns.policyId}|${ns.tierTuSoTien}|${String(qt.goi.requiresDualApproval)}`);
            const dong = [
                ...qt.loiMoi
                    .filter((i) => !i.moiSauKhiKy && (i.revokedAt === null || i.revokedAt > mo))
                    .map((i) => `MOI|${i.supplierId}|${i.contactId}|${i.linkChannel}`),
                ...ngoaiLeSong(mo)
                    .filter((e) => e.loai !== null && LOAI_TRONG_DANH_SACH.includes(e.loai))
                    .map((e) => `NGOAI_LE|${e.id}|${String(e.loai)}|${String(e.maLyDo)}|${sha256(e.giaiTrinh)}`),
            ].sort(thuTuByteUtf8);
            const bDs = sha256(dong.join("\n"));
            ungVien = ungVien.filter((a) => a.lanNopDaXem !== null &&
                !qt.traVe.some((r) => r.returnedBy === a.approverUserId && a.lanNopDaXem !== null && r.lanNop >= a.lanNopDaXem) &&
                !coXungDotTruoc(a.approverUserId, mo) &&
                a.bamNganSach === bNs &&
                a.bamDanhSach === bDs);
        }
        soNguoiKyMoGoi = nhomDongNhat(ungVien);
        if (soNguoiKyMoGoi < can) {
            loi.push(`gói mở lúc ${mo} với ${String(soNguoiKyMoGoi)} người ký đếm được, cần ${String(can)} (§11.4; ${String(qt.chuKyMoGoi.length)} chữ ký trong bộ)`);
        }
    }
    const nop = qt.goi.nopLuc;
    if (s3 && ns !== null && ns.tierTuSoTien !== null && nop !== null) {
        const B = bacTheoMoc(ns.tierTuSoTien, "bậc ghim");
        if (B !== null) {
            if (B["dau_thau_chinh_thuc"] !== "false")
                loi.push("bậc ghim là bậc đấu thầu chính thức — không gói nào qua được K2 (§11.5)");
            const n = qt.loiMoi.filter((i) => i.createdAt <= nop && (i.revokedAt === null || i.revokedAt > nop)).length;
            const toiThieu = B["so_ncc_toi_thieu"] === undefined ? null : Number.parseInt(B["so_ncc_toi_thieu"], 10);
            if (toiThieu === null || !Number.isInteger(toiThieu)) {
                loi.push("bậc ghim không khai so_ncc_toi_thieu đọc được (§11.5)");
            }
            else if (n < toiThieu) {
                const loaiCuu = n === 1 ? "SINGLE_SOURCE" : "LIMITED_COMPETITION";
                if (n < 1 || !ngoaiLeSong(nop).some((e) => e.loai === loaiCuu)) {
                    loi.push(`lúc nộp (${nop}) gói có ${String(n)} lời mời còn sống, dưới ${String(toiThieu)} của bậc ghim, mà không có ngoại lệ ${loaiCuu} còn sống (§11.5)`);
                }
            }
        }
    }
    if (s3 && ns !== null && ns.tierTuSoTien !== null) {
        for (const p of qt.traoThau.filter((x) => x.status === "PROPOSED")) {
            const noi = `đề xuất ${p.awardId}`;
            if (p.soTienTrao === null || p.tienTe === null) {
                loi.push(`${noi}: không có số tiền trao đọc được (§11.6)`);
                continue;
            }
            const trao = chonBac(p.soTienTrao, p.tienTe, `${noi} — bậc trao`);
            const ul = docThapPhan(ns.tierTuSoTien);
            const tr = trao === null ? null : docThapPhan(trao);
            if (trao === null || ul === null || tr === null)
                continue;
            const cao = soSanhGiaTri(tr, ul) >= 0 ? trao : ns.tierTuSoTien;
            const H = bacTheoMoc(cao, `${noi} — bậc cao hơn`);
            const n = H?.["award_so_chu_ky"] === undefined ? null : Number.parseInt(H["award_so_chu_ky"], 10);
            if (n === null || !Number.isInteger(n)) {
                loi.push(`${noi}: bậc cao hơn không khai award_so_chu_ky đọc được (§11.6)`);
                continue;
            }
            bac.set(p.awardId, { bacUocLuong: ns.tierTuSoTien, bacTrao: trao, bacCaoHon: cao, chuKyCan: n });
        }
    }
    const traoThauDuyet = [];
    const xep = [...qt.traoThau].sort((x, y) => x.actedAt === y.actedAt ? (x.awardId < y.awardId ? -1 : x.awardId > y.awardId ? 1 : 0) : x.actedAt < y.actedAt ? -1 : 1);
    xep.forEach((a, i) => {
        if (a.status !== "APPROVED")
            return;
        const noi = `trao thầu ${a.awardId}`;
        const p = xep[i - 1];
        if (p?.status !== "PROPOSED" || p.bidVersionId !== a.bidVersionId) {
            loi.push(`${noi}: hàng đứng trước không phải đề xuất PROPOSED cùng báo giá (§11.7)`);
            return;
        }
        for (const k of p.chuKy) {
            const sau = qt.khaiBaoXungDot.filter((d) => d.userId === k.approverUserId && d.trangThai === "CO_XUNG_DOT" && d.createdAt > a.actedAt);
            if (sau.length > 0) {
                canhBao.push(`${noi}: người ký ${k.approverUserId} khai CO_XUNG_DOT SAU lúc duyệt (${sau[0].createdAt}) — báo, không phán xử (§11.10)`);
            }
        }
        let ungVien = p.chuKy.filter((k) => k.approvedAt <= a.actedAt && k.approverUserId !== p.actedBy);
        if (!s3) {
            const n = soNguoi(ungVien);
            traoThauDuyet.push({ awardId: a.awardId, soNguoiKy: n });
            if (n < 1)
                loi.push(`${noi}: duyệt với 0 chữ ký (§11.7)`);
            return;
        }
        ungVien = ungVien.filter((k) => !coXungDotTruoc(k.approverUserId, a.actedAt));
        const b = bac.get(p.awardId);
        const H = b === undefined ? null : bacTheoMoc(b.bacCaoHon, `${noi} — bậc cao hơn`);
        if (b === undefined || H === null) {
            loi.push(`${noi}: không tính được bậc cao hơn của đề xuất (§11.7)`);
            return;
        }
        let vaiCho = [];
        try {
            const v = JSON.parse(H["award_vai"] ?? "null");
            if (Array.isArray(v) && v.every((x) => typeof x === "string"))
                vaiCho = v;
            else
                loi.push(`${noi}: award_vai của bậc cao hơn không là mảng chuỗi (§11.7)`);
        }
        catch {
            loi.push(`${noi}: award_vai của bậc cao hơn không đọc được (§11.7)`);
        }
        for (const k of ungVien) {
            if (k.vaiLucKy === null || k.vaiLucKy.length === 0 || !k.vaiLucKy.every((v) => vaiCho.includes(v))) {
                loi.push(`${noi}: chữ ký của ${k.approverUserId} mang vai ${JSON.stringify(k.vaiLucKy)} ngoài award_vai của bậc (§11.7)`);
            }
            if (cs !== null && k.approverUserId === cs.createdBy) {
                loi.push(`${noi}: ${k.approverUserId} là tác giả phiên bản chính sách mà vẫn ký trao thầu (§11.7)`);
            }
        }
        let dem = ungVien;
        if (H["tham_dinh_truoc_trao"] === "true") {
            let q;
            for (const x of qt.thamDinh) {
                if (x.supplierId !== p.supplierId || x.createdAt > a.actedAt)
                    continue;
                if (q === undefined || BigInt(x.thuTu) > BigInt(q.thuTu))
                    q = x;
            }
            if (q === undefined || q.loai !== "QUALIFIED" || q.hetHanAt === null || !(a.actedAt < q.hetHanAt)) {
                loi.push(`${noi}: bậc đòi thẩm định mà nhà cung cấp không có thẩm định QUALIFIED còn hạn tại lúc duyệt (§11.7)`);
                return;
            }
            const qId = q.id;
            dem = ungVien.filter((k) => k.thamDinhId === qId);
            if (q.createdBy === p.actedBy || dem.some((k) => k.approverUserId === q.createdBy)) {
                loi.push(`${noi}: người thẩm định ${q.createdBy} là người đề xuất hay người ký (§11.7)`);
            }
        }
        const n = soNguoi(dem);
        traoThauDuyet.push({ awardId: a.awardId, soNguoiKy: n });
        if (n < b.chuKyCan)
            loi.push(`${noi}: ${String(n)} người ký đếm được, bậc cần ${String(b.chuKyCan)} (§11.7)`);
        if (b.chuKyCan === 2 && H["award_vai_khac_nhau"] === "true") {
            const co = dem.some((x) => dem.some((y) => y.approverUserId !== x.approverUserId &&
                (x.vaiLucKy ?? []).some((vx) => (y.vaiLucKy ?? []).some((vy) => vx !== vy))));
            if (!co)
                loi.push(`${noi}: bậc đòi hai vai khác nhau mà hai người ký đếm không mang hai vai khác nhau (§11.7)`);
        }
    });
    return { cheDo, loi, canhBao, bac, soNguoiKyMoGoi, traoThauDuyet };
}
return Object.freeze({ soSanhGiaTri, tinhLaiQuanTri });
})();

// ---- tools/bo-xuat-danh-gia/src/kiem-quan-tri.ts
const __tp_m15 = (() => {
const { soSanhGiaTri, tinhLaiQuanTri } = __tp_m14;
const { docThapPhan } = __tp_m5;
const bangNhau = (a, b) => {
    const x = docThapPhan(a);
    const y = docThapPhan(b);
    return x !== null && y !== null && soSanhGiaTri(x, y) === 0;
};
function kiemQuanTri(bo) {
    const qt = bo.quanTri;
    const lai = tinhLaiQuanTri(qt);
    const loi = [...lai.loi];
    if (qt.cheDo !== lai.cheDo) {
        loi.push(`HAI LỚP BẤT ĐỒNG: chế độ của cơ sở dữ liệu là ${qt.cheDo}, lớp độc lập suy ra ${lai.cheDo} (§11.2)`);
    }
    for (const t of qt.traoThau) {
        if (t.status !== "PROPOSED" || lai.cheDo !== "S3") {
            if (t.lop1 !== null)
                loi.push(`trao thầu ${t.awardId}: mang lop1 dù không phải đề xuất của gói S3 (§11.6)`);
            continue;
        }
        if (t.lop1 === null) {
            loi.push(`đề xuất ${t.awardId}: gói S3 mà không mang lop1 (§11.8)`);
            continue;
        }
        const b = lai.bac.get(t.awardId);
        if (b === undefined)
            continue;
        for (const k of ["bacUocLuong", "bacTrao", "bacCaoHon"]) {
            if (!bangNhau(t.lop1[k], b[k])) {
                loi.push(`HAI LỚP BẤT ĐỒNG: đề xuất ${t.awardId} — ${k} của cơ sở dữ liệu ${t.lop1[k]}, lớp độc lập tính ra ${b[k]} (§11.6)`);
            }
        }
        if (t.lop1.chuKyCan !== b.chuKyCan) {
            loi.push(`HAI LỚP BẤT ĐỒNG: đề xuất ${t.awardId} — chuKyCan của cơ sở dữ liệu ${String(t.lop1.chuKyCan)}, lớp độc lập tính ra ${String(b.chuKyCan)} (§11.6)`);
        }
    }
    const goc = new Set(bo.traoThau.map((t) => t.awardId));
    const quanTri = new Set(qt.traoThau.map((t) => t.awardId));
    for (const id of goc)
        if (!quanTri.has(id))
            loi.push(`trao thầu ${id} có trong bộ mà vắng ở lớp quản trị (§11.8)`);
    for (const id of quanTri)
        if (!goc.has(id))
            loi.push(`trao thầu ${id} có ở lớp quản trị mà vắng trong bộ (§11.8)`);
    return {
        cheDo: lai.cheDo,
        loi,
        canhBao: lai.canhBao,
        soNguoiKyMoGoi: lai.soNguoiKyMoGoi,
        soTraoThauDuyet: lai.traoThauDuyet.length,
    };
}
return Object.freeze({ kiemQuanTri });
})();

// ---- tools/bo-xuat-danh-gia/src/doc-lap/rui-ro-lai.ts
const __tp_m16 = (() => {
const PHUONG_PHAP_V1 = "RUI_RO_V1";
const MA_PHUONG_PHAP_V1 = ["F1", "F2b", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11"];
const TRONG_SO_V1 = { F1: 20, F2b: 15, F3: 15, F4: 5, F5: 10, F6: 10, F7: 5, F8: 10, F9: 10, F10: 10, F11: 5 };
const SAN_TRONG_SO_V1 = { F1: 10, F2b: 8, F3: 8, F4: 3, F5: 5, F6: 5, F7: 3, F8: 5, F9: 5, F10: 5, F11: 3 };
const CO_LICH_SU_V1 = ["F1", "F2b", "F3", "F4"];
const MA_CHUA_CAI_V1 = ["F1", "F2b", "F4", "F8"];
const PHUONG_PHAP_V2 = "RUI_RO_V2";
const MA_CHUA_CAI_V2 = ["F8"];
const PHUONG_PHAP_CAI = [PHUONG_PHAP_V1, PHUONG_PHAP_V2];
const maChuaCai = (pb) => (pb === PHUONG_PHAP_V2 ? MA_CHUA_CAI_V2 : MA_CHUA_CAI_V1);
const hauTo = (pb) => pb.replace("RUI_RO_", "");
const SAN_F1 = 6;
const SAN_F2B = 9;
const SAN_F4 = 8;
const tinCayChuoi = (v, san) => (v < 2 * san ? "THAP" : v < 4 * san ? "VUA" : "CAO");
const NGUONG_DO_PHU_DAC_TA = 60;
const NGUONG_CAO = 60;
const NGUONG_VUA = 30;
const DIEM_MUC = { XANH: 0, VANG: 50, DO: 100 };
const NGUON_THEO_MA = {
    F3: "price_benchmark_results+bid_dong_tho",
    F5: "vendor_bid_versions",
    F6: "governance_signals+rfq_sourcing_exceptions",
    F7: "bid_dong_tho",
    F9: "rfq_evaluation_lines+bid_dong_tho",
    F10: "rfq_evaluation_lines+rfq_invitations",
    F11: "rfq_awards",
    DO_PHU: "rui_ro_tong_hop",
};
const KHOA_TIEN_DAC_TA = [
    "tien",
    "gia",
    "so_tien",
    "soTien",
    "amount",
    "unitPrice",
    "totalAmount",
    "don_gia",
    "donGia",
    "thanh_tien",
    "thanhTien",
    "price",
    "total",
    "effective_cost",
    "effectiveCost",
    "estimated_value",
    "estimatedValue",
    "gia_tri",
    "giaTri",
    "freight",
    "importCost",
];
const KHOA_BANG_CHUNG_THEO_MA = {
    F1: ["soGoiChuoi", "soGoiCoG", "soNccChung", "trungViGPhanVan", "madGPhanVan", "nenSoGoiCoG", "nenP10PhanVan", "nenP25PhanVan", "lyDo"],
    F2b: ["soGoiChuoi", "soNccChuoi", "lechToiDa", "coThangLienNhau", "lyDo"],
    F4: ["soGoiNhom", "soGoiNThang", "tyPhanPhanVan", "lyDo"],
    F8: [],
    F3: ["soDong", "soDongDoDuoc", "soDongLechCaoTren", "doPhuPhanVan", "tyLeLechCaoTrenPhanVan", "lyDo"],
    F5: ["soNccNopCuoi10Phut", "soCap60Giay", "soLanSuaCuaN10Phut", "cap"],
    F6: ["tinHieu", "ngoaiLe"],
    F7: ["soDong", "soDongHong", "soDongThieu", "soDongLa", "lyDo"],
    F9: ["soBaoGiaTheoDong", "soDong", "soDongTySoTu2", "soDongTySoDen05", "tySoLonNhat", "tyLeGiaTriTySoTu2PhanVan", "lyDo"],
    F10: ["soBaoGiaDocDuoc", "soLoiMoiConSong"],
    F11: ["soDeXuatTruocDaHuyHayRut", "deXuatTruocCoNo"],
    DO_PHU: ["doPhuPhanVan"],
};
const TIN_HIEU_DO = ["ESTIMATE_UNDERSTATED", "INVITE_LIST_NARROWED"];
const TIN_HIEU_KHAC = ["EARLY_CLOSE"];
const NGOAI_LE_F6 = ["SINGLE_SOURCE", "LIMITED_COMPETITION", "ROTATION", "LOW_ACTUAL_COMPETITION", "LIST_NARROWED_BELOW_MIN"];
const NHAN_DO_DUOC = ["BINH_THUONG", "LECH_VUA", "LECH_CAO"];
const KHUON_TRONG_SO = /^[1-9]\d{0,2}$/u;
const KHUON_TY_SO = /^\d+\.\d{2}$/u;
class DocBangChung {
    b;
    noi;
    loi = [];
    constructor(b, noi) {
        this.b = b;
        this.noi = noi;
    }
    khoa(tap) {
        const co = Object.keys(this.b).sort();
        const can = [...tap].sort();
        if (JSON.stringify(co) !== JSON.stringify(can)) {
            this.loi.push(`${this.noi}: bằng chứng mang khoá [${co.join(", ")}], nhánh này cần đúng [${can.join(", ")}] (§12.4)`);
        }
    }
    dem(k) {
        const v = this.b[k];
        if (typeof v === "number" && Number.isInteger(v) && v >= 0)
            return v;
        this.loi.push(`${this.noi}: \`${k}\` cần một số nguyên ≥ 0 (§12.4)`);
        return 0;
    }
    phanVan(k) {
        const v = this.dem(k);
        if (v > 10000)
            this.loi.push(`${this.noi}: \`${k}\` = ${String(v)} vượt 10000 phần vạn (§12.4)`);
        return v;
    }
    rang(dung, loiNeuSai) {
        if (!dung)
            this.loi.push(`${this.noi}: ${loiNeuSai} (§12.4)`);
    }
}
const mucTheoNguong = (tyLe) => (tyLe >= 3000 ? "DO" : tyLe >= 1000 ? "VANG" : "XANH");
function hang(ma, pb, trangThai, muc, doTinCay, thamSo) {
    return { trangThai, muc, doTinCay, giaiThichMau: `${ma}_${hauTo(pb)}_${trangThai}`, giaiThichThamSo: thamSo };
}
function tinhLaiF3(d, b, pb) {
    const lyDo = b["lyDo"];
    if (lyDo === "CHUA_CAU_HINH" || lyDo === "KHONG_CO_GIA_TRI") {
        d.khoa(["soDong", "lyDo"]);
        return hang("F3", pb, "CHUA_DU_LICH_SU", null, null, { soDong: d.dem("soDong") });
    }
    if (lyDo === "DO_PHU_THAP") {
        d.khoa(["soDong", "soDongDoDuoc", "doPhuPhanVan", "lyDo"]);
        const soDong = d.dem("soDong");
        const doPhu = d.phanVan("doPhuPhanVan");
        d.rang(doPhu < 5000, `\`DO_PHU_THAP\` mà \`doPhuPhanVan\` = ${String(doPhu)} ≥ 5000`);
        d.rang(d.dem("soDongDoDuoc") <= soDong, "`soDongDoDuoc` vượt `soDong`");
        return hang("F3", pb, "CHUA_DU_LICH_SU", null, null, { soDong, doPhuPhanVan: doPhu });
    }
    if (lyDo !== undefined)
        d.rang(false, `\`lyDo\` lạ: ${JSON.stringify(lyDo)}`);
    d.khoa(["soDong", "soDongDoDuoc", "soDongLechCaoTren", "doPhuPhanVan", "tyLeLechCaoTrenPhanVan"]);
    const soDong = d.dem("soDong");
    const doDuoc = d.dem("soDongDoDuoc");
    const lech = d.dem("soDongLechCaoTren");
    const doPhu = d.phanVan("doPhuPhanVan");
    const tyLe = d.phanVan("tyLeLechCaoTrenPhanVan");
    d.rang(doPhu >= 5000, `có dữ liệu mà \`doPhuPhanVan\` = ${String(doPhu)} < 5000`);
    d.rang(doDuoc >= 1 && doDuoc <= soDong, "`soDongDoDuoc` phải trong [1, soDong]");
    d.rang(lech <= doDuoc, "`soDongLechCaoTren` vượt `soDongDoDuoc`");
    d.rang(lech > 0 || tyLe === 0, "không dòng lệch cao mà tỷ lệ lệch khác 0");
    return hang("F3", pb, "CO_DU_LIEU", mucTheoNguong(tyLe), doPhu < 10000 ? "THAP" : "VUA", { doPhuPhanVan: doPhu, tyLeLechCaoTrenPhanVan: tyLe });
}
function tinhLaiF5(d, b, pb) {
    d.khoa(["soNccNopCuoi10Phut", "soCap60Giay", "soLanSuaCuaN10Phut", "cap"]);
    const soNcc = d.dem("soNccNopCuoi10Phut");
    const soCap = d.dem("soCap60Giay");
    const soSua = d.dem("soLanSuaCuaN10Phut");
    const cap = b["cap"];
    if (!Array.isArray(cap)) {
        d.rang(false, "`cap` cần một mảng");
    }
    else {
        const da = new Set();
        for (const c of cap) {
            const hopLe = Array.isArray(c) && c.length === 2 && typeof c[0] === "string" && typeof c[1] === "string" && c[0] !== c[1];
            d.rang(hopLe, "mỗi cặp của `cap` là hai chuỗi khác nhau");
            if (!hopLe)
                continue;
            const k = JSON.stringify([...c].sort());
            d.rang(!da.has(k), "`cap` có một cặp lặp lại");
            da.add(k);
        }
        d.rang(cap.length === soCap, `\`soCap60Giay\` = ${String(soCap)} khác số cặp ${String(cap.length)}`);
    }
    const muc = soCap >= 2 ? "DO" : soCap >= 1 || soSua >= 3 ? "VANG" : "XANH";
    return hang("F5", pb, "CO_DU_LIEU", muc, "CAO", { soNccNopCuoi10Phut: soNcc, soCap60Giay: soCap, soLanSuaCuaN10Phut: soSua });
}
function mucF6(d, v, ten, tuVung) {
    if (!Array.isArray(v)) {
        d.rang(false, `\`${ten}\` cần một mảng`);
        return [];
    }
    const ra = [];
    for (const x of v) {
        const o = x;
        const hopLe = o !== null &&
            typeof o === "object" &&
            !Array.isArray(o) &&
            JSON.stringify(Object.keys(o).sort()) === JSON.stringify(["id", "loai"]) &&
            typeof o["loai"] === "string" &&
            typeof o["id"] === "string";
        d.rang(hopLe, `mỗi phần tử của \`${ten}\` là đúng \`{loai, id}\` chuỗi`);
        if (!hopLe)
            continue;
        d.rang(tuVung.includes(o["loai"]), `\`${ten}\` mang loại ngoài từ vựng của F6: ${String(o["loai"])}`);
        ra.push({ loai: o["loai"], id: o["id"] });
    }
    return ra;
}
function tinhLaiF6(d, b, pb) {
    d.khoa(["tinHieu", "ngoaiLe"]);
    const tin = mucF6(d, b["tinHieu"], "tinHieu", [...TIN_HIEU_DO, ...TIN_HIEU_KHAC]);
    const nl = mucF6(d, b["ngoaiLe"], "ngoaiLe", NGOAI_LE_F6);
    const soDo = tin.filter((t) => TIN_HIEU_DO.includes(t.loai)).length;
    const muc = soDo > 0 ? "DO" : tin.length - soDo + nl.length > 0 ? "VANG" : "XANH";
    return hang("F6", pb, "CO_DU_LIEU", muc, "CAO", { soTinHieuDo: soDo, soTinHieuKhac: tin.length - soDo, soNgoaiLe: nl.length });
}
function tinhLaiF7(d, b, pb) {
    if (b["lyDo"] === "TONG_KHONG_DOC_DUOC") {
        d.khoa(["lyDo"]);
        return hang("F7", pb, "KHONG_AP_DUNG", null, null, {});
    }
    if (b["lyDo"] !== undefined)
        d.rang(false, `\`lyDo\` lạ: ${JSON.stringify(b["lyDo"])}`);
    d.khoa(["soDong", "soDongHong", "soDongThieu", "soDongLa"]);
    d.dem("soDong");
    const hong = d.dem("soDongHong");
    const thieu = d.dem("soDongThieu");
    const la = d.dem("soDongLa");
    return hang("F7", pb, "CO_DU_LIEU", hong + thieu + la > 0 ? "DO" : "XANH", "CAO", { soDongHong: hong, soDongThieu: thieu, soDongLa: la });
}
function tinhLaiF9(d, b, pb) {
    const lyDo = b["lyDo"];
    if (lyDo !== undefined) {
        d.khoa(["soBaoGiaTheoDong", "lyDo"]);
        const n = d.dem("soBaoGiaTheoDong");
        if (lyDo === "DUOI_BA_BAO_GIA")
            d.rang(n < 3, "`DUOI_BA_BAO_GIA` mà `soBaoGiaTheoDong` ≥ 3");
        else if (lyDo === "KHONG_CO_GIA_TRI" || lyDo === "DUOI_BA_BAO_GIA_CO_GIA_TRI")
            d.rang(n >= 3, `\`${String(lyDo)}\` mà \`soBaoGiaTheoDong\` < 3`);
        else
            d.rang(lyDo === "N_KHONG_DOC_DUOC_THEO_DONG", `\`lyDo\` lạ: ${JSON.stringify(lyDo)}`);
        return hang("F9", pb, "KHONG_AP_DUNG", null, null, { soBaoGiaTheoDong: n });
    }
    d.khoa(["soBaoGiaTheoDong", "soDong", "soDongTySoTu2", "soDongTySoDen05", "tySoLonNhat", "tyLeGiaTriTySoTu2PhanVan"]);
    const n = d.dem("soBaoGiaTheoDong");
    const soDong = d.dem("soDong");
    const tu2 = d.dem("soDongTySoTu2");
    const den05 = d.dem("soDongTySoDen05");
    const tyLe = d.phanVan("tyLeGiaTriTySoTu2PhanVan");
    const lonNhat = b["tySoLonNhat"];
    d.rang(n >= 3, "có dữ liệu mà `soBaoGiaTheoDong` < 3");
    d.rang(tu2 <= soDong && den05 <= soDong, "số dòng theo tỷ số vượt `soDong`");
    d.rang(tu2 > 0 || tyLe === 0, "không dòng tỷ số từ 2 mà tỷ lệ giá trị khác 0");
    d.rang(lonNhat === null || (typeof lonNhat === "string" && KHUON_TY_SO.test(lonNhat)), "`tySoLonNhat` cần null hay chuỗi hai chữ số lẻ");
    return hang("F9", pb, "CO_DU_LIEU", mucTheoNguong(tyLe), n < 6 ? "THAP" : "VUA", {
        soBaoGiaTheoDong: n,
        soDongTySoTu2: tu2,
        tyLeGiaTriTySoTu2PhanVan: tyLe,
    });
}
function tinhLaiF10(d, pb) {
    d.khoa(["soBaoGiaDocDuoc", "soLoiMoiConSong"]);
    const n = d.dem("soBaoGiaDocDuoc");
    const loiMoi = d.dem("soLoiMoiConSong");
    return hang("F10", pb, "CO_DU_LIEU", n <= 1 ? "DO" : n === 2 ? "VANG" : "XANH", "CAO", { soBaoGiaDocDuoc: n, soLoiMoiConSong: loiMoi });
}
function tinhLaiF11(d, b, pb) {
    if (pb !== PHUONG_PHAP_V2) {
        d.khoa(["soDeXuatTruocDaHuyHayRut"]);
        const n1 = d.dem("soDeXuatTruocDaHuyHayRut");
        return hang("F11", pb, "CO_DU_LIEU", n1 >= 2 ? "DO" : n1 === 1 ? "VANG" : "XANH", "CAO", { soDeXuatTruocDaHuyHayRut: n1 });
    }
    d.khoa(["soDeXuatTruocDaHuyHayRut", "deXuatTruocCoNo"]);
    const n = d.dem("soDeXuatTruocDaHuyHayRut");
    const co = b["deXuatTruocCoNo"];
    d.rang(co === null || typeof co === "boolean", "`deXuatTruocCoNo` cần một boolean hay null");
    d.rang(co !== true || n >= 1, "`deXuatTruocCoNo` = true mà không có đề xuất nào đã huỷ hay rút");
    const muc = n >= 2 || co === true ? "DO" : n === 1 ? "VANG" : "XANH";
    return hang("F11", pb, "CO_DU_LIEU", muc, "CAO", {
        soDeXuatTruocDaHuyHayRut: n,
        deXuatTruocCoNo: co === true ? "true" : co === false ? "false" : null,
    });
}
function tinhLaiF1(d, b, pb) {
    const lyDo = b["lyDo"];
    if (lyDo === "KHONG_CO_CHUOI") {
        d.khoa(["soGoiChuoi", "soGoiCoG", "soNccChung", "nenSoGoiCoG", "nenP10PhanVan", "nenP25PhanVan", "lyDo"]);
        d.dem("soNccChung");
        d.rang(d.dem("soGoiChuoi") === 0 && d.dem("soGoiCoG") === 0, "`KHONG_CO_CHUOI` mà chuỗi khác rỗng");
        return hang("F1", pb, "KHONG_AP_DUNG", null, null, { soGoiChuoi: 0 });
    }
    if (lyDo === "CHUOI_NGAN") {
        d.khoa(["soGoiChuoi", "soGoiCoG", "soNccChung", "nenSoGoiCoG", "nenP10PhanVan", "nenP25PhanVan", "lyDo"]);
        const n = d.dem("soGoiChuoi");
        const coG = d.dem("soGoiCoG");
        const k = d.dem("soNccChung");
        d.rang(coG < SAN_F1, "`CHUOI_NGAN` mà số gói có g đã đủ sàn");
        d.rang(n > 0, "`CHUOI_NGAN` mà chuỗi rỗng — ca ấy là `KHONG_CO_CHUOI`");
        return hang("F1", pb, "CHUA_DU_LICH_SU", null, null, { soGoiChuoi: n, soNccChung: k });
    }
    d.khoa(["soGoiChuoi", "soGoiCoG", "soNccChung", "trungViGPhanVan", "madGPhanVan", "nenSoGoiCoG", "nenP10PhanVan", "nenP25PhanVan"]);
    const n = d.dem("soGoiChuoi");
    const coG = d.dem("soGoiCoG");
    const k = d.dem("soNccChung");
    const trungVi = d.dem("trungViGPhanVan");
    const mad = d.dem("madGPhanVan");
    d.rang(coG >= SAN_F1, "chuỗi có g dưới sàn mà trạng thái là CO_DU_LIEU");
    d.rang(coG <= n, "số gói có g vượt số gói của chuỗi");
    const muc = trungVi < 100 && mad < 50 ? "DO" : trungVi < 200 && mad < 100 ? "VANG" : "XANH";
    const p10 = b["nenP10PhanVan"];
    return hang("F1", pb, "CO_DU_LIEU", muc, tinCayChuoi(coG, SAN_F1), {
        soGoiChuoi: n,
        soGoiCoG: coG,
        soNccChung: k,
        trungViGPhanVan: trungVi,
        madGPhanVan: mad,
        nenP10PhanVan: typeof p10 === "number" ? p10 : null,
    });
}
function tinhLaiF2b(d, b, pb) {
    if (b["lyDo"] === "CHUOI_NGAN") {
        d.khoa(["soGoiChuoi", "soNccChuoi", "lyDo"]);
        const n0 = d.dem("soGoiChuoi");
        const k0 = d.dem("soNccChuoi");
        d.rang(n0 < SAN_F2B, "`CHUOI_NGAN` mà chuỗi đã đủ sàn");
        return hang("F2b", pb, "CHUA_DU_LICH_SU", null, null, { soGoiChuoi: n0, soNccChuoi: k0 });
    }
    d.khoa(["soGoiChuoi", "soNccChuoi", "lechToiDa", "coThangLienNhau"]);
    const n = d.dem("soGoiChuoi");
    const k = d.dem("soNccChuoi");
    const lech = d.dem("lechToiDa");
    const lienNhau = b["coThangLienNhau"];
    d.rang(typeof lienNhau === "boolean", "`coThangLienNhau` cần một boolean");
    d.rang(n >= SAN_F2B, "chuỗi dưới sàn mà trạng thái là CO_DU_LIEU");
    d.rang(k <= n, "số nhà cung cấp của chuỗi vượt số gói");
    const deu = k >= 2 && lech <= 1 && lienNhau === false;
    const muc = deu && n >= 12 ? "DO" : deu ? "VANG" : "XANH";
    return hang("F2b", pb, "CO_DU_LIEU", muc, tinCayChuoi(n, SAN_F2B), { soGoiChuoi: n, soNccChuoi: k, lechToiDa: lech });
}
function tinhLaiF4(d, b, pb) {
    if (b["lyDo"] === "GOI_KHONG_NHOM_HANG") {
        d.khoa(["lyDo"]);
        return hang("F4", pb, "KHONG_AP_DUNG", null, null, {});
    }
    if (b["lyDo"] === "NHOM_IT_GOI") {
        d.khoa(["soGoiNhom", "soGoiNThang", "lyDo"]);
        const m0 = d.dem("soGoiNhom");
        d.rang(m0 < SAN_F4, "`NHOM_IT_GOI` mà nhóm đã đủ sàn");
        return hang("F4", pb, "CHUA_DU_LICH_SU", null, null, { soGoiNhom: m0 });
    }
    d.khoa(["soGoiNhom", "soGoiNThang", "tyPhanPhanVan"]);
    const m = d.dem("soGoiNhom");
    const t = d.dem("soGoiNThang");
    const ty = d.phanVan("tyPhanPhanVan");
    d.rang(m >= SAN_F4, "nhóm dưới sàn mà trạng thái là CO_DU_LIEU");
    d.rang(t <= m, "số gói N thắng vượt mẫu số của nền");
    if (m > 0)
        d.rang(ty === Math.floor((t * 10000) / m), "`tyPhanPhanVan` khác phần vạn của tử số trên mẫu số");
    const muc = t * 100 >= 60 * m ? "DO" : t * 100 >= 40 * m ? "VANG" : "XANH";
    return hang("F4", pb, "CO_DU_LIEU", muc, tinCayChuoi(m, SAN_F4), { soGoiNhom: m, soGoiNThang: t, tyPhanPhanVan: ty });
}
function cacDoiTuong(v) {
    return Array.isArray(v) ? v.map((x) => (x !== null && typeof x === "object" && !Array.isArray(x) ? x : {})) : [];
}
function moiKhoa(v, ra = []) {
    if (Array.isArray(v)) {
        for (const x of v)
            moiKhoa(x, ra);
    }
    else if (v !== null && typeof v === "object") {
        for (const [k, x] of Object.entries(v)) {
            ra.push(k);
            moiKhoa(x, ra);
        }
    }
    return ra;
}
const KHOA_TIEN_THUONG = new Set(KHOA_TIEN_DAC_TA.map((k) => k.toLowerCase()));
function tinhLaiHang(y, doPhu, noi, pb) {
    const d = new DocBangChung(y.bangChung, noi);
    for (const k of [...moiKhoa(y.bangChung), ...moiKhoa(y.giaiThichThamSo)]) {
        d.rang(!KHOA_TIEN_THUONG.has(k.toLowerCase()), `bằng chứng hay tham số mang khoá tiền \`${k}\` (L26)`);
    }
    for (const v of Object.values(y.giaiThichThamSo))
        d.rang(v === null || typeof v !== "object", "tham số giải thích phải phẳng");
    let kq;
    if (maChuaCai(pb).includes(y.ma)) {
        d.khoa([]);
        return { kq: d.loi.length === 0 ? hang(y.ma, pb, "CHUA_CAI", null, null, {}) : null, loi: d.loi };
    }
    switch (y.ma) {
        case "F1":
            kq = tinhLaiF1(d, y.bangChung, pb);
            break;
        case "F2b":
            kq = tinhLaiF2b(d, y.bangChung, pb);
            break;
        case "F4":
            kq = tinhLaiF4(d, y.bangChung, pb);
            break;
        case "F3":
            kq = tinhLaiF3(d, y.bangChung, pb);
            break;
        case "F5":
            kq = tinhLaiF5(d, y.bangChung, pb);
            break;
        case "F6":
            kq = tinhLaiF6(d, y.bangChung, pb);
            break;
        case "F7":
            kq = tinhLaiF7(d, y.bangChung, pb);
            break;
        case "F9":
            kq = tinhLaiF9(d, y.bangChung, pb);
            break;
        case "F10":
            kq = tinhLaiF10(d, pb);
            break;
        case "F11":
            kq = tinhLaiF11(d, y.bangChung, pb);
            break;
        case "DO_PHU": {
            d.khoa(["doPhuPhanVan"]);
            const v = d.phanVan("doPhuPhanVan");
            d.rang(v === doPhu, `\`doPhuPhanVan\` = ${String(v)} khác \`doPhu\` của đánh giá ${String(doPhu)}`);
            kq = hang("DO_PHU", pb, "CO_DU_LIEU", "DO", "CAO", { doPhuPhanVan: v });
            break;
        }
        default:
            return { kq: null, loi: [`${noi}: mã lạ ${JSON.stringify(y.ma)} (§12.3)`] };
    }
    return { kq: d.loi.length === 0 ? kq : null, loi: d.loi };
}
function tongHopRuiRo(hangs) {
    const mau = CO_LICH_SU_V1.reduce((t, m) => t + (TRONG_SO_V1[m] ?? 0), 0);
    let tu = 0;
    let w = 0;
    let s = 0;
    let coDo = false;
    for (const h of hangs) {
        if (h.ma === "DO_PHU" || h.trangThai !== "CO_DU_LIEU")
            continue;
        if (CO_LICH_SU_V1.includes(h.ma))
            tu += TRONG_SO_V1[h.ma] ?? 0;
        w += h.trongSo;
        s += h.trongSo * (DIEM_MUC[h.muc ?? ""] ?? 0);
        if (h.muc === "DO")
            coDo = true;
    }
    const doPhu = mau === 0 ? 0 : Math.floor((tu * 10000) / mau);
    const diem = w === 0 ? null : Math.floor((2 * s + w) / (2 * w));
    const d = diem ?? 0;
    const muc = tu * 100 < NGUONG_DO_PHU_DAC_TA * mau ? "KHONG_XAC_DINH" : d >= NGUONG_CAO ? "CAO" : d >= NGUONG_VUA || coDo ? "VUA" : "THAP";
    return { diem, doPhu, muc, coNo: coDo || muc === "KHONG_XAC_DINH" };
}
function trongSoMongDoi(dg, loi) {
    const ts = dg.trongSoChinhSach;
    if (ts === null)
        return TRONG_SO_V1;
    const khoa = Object.keys(ts).sort();
    if (JSON.stringify(khoa) !== JSON.stringify([...MA_PHUONG_PHAP_V1].sort())) {
        loi.push(`đánh giá ${dg.awardId}: \`trongSoChinhSach\` mang khoá [${khoa.join(", ")}], cần đúng mười một mã (§12.3)`);
    }
    const ra = {};
    for (const m of MA_PHUONG_PHAP_V1) {
        const v = ts[m];
        if (v === undefined || !KHUON_TRONG_SO.test(v) || Number(v) < (SAN_TRONG_SO_V1[m] ?? 0)) {
            loi.push(`đánh giá ${dg.awardId}: trọng số khai của ${m} = ${JSON.stringify(v ?? null)} không hợp lệ hay dưới sàn (§12.3)`);
            ra[m] = TRONG_SO_V1[m] ?? 0;
        }
        else {
            ra[m] = Number(v);
        }
    }
    return ra;
}
const khoaDv = (d) => {
    if ("id" in d)
        return `${d.loai}|${d.id}`;
    if (d.loai === "GOI_CHUOI")
        return `${d.loai}|${d.bamGoi}`;
    if (d.loai === "NEN")
        return `${d.loai}|${d.moc}`;
    return `${d.loai}|${d.evaluationId}|${d.bidVersionId}${"lineNo" in d ? `|${String(d.lineNo)}` : ""}`;
};
const bangTap = (a, b) => {
    const x = [...new Set(a)].sort();
    const y = [...new Set(b)].sort();
    return JSON.stringify(x) === JSON.stringify(y);
};
function kiemDauVaoChuoi(y, dv, sai) {
    const la = dv.filter((d) => d.loai !== "GOI_CHUOI" && d.loai !== "NEN").map((d) => d.loai);
    if (la.length > 0)
        sai(`mang đầu vào loại ngoài [GOI_CHUOI, NEN]: ${[...new Set(la)].join(", ")}`);
    const soGoi = dv.filter((d) => d.loai === "GOI_CHUOI").length;
    const nen = dv.filter((d) => d.loai === "NEN");
    if (nen.length > 1)
        sai("mang hơn một ảnh chụp nền");
    const n = nen[0];
    const b = y.bangChung;
    const so = (k) => {
        const v = b[k];
        return typeof v === "number" ? v : null;
    };
    if (y.ma === "F2b") {
        if (n !== undefined)
            sai("F2b không đọc ảnh chụp nền");
        if (so("soGoiChuoi") !== soGoi)
            sai(`\`soGoiChuoi\` khác số hàng GOI_CHUOI (${String(soGoi)})`);
        return;
    }
    if (y.ma === "F1") {
        if (so("soGoiChuoi") !== soGoi)
            sai(`\`soGoiChuoi\` khác số hàng GOI_CHUOI (${String(soGoi)})`);
        if (n !== undefined) {
            if (so("nenSoGoiCoG") !== n.soGoiCoG)
                sai("`nenSoGoiCoG` khác số của ảnh chụp nền");
            if (so("nenP10PhanVan") !== n.p10PhanVan)
                sai("`nenP10PhanVan` khác số của ảnh chụp nền");
            if (b["nenP25PhanVan"] !== undefined && so("nenP25PhanVan") !== n.p25PhanVan)
                sai("`nenP25PhanVan` khác số của ảnh chụp nền");
        }
        else if (b["nenSoGoiCoG"] !== undefined && b["nenSoGoiCoG"] !== null) {
            sai("bằng chứng nhắc nền mà không ghim ảnh chụp nền nào");
        }
        return;
    }
    if (b["lyDo"] === "GOI_KHONG_NHOM_HANG") {
        if (soGoi > 0 || n !== undefined)
            sai("gói không nhóm hàng mà vẫn ghim chuỗi hay nền");
        return;
    }
    if (so("soGoiNThang") !== soGoi)
        sai(`\`soGoiNThang\` khác số hàng GOI_CHUOI (${String(soGoi)})`);
    if (n === undefined)
        sai("F4 cần ảnh chụp nền làm mẫu số");
    else if (so("soGoiNhom") !== n.soGoiCoNguoiThang)
        sai("`soGoiNhom` khác số gói có người thắng của ảnh chụp nền");
}
function kiemDauVao(bo, dg, y, loi) {
    const noi = `đánh giá ${dg.awardId} — ${y.ma}`;
    const sai = (s) => {
        loi.push(`${noi}: ${s} (§12.6)`);
    };
    const dv = y.dauVao;
    const cua = (loai) => dv.filter((d) => d.loai === loai);
    const cuaId = (loai) => dv.flatMap((d) => (d.loai === loai && "id" in d ? [d.id] : []));
    const chiLoai = (tap) => {
        const la = dv.filter((d) => !tap.includes(d.loai)).map((d) => d.loai);
        if (la.length > 0)
            sai(`mang đầu vào loại ngoài [${tap.join(", ")}]: ${[...new Set(la)].join(", ")}`);
    };
    if (new Set(dv.map(khoaDv)).size !== dv.length)
        sai("một đầu vào lặp lại");
    const L = dg.evaluationId;
    const N = dg.bidVersionId;
    const M = dg.mocDeXuat;
    const b = y.bangChung;
    const luot = bo.luotCham.find((l) => l.evaluationId === L);
    const qt = bo.quanTri;
    const dongChamDungMot = () => {
        const dc = cua("DONG_CHAM");
        if (dc.length !== 1 || dc[0].evaluationId !== L || dc[0].bidVersionId !== N)
            sai("cần đúng một DONG_CHAM là (lượt chấm, báo giá) của đề xuất");
    };
    switch (y.ma) {
        case "F1":
        case "F2b":
        case "F4":
            if (dg.phienBanPhuongPhap !== PHUONG_PHAP_V2) {
                if (dv.length > 0)
                    sai(`hàng này không có đầu vào ở ${dg.phienBanPhuongPhap}`);
                return;
            }
            kiemDauVaoChuoi(y, dv, sai);
            return;
        case "F8":
        case "DO_PHU":
            if (dv.length > 0)
                sai("hàng này không có đầu vào");
            return;
        case "F3": {
            chiLoai(["DONG_CHAM", "NHAN_BENCHMARK"]);
            dongChamDungMot();
            const nhan = cua("NHAN_BENCHMARK");
            if (nhan.some((n) => n.evaluationId !== L || n.bidVersionId !== N))
                sai("một nhãn ghim không thuộc (lượt chấm, báo giá) của đề xuất");
            const lopL = bo.duLieuNen?.luotCham.find((l) => l.evaluationId === L);
            const chuaCauHinh = b["lyDo"] === "CHUA_CAU_HINH";
            if (chuaCauHinh !== (lopL === undefined)) {
                sai(chuaCauHinh ? "`CHUA_CAU_HINH` mà lớp dữ liệu nền mang lượt chấm của đề xuất" : "lớp dữ liệu nền không mang lượt chấm của đề xuất mà `lyDo` khác `CHUA_CAU_HINH`");
            }
            if (chuaCauHinh && nhan.length > 0)
                sai("`CHUA_CAU_HINH` mà có nhãn ghim");
            if (lopL !== undefined) {
                const dongN = lopL.dong.filter((x) => x.bidVersionId === N);
                if (!bangTap(nhan.map((n) => String(n.lineNo)), dongN.map((x) => String(x.lineNo)))) {
                    sai("tập dòng của nhãn ghim khác tập dòng của báo giá ở lớp dữ liệu nền");
                }
                const doDuoc = dongN.filter((x) => NHAN_DO_DUOC.includes(x.nhan)).length;
                const lechTren = dongN.filter((x) => x.nhan === "LECH_CAO" && x.chieu === "TREN").length;
                if (typeof b["soDongDoDuoc"] === "number" && b["soDongDoDuoc"] > doDuoc)
                    sai(`\`soDongDoDuoc\` vượt số nhãn đo được (${String(doDuoc)})`);
                if (typeof b["soDongLechCaoTren"] === "number" && b["soDongLechCaoTren"] > lechTren) {
                    sai(`\`soDongLechCaoTren\` vượt số nhãn lệch cao chiều trên (${String(lechTren)})`);
                }
            }
            return;
        }
        case "F5": {
            chiLoai(["PHIEN_BAN_BAO_GIA"]);
            if (!cuaId("PHIEN_BAN_BAO_GIA").includes(N))
                sai("báo giá được đề xuất không nằm trong các phiên bản ghim");
            const moi = new Set(qt.loiMoi.map((i) => i.id));
            const cap = Array.isArray(b["cap"]) ? b["cap"] : [];
            for (const c of cap) {
                for (const id of Array.isArray(c) ? c : [])
                    if (typeof id !== "string" || !moi.has(id))
                        sai(`\`cap\` nhắc ${String(id)} — không là lời mời của lớp quản trị`);
            }
            return;
        }
        case "F6": {
            chiLoai(["TIN_HIEU", "NGOAI_LE"]);
            const tinBc = cacDoiTuong(b["tinHieu"]);
            const nlBc = cacDoiTuong(b["ngoaiLe"]);
            const tinGhim = cuaId("TIN_HIEU");
            if (!bangTap(tinGhim, tinBc.map((t) => String(t["id"]))))
                sai("tập tín hiệu ghim khác tập tín hiệu của bằng chứng");
            for (const t of tinBc) {
                const q = qt.tinHieu.find((x) => x.id === t["id"]);
                if (q === undefined) {
                    sai(`tín hiệu ${String(t["id"])} không có ở lớp quản trị`);
                    continue;
                }
                if (q.loai !== t["loai"])
                    sai(`tín hiệu ${q.id}: loại ${String(t["loai"])} khác lớp quản trị (${q.loai})`);
                if (q.createdAt > M)
                    sai(`tín hiệu ${q.id} ghi sau mốc đề xuất`);
                if (q.loai === "ESTIMATE_UNDERSTATED" && q.truong["award"] !== dg.awardId)
                    sai(`tín hiệu khai thấp ${q.id} trỏ đề xuất khác`);
            }
            const songTaiM = qt.ngoaiLe
                .filter((e) => e.hanhDong === "LAP" &&
                e.loai !== null &&
                NGOAI_LE_F6.includes(e.loai) &&
                e.createdAt <= M &&
                !qt.ngoaiLe.some((r) => r.hanhDong === "RUT" && r.ngoaiLeId === e.id && r.createdAt <= M))
                .map((e) => e.id);
            const nlGhim = cuaId("NGOAI_LE");
            if (!bangTap(nlGhim, nlBc.map((n) => String(n["id"]))))
                sai("tập ngoại lệ ghim khác tập ngoại lệ của bằng chứng");
            if (!bangTap(nlGhim, songTaiM))
                sai("tập ngoại lệ ghim khác tập ngoại lệ còn sống tại mốc đề xuất ở lớp quản trị");
            for (const n of nlBc) {
                const q = qt.ngoaiLe.find((x) => x.id === n["id"]);
                if (q !== undefined && q.loai !== n["loai"])
                    sai(`ngoại lệ ${q.id}: loại ${String(n["loai"])} khác lớp quản trị (${String(q.loai)})`);
            }
            return;
        }
        case "F7":
            chiLoai(["DONG_CHAM"]);
            dongChamDungMot();
            return;
        case "F9": {
            chiLoai(["DONG_CHAM"]);
            const dc = cua("DONG_CHAM");
            if (dc.some((x) => x.evaluationId !== L) || luot === undefined || !bangTap(dc.map((x) => x.bidVersionId), luot.hang.map((h) => h.bidVersionId))) {
                sai("tập dòng chấm ghim khác mọi hàng của lượt chấm");
            }
            if (typeof b["soBaoGiaTheoDong"] === "number" && b["soBaoGiaTheoDong"] > dc.length)
                sai("`soBaoGiaTheoDong` vượt số báo giá của lượt chấm");
            return;
        }
        case "F10": {
            chiLoai(["DONG_CHAM", "LOI_MOI"]);
            const dc = cua("DONG_CHAM");
            const docDuoc = luot?.hang.filter((h) => h.effectiveCost !== null).map((h) => h.bidVersionId);
            if (dc.some((x) => x.evaluationId !== L) || docDuoc === undefined || !bangTap(dc.map((x) => x.bidVersionId), docDuoc)) {
                sai("tập dòng chấm ghim khác các hàng đọc được giá của lượt chấm");
            }
            if (b["soBaoGiaDocDuoc"] !== dc.length)
                sai(`\`soBaoGiaDocDuoc\` khác số dòng chấm ghim (${String(dc.length)})`);
            const lm = cuaId("LOI_MOI");
            const moi = new Set(qt.loiMoi.map((i) => i.id));
            if (lm.some((x) => !moi.has(x)))
                sai("một lời mời ghim không có ở lớp quản trị");
            if (b["soLoiMoiConSong"] !== lm.length)
                sai(`\`soLoiMoiConSong\` khác số lời mời ghim (${String(lm.length)})`);
            return;
        }
        case "F11": {
            chiLoai(["TRAO_THAU"]);
            const tt = cuaId("TRAO_THAU");
            const truoc = qt.traoThau.filter((t) => t.awardId !== dg.awardId && t.actedAt <= M);
            if (!bangTap(tt, truoc.map((t) => t.awardId)))
                sai("tập hàng trao thầu ghim khác mọi hàng trước mốc đề xuất ở lớp quản trị");
            const huyRut = truoc.filter((t) => t.status === "CANCELLED" || t.status === "WITHDRAWN").length;
            if (b["soDeXuatTruocDaHuyHayRut"] !== huyRut)
                sai(`\`soDeXuatTruocDaHuyHayRut\` khác số hàng huỷ hay rút trước mốc (${String(huyRut)})`);
            return;
        }
        default:
            return;
    }
}
function kiemChuKy(bo, dg, coNo, loi) {
    const noi = `đánh giá ${dg.awardId}`;
    const qt = bo.quanTri;
    const p = qt.traoThau.find((t) => t.awardId === dg.awardId);
    const C = p?.chuKy ?? [];
    for (const g of dg.giaiTrinh) {
        if (!C.some((c) => c.approverUserId === g.nguoi && c.approvedAt === g.luc)) {
            loi.push(`${noi}: giải trình của ${g.nguoi} lúc ${g.luc} không đi cùng chữ ký nào của người ấy (§12.7)`);
        }
    }
    const moiGhiNhan = dg.yeuTo.flatMap((y) => y.ghiNhan.map((k) => ({ y, k })));
    for (const { y } of moiGhiNhan) {
        if (y.muc !== "DO")
            loi.push(`${noi}: ghi nhận trên hàng ${y.ma} không phải hàng đỏ (§12.7)`);
    }
    if (!coNo)
        return 0;
    for (const c of C) {
        const n = dg.giaiTrinh.filter((g) => g.nguoi === c.approverUserId && g.luc === c.approvedAt).length;
        if (n !== 1)
            loi.push(`${noi}: chữ ký của ${c.approverUserId} lúc ${c.approvedAt} có ${String(n)} giải trình cùng mốc — cần đúng một (§12.7 vế 1)`);
        if (moiGhiNhan.some(({ k }) => k.nguoi === c.approverUserId))
            loi.push(`${noi}: người ký ${c.approverUserId} đã ghi nhận một hàng đỏ (§12.7 vế 2)`);
    }
    if (C.length === 0)
        return 0;
    const T = new Set([
        p?.actedBy,
        ...qt.traoThau.filter((t) => t.actedAt <= dg.mocDeXuat).map((t) => t.actedBy),
        qt.goi.nguoiTao,
        qt.goi.nguoiNop,
        qt.nganSach?.createdBy,
        qt.chinhSachNganSach?.createdBy,
    ].filter((x) => typeof x === "string"));
    for (const y of dg.yeuTo.filter((x) => x.muc === "DO")) {
        if (y.ghiNhan.some((k) => !T.has(k.nguoi)))
            continue;
        if (y.ma === "F6") {
            const tinDo = cacDoiTuong(y.bangChung["tinHieu"]).filter((t) => TIN_HIEU_DO.includes(String(t["loai"])));
            const quaK10 = tinDo.length > 0 &&
                tinDo.every((t) => {
                    const goc = qt.tinHieu.find((x) => x.id === t["id"]);
                    if (goc === undefined)
                        return false;
                    const truong = JSON.stringify(jsonChuanHoa(goc.truong));
                    return qt.tinHieu.some((x) => x.loai === goc.loai && JSON.stringify(jsonChuanHoa(x.truong)) === truong && x.ghiNhan.some((k) => !T.has(k.createdBy)));
                });
            if (quaK10)
                continue;
        }
        loi.push(`${noi}: hàng đỏ ${y.ma} không có ghi nhận của người ngoài tập loại trừ mà bộ thấy, dù đề xuất đã có ${String(C.length)} chữ ký (§12.7 vế 3)`);
    }
    return C.length;
}
function jsonChuanHoa(v) {
    if (Array.isArray(v))
        return v.map(jsonChuanHoa);
    if (v !== null && typeof v === "object") {
        const o = v;
        return Object.fromEntries(Object.keys(o)
            .sort()
            .map((k) => [k, jsonChuanHoa(o[k])]));
    }
    return v;
}
function tinhLaiRuiRo(bo) {
    const loi = [];
    const canhBao = [];
    const danhGia = [];
    let soChuKy = 0;
    const daGap = new Set();
    for (const dg of bo.ruiRo.danhGia) {
        const noi = `đánh giá ${dg.awardId}`;
        if (daGap.has(dg.awardId))
            loi.push(`${noi}: hai đánh giá cho cùng một đề xuất (§12.8)`);
        daGap.add(dg.awardId);
        if (!PHUONG_PHAP_CAI.includes(dg.phienBanPhuongPhap)) {
            loi.push(`${noi}: phương pháp ${dg.phienBanPhuongPhap} — bộ kiểm này chỉ cài ${PHUONG_PHAP_CAI.join(", ")} (§12.2)`);
            continue;
        }
        const tt = bo.traoThau.find((t) => t.awardId === dg.awardId);
        if (tt === undefined || tt.status !== "PROPOSED")
            loi.push(`${noi}: không là một đề xuất PROPOSED của \`traoThau\` (§12.8)`);
        else if (tt.evaluationId !== dg.evaluationId || tt.bidVersionId !== dg.bidVersionId)
            loi.push(`${noi}: lượt chấm hay báo giá khác của đề xuất (§12.8)`);
        const p = bo.quanTri.traoThau.find((t) => t.awardId === dg.awardId);
        if (p === undefined) {
            loi.push(`${noi}: đề xuất không có ở lớp quản trị (§12.8)`);
        }
        else {
            if (p.actedBy !== dg.nguoiLap)
                loi.push(`${noi}: người lập ${dg.nguoiLap} khác người đề xuất ${p.actedBy} (§12.8)`);
            if (p.actedAt !== dg.mocDeXuat || dg.lapLuc !== dg.mocDeXuat) {
                loi.push(`${noi}: mốc đề xuất ${dg.mocDeXuat}, lúc lập ${dg.lapLuc} và mốc của đề xuất ở lớp quản trị ${p.actedAt} phải bằng nhau (§12.8)`);
            }
        }
        const luot = bo.luotCham.find((l) => l.evaluationId === dg.evaluationId);
        if (luot !== undefined && dg.policyId !== luot.policyId) {
            canhBao.push(`${noi}: phiên bản chính sách ghim ${String(dg.policyId)} khác phiên bản của lượt chấm ${luot.policyId} (§12.10)`);
        }
        const ma = dg.yeuTo.map((y) => y.ma);
        const canMa = [...MA_PHUONG_PHAP_V1, ...(dg.muc === "KHONG_XAC_DINH" ? ["DO_PHU"] : [])];
        if (!(ma.length === canMa.length && bangTap(ma, canMa)))
            loi.push(`${noi}: tập hàng [${ma.join(", ")}] khác [${canMa.join(", ")}] (§12.3)`);
        const ts = trongSoMongDoi(dg, loi);
        const tinhLai = new Map();
        let duTinhLai = true;
        for (const y of dg.yeuTo) {
            const noiY = `${noi} — ${y.ma}`;
            if (y.thoiDiem !== dg.mocDeXuat)
                loi.push(`${noiY}: \`thoiDiem\` khác mốc đề xuất (§12.3)`);
            const nguon = MA_CHUA_CAI_V1.includes(y.ma) ? "CHUA_CAI" : NGUON_THEO_MA[y.ma];
            if (y.nguon !== nguon)
                loi.push(`${noiY}: \`nguon\` ${y.nguon} khác ${String(nguon)} (§12.3)`);
            const tsMongDoi = y.ma === "DO_PHU" ? null : (ts[y.ma] ?? null);
            if (y.trongSo !== tsMongDoi)
                loi.push(`${noiY}: trọng số ${String(y.trongSo)} khác ${String(tsMongDoi)} (§12.3)`);
            if ((y.muc === null) !== (y.trangThai !== "CO_DU_LIEU") || (y.doTinCay === null) !== (y.trangThai !== "CO_DU_LIEU")) {
                loi.push(`${noiY}: mức hay độ tin cậy không khớp trạng thái ${y.trangThai} (§12.4)`);
            }
            const { kq, loi: loiHang } = tinhLaiHang(y, dg.doPhu, noiY, dg.phienBanPhuongPhap);
            loi.push(...loiHang);
            if (kq === null)
                duTinhLai = false;
            else
                tinhLai.set(y.ma, kq);
            kiemDauVao(bo, dg, y, loi);
        }
        const theoLuu = dg.yeuTo.map((y) => ({ ma: y.ma, trangThai: y.trangThai, muc: y.muc, trongSo: y.trongSo ?? 0 }));
        const tongHopTrenLuu = tongHopRuiRo(theoLuu);
        const tongHopTrenTinhLai = duTinhLai
            ? tongHopRuiRo(dg.yeuTo.map((y) => {
                const t = tinhLai.get(y.ma);
                return { ma: y.ma, trangThai: t.trangThai, muc: t.muc, trongSo: y.ma === "DO_PHU" ? 0 : (ts[y.ma] ?? 0) };
            }))
            : null;
        danhGia.push({ awardId: dg.awardId, hang: tinhLai, tongHopTrenLuu, tongHopTrenTinhLai });
        soChuKy += kiemChuKy(bo, dg, (tongHopTrenTinhLai ?? tongHopTrenLuu).coNo, loi);
    }
    const mocDau = bo.ruiRo.danhGia.map((d) => d.mocDeXuat).sort()[0];
    const khongDanhGia = bo.quanTri.traoThau.filter((t) => t.status === "PROPOSED" && !daGap.has(t.awardId));
    if (mocDau !== undefined) {
        for (const t of khongDanhGia.filter((x) => x.actedAt >= mocDau)) {
            loi.push(`đề xuất ${t.awardId} ghi từ mốc của đánh giá sớm nhất (${mocDau}) mà không có đánh giá (§12.8)`);
        }
    }
    const soDeXuatKhongDanhGia = khongDanhGia.filter((t) => mocDau === undefined || t.actedAt < mocDau).length;
    return { danhGia, loi, canhBao, soChuKy, soDeXuatKhongDanhGia };
}
return Object.freeze({ PHUONG_PHAP_V1, MA_PHUONG_PHAP_V1, TRONG_SO_V1, SAN_TRONG_SO_V1, CO_LICH_SU_V1, MA_CHUA_CAI_V1, PHUONG_PHAP_V2, MA_CHUA_CAI_V2, PHUONG_PHAP_CAI, NGUONG_DO_PHU_DAC_TA, NGUONG_CAO, NGUONG_VUA, NGUON_THEO_MA, KHOA_TIEN_DAC_TA, KHOA_BANG_CHUNG_THEO_MA, tinhLaiHang, tongHopRuiRo, jsonChuanHoa, tinhLaiRuiRo });
})();

// ---- tools/bo-xuat-danh-gia/src/kiem-rui-ro.ts
const __tp_m17 = (() => {
const { jsonChuanHoa, tinhLaiRuiRo } = __tp_m16;
const bang = (a, b) => JSON.stringify(jsonChuanHoa(a)) === JSON.stringify(jsonChuanHoa(b));
const moTaTongHop = (t) => `diem=${String(t.diem)} doPhu=${String(t.doPhu)} muc=${t.muc} coNo=${String(t.coNo)}`;
function kiemRuiRo(bo) {
    const lai = tinhLaiRuiRo(bo);
    const loi = [...lai.loi];
    let soNo = 0;
    for (const dg of bo.ruiRo.danhGia) {
        const noi = `đánh giá ${dg.awardId}`;
        const t = lai.danhGia.find((x) => x.awardId === dg.awardId);
        if (t === undefined)
            continue;
        const luu = { diem: dg.diem, doPhu: dg.doPhu, muc: dg.muc, coNo: dg.coNo };
        if (!bang(luu, t.tongHopTrenLuu)) {
            loi.push(`HAI LỚP BẤT ĐỒNG: ${noi} — tổng hợp lưu ${moTaTongHop(luu)}, tính lại trên mức đã lưu ${moTaTongHop(t.tongHopTrenLuu)} (§12.5)`);
        }
        if (t.tongHopTrenTinhLai !== null && !bang(luu, t.tongHopTrenTinhLai)) {
            loi.push(`HAI LỚP BẤT ĐỒNG: ${noi} — tổng hợp lưu ${moTaTongHop(luu)}, tính lại trên mức tính lại ${moTaTongHop(t.tongHopTrenTinhLai)} (§12.5)`);
        }
        if ((t.tongHopTrenTinhLai ?? t.tongHopTrenLuu).coNo)
            soNo += 1;
        for (const y of dg.yeuTo) {
            const noiY = `${noi} — ${y.ma}`;
            const h = t.hang.get(y.ma);
            if (h !== undefined) {
                for (const k of ["trangThai", "muc", "doTinCay", "giaiThichMau"]) {
                    if (y[k] !== h[k])
                        loi.push(`HAI LỚP BẤT ĐỒNG: ${noiY} — ${k} lưu ${String(y[k])}, tính lại từ bằng chứng ${String(h[k])} (§12.4)`);
                }
                if (!bang(y.giaiThichThamSo, h.giaiThichThamSo)) {
                    loi.push(`HAI LỚP BẤT ĐỒNG: ${noiY} — tham số giải thích lưu khác tham số tính lại từ bằng chứng (§12.4)`);
                }
            }
            const tl = y.taiLapLucXuat;
            if (y.ma === "DO_PHU") {
                if (tl !== null)
                    loi.push(`${noiY}: hàng DO_PHU mang \`taiLapLucXuat\` (§12.1)`);
                continue;
            }
            if (tl === null) {
                loi.push(`${noiY}: thiếu \`taiLapLucXuat\` — bộ không mang phép tính lại lúc xuất (§12.1)`);
                continue;
            }
            for (const k of ["trangThai", "muc", "doTinCay", "giaiThichMau"]) {
                if (y[k] !== tl[k])
                    loi.push(`TÁI LẬP LÚC XUẤT LỆCH: ${noiY} — ${k} lưu ${String(y[k])}, tính lại trên đầu vào đã ghim ${String(tl[k])} (§12.1)`);
            }
            if (!bang(y.bangChung, tl.bangChung))
                loi.push(`TÁI LẬP LÚC XUẤT LỆCH: ${noiY} — bằng chứng lưu khác bằng chứng tính lại trên đầu vào đã ghim (§12.1)`);
            if (!bang(y.giaiThichThamSo, tl.giaiThichThamSo)) {
                loi.push(`TÁI LẬP LÚC XUẤT LỆCH: ${noiY} — tham số giải thích lưu khác tham số tính lại trên đầu vào đã ghim (§12.1)`);
            }
        }
    }
    return {
        loi,
        canhBao: lai.canhBao,
        soDanhGia: bo.ruiRo.danhGia.length,
        soNo,
        soChuKy: lai.soChuKy,
        soDeXuatKhongDanhGia: lai.soDeXuatKhongDanhGia,
    };
}
return Object.freeze({ kiemRuiRo });
})();

// ---- tools/bo-xuat-danh-gia/src/kiem-goi-y-may.ts
const __tp_m18 = (() => {
function kiemGoiYMay(bo) {
    const lop = bo.goiYMay;
    if (lop === null)
        return null;
    const loi = [];
    const idGoiY = new Set();
    for (const g of lop.goiY) {
        if (idGoiY.has(g.id))
            loi.push(`gợi ý ${g.id} xuất hiện hai lần ở goiYMay.goiY (§13)`);
        idGoiY.add(g.id);
    }
    const idXacNhan = new Set();
    const coXacNhan = new Set();
    for (const x of lop.xacNhan) {
        if (idXacNhan.has(x.id))
            loi.push(`xác nhận ${x.id} xuất hiện hai lần ở goiYMay.xacNhan (§13)`);
        idXacNhan.add(x.id);
        if (!idGoiY.has(x.goiYId))
            loi.push(`xác nhận ${x.id} trỏ gợi ý ${x.goiYId} KHÔNG có trong goiYMay.goiY (§13.1)`);
        coXacNhan.add(x.goiYId);
    }
    for (const t of lop.thamChieu) {
        const nhan = `${t.bang}.${t.cot} của hàng ${t.id}`;
        if (!idGoiY.has(t.goiYId)) {
            loi.push(`tham chiếu ${nhan} trỏ gợi ý ${t.goiYId} KHÔNG có trong goiYMay.goiY (§13.2)`);
            continue;
        }
        if (!coXacNhan.has(t.goiYId))
            loi.push(`tham chiếu ${nhan} trỏ gợi ý ${t.goiYId} mà KHÔNG hàng xác nhận nào — máy quyết thay người (§13.2)`);
    }
    return {
        loi,
        soGoiY: lop.goiY.length,
        soXacNhan: lop.xacNhan.length,
        soThamChieu: lop.thamChieu.length,
        soChuaXacNhan: lop.goiY.filter((g) => !coXacNhan.has(g.id)).length,
    };
}
return Object.freeze({ kiemGoiYMay });
})();

// ---- tools/bo-xuat-danh-gia/src/kiem.ts
const __tp_m19 = (() => {
const { DAC_TA } = __tp_m3; const { laTuChoi, tinhChiPhiHieuDung } = __tp_m4;
const { khongTinhDuoc, tinhLai, xepHangLai } = __tp_m5;
const { HAM_THUAN_BENCHMARK_THAT, kiemDuLieuNen } = __tp_m9;
const { QUY_DOI_THAT, kiemCamKet, kiemQuyDoiHang, kiemTapMa, soQuyDoi } = __tp_m13;
const { kiemQuanTri } = __tp_m15;
const { kiemRuiRo } = __tp_m17;
const { kiemGoiYMay } = __tp_m18;
const SHA_DAC_TA_CU = { 10: "97153b067f7ccde87d5bd85343350306c184fbdb8f9d5b9a711bd662571e20d4" };
const HAM_THUAN_THAT = (chinhSach, dauVao) => {
    const cs = [];
    for (const c of chinhSach) {
        if (c.don_vi !== "TIEN" && c.don_vi !== "DIEM")
            return { lyDo: "DON_VI_LA", ma: c.ma };
        cs.push({ ma: c.ma, donVi: c.don_vi, heSo: c.he_so });
    }
    const kq = tinhChiPhiHieuDung(cs, [...dauVao]);
    if (laTuChoi(kq))
        return { lyDo: kq.lyDo, ma: kq.ma };
    return {
        effectiveCost: kq.effectiveCost,
        components: kq.components.map((c) => ({ ma: c.ma, donVi: c.donVi, tien: c.tien })),
    };
};
function dauVaoCuaHang(hang) {
    const ra = [];
    for (const c of hang.components) {
        if (c.giaTri === undefined)
            return null;
        ra.push({ ma: c.ma, giaTri: c.giaTri });
    }
    return ra;
}
function soSanhKetQua(nhan, kq, hang) {
    if (khongTinhDuoc(kq)) {
        return [`${nhan}: không tính lại được (${kq.lyDo}${kq.ma === undefined ? "" : ` tại "${kq.ma}"`})`];
    }
    const noi = [];
    if (kq.effectiveCost !== hang.effectiveCost) {
        noi.push(`${nhan}: effectiveCost đã lưu ${String(hang.effectiveCost)}, tính lại ra ${kq.effectiveCost}`);
    }
    const luu = new Map(hang.components.map((c) => [c.ma, c.tien]));
    for (const c of kq.components) {
        if (!luu.has(c.ma)) {
            noi.push(`${nhan}: chính sách khai thành phần "${c.ma}" mà hàng không có`);
            continue;
        }
        const t = luu.get(c.ma) ?? null;
        if (t !== c.tien) {
            noi.push(`${nhan}: thành phần "${c.ma}" đã lưu ${String(t)}, tính lại ra ${String(c.tien)}`);
        }
    }
    for (const ma of luu.keys()) {
        if (!kq.components.some((c) => c.ma === ma)) {
            noi.push(`${nhan}: hàng mang thành phần "${ma}" mà chính sách không khai`);
        }
    }
    return noi;
}
function kiemMotHang(bo, luot, hang, hamThuan, hamThuanQuyDoi) {
    const chung = { evaluationId: luot.evaluationId, bidVersionId: hang.bidVersionId };
    const quyDoi = kiemQuyDoiHang(bo.goiTco, hang, hamThuanQuyDoi);
    if (quyDoi.length > 0)
        return { ...chung, ketLuan: "LECH", noi: quyDoi };
    const dauVao = dauVaoCuaHang(hang);
    if (dauVao === null || hang.effectiveCost === null) {
        return {
            ...chung,
            ketLuan: "KHONG_TAI_LAP_DUOC",
            noi: [
                dauVao === null
                    ? "một thành phần thiếu `giaTri` — `057` không cưỡng chế trường ấy, nên hàng này hợp lệ với CSDL mà không tái lập được"
                    : "hàng không khai `effectiveCost` — bundle nói báo giá này không có số tiền đọc được, và đó là một mệnh đề bộ kiểm KHÔNG xác nhận cũng KHÔNG bác được từ bundle; `057` cho phép hình dạng ấy, nên nó được đếm riêng chứ không được đếm là ĐẠT",
            ],
        };
    }
    const docLap = soSanhKetQua("lớp độc lập", tinhLai(luot.chinhSachThanhPhan, dauVao), hang);
    const thuan = soSanhKetQua("lớp hàm thuần", hamThuan(luot.chinhSachThanhPhan, dauVao), hang);
    const noi = [...docLap, ...thuan];
    if (docLap.length === 0 && thuan.length > 0) {
        noi.push("HAI LỚP BẤT ĐỒNG: lớp độc lập nói ĐẠT, lớp hàm thuần nói LỆCH — một trong hai bản cài đang sai");
    }
    if (docLap.length > 0 && thuan.length === 0) {
        noi.push("HAI LỚP BẤT ĐỒNG: lớp hàm thuần nói ĐẠT, lớp độc lập nói LỆCH — đây là hình dạng của một lỗi NẰM TRONG `chiPhiHieuDung` (ADR-059)");
    }
    return { ...chung, ketLuan: noi.length === 0 ? "DAT" : "LECH", noi };
}
function kiemThuHang(luot) {
    const tinh = xepHangLai(luot.hang.map((h) => h.effectiveCost));
    const noi = [];
    luot.hang.forEach((h, i) => {
        const t = tinh[i] ?? null;
        if (t !== h.rank) {
            noi.push(`lượt chấm ${luot.evaluationId}: hàng ${h.bidVersionId} đã lưu hạng ${String(h.rank)}, tính lại ra ${String(t)}`);
        }
    });
    return noi;
}
function kiemBo(bo, dacTaDiKem, hamThuan = HAM_THUAN_THAT, hamThuanBenchmark = HAM_THUAN_BENCHMARK_THAT, hamThuanQuyDoi = QUY_DOI_THAT, bamDacTaDiKem = null) {
    const loiBo = [];
    const dacTaCuKhop = bo.goiYMay === null && bamDacTaDiKem !== null && SHA_DAC_TA_CU[bo.phienBan] === bamDacTaDiKem;
    if (dacTaDiKem !== DAC_TA && !dacTaCuKhop) {
        loiBo.push(`${"DAC-TA.md"} đi kèm KHÁC đặc tả bộ kiểm này cài — kết luận dưới đây không áp cho bundle này`);
    }
    const hang = [];
    let soQuyDoiDaKiem = 0;
    for (const luot of bo.luotCham) {
        for (const h of luot.hang) {
            hang.push(kiemMotHang(bo, luot, h, hamThuan, hamThuanQuyDoi));
            soQuyDoiDaKiem += soQuyDoi(h);
        }
        loiBo.push(...kiemThuHang(luot));
        loiBo.push(...kiemTapMa(bo.goiTco, luot));
    }
    const hangTraoThau = [];
    for (const t of bo.traoThau) {
        const luot = bo.luotCham.find((l) => l.evaluationId === t.evaluationId);
        if (luot === undefined) {
            loiBo.push(`trao thầu ${t.awardId} trỏ lượt chấm ${t.evaluationId} KHÔNG có trong bundle`);
            continue;
        }
        const h = luot.hang.find((x) => x.bidVersionId === t.bidVersionId);
        if (h === undefined) {
            loiBo.push(`trao thầu ${t.awardId} trỏ báo giá ${t.bidVersionId} không có trong bảng xếp hạng của lượt chấm ấy`);
            continue;
        }
        hangTraoThau.push({ awardId: t.awardId, rank: h.rank });
    }
    const soDat = hang.filter((h) => h.ketLuan === "DAT").length;
    const soLech = hang.filter((h) => h.ketLuan === "LECH").length;
    const soKhongTaiLapDuoc = hang.filter((h) => h.ketLuan === "KHONG_TAI_LAP_DUOC").length;
    if (soDat === 0) {
        loiBo.push(`KHÔNG một hàng nào tái lập được (${String(hang.length)} hàng) — một lượt kiểm không đo được gì thì không ĐẠT`);
    }
    const duLieuNen = kiemDuLieuNen(bo, hamThuanBenchmark);
    const duLieuNenDat = duLieuNen === null || (duLieuNen.loi.length === 0 && duLieuNen.soLech === 0 && duLieuNen.soDong > 0);
    const camKet = kiemCamKet(bo, hamThuanQuyDoi);
    const quanTri = kiemQuanTri(bo);
    const ruiRo = kiemRuiRo(bo);
    const goiYMay = kiemGoiYMay(bo);
    return {
        dat: loiBo.length === 0 &&
            soLech === 0 &&
            soDat > 0 &&
            duLieuNenDat &&
            camKet.loi.length === 0 &&
            quanTri.loi.length === 0 &&
            ruiRo.loi.length === 0 &&
            (goiYMay === null || goiYMay.loi.length === 0),
        soHang: hang.length,
        soDat,
        soLech,
        soKhongTaiLapDuoc,
        hang,
        loiBo,
        hangTraoThau,
        duLieuNen,
        soQuyDoi: soQuyDoiDaKiem,
        camKet,
        quanTri,
        ruiRo,
        goiYMay,
    };
}
return Object.freeze({ SHA_DAC_TA_CU, HAM_THUAN_THAT, kiemBo });
})();

// ---- tools/bo-xuat-danh-gia/src/kiem-thu-muc.ts
const __tp_m20 = (() => {
const { createHash } = __tp_node_crypto;
const { readFile } = __tp_node_fs_promises;
const { join } = __tp_node_path;
const { TEP_DAC_TA, TEP_DU_LIEU, docBo } = __tp_m1;
const { kiemBo } = __tp_m19;
function bam(vanBan) {
    return createHash("sha256").update(Buffer.from(vanBan, "utf8")).digest("hex");
}
async function kiemThuMuc(thuMuc, ra, loi) {
    const raw = JSON.parse(await readFile(join(thuMuc, TEP_DU_LIEU), "utf8"));
    const bo = docBo(raw);
    const dacTa = await readFile(join(thuMuc, TEP_DAC_TA), "utf8");
    const bamDiKem = bam(dacTa);
    if (bamDiKem !== bo.dacTaSha256) {
        loi(`${TEP_DAC_TA} bam ra ${bamDiKem}, bundle khai ${bo.dacTaSha256} — dac ta di kem da bi doi.\n`);
        return 1;
    }
    const kq = kiemBo(bo, dacTa, undefined, undefined, undefined, bamDiKem);
    for (const d of kq.loiBo)
        ra(`LOI\t${d}\n`);
    for (const h of kq.hang) {
        if (h.ketLuan === "DAT")
            continue;
        for (const d of h.noi)
            ra(`${h.ketLuan}\t${h.bidVersionId}\t${d}\n`);
    }
    for (const t of kq.hangTraoThau) {
        ra(`trao-thau\t${t.awardId}\thang=${t.rank === null ? "khong-co" : String(t.rank)}\n`);
    }
    if (kq.duLieuNen !== null) {
        for (const d of kq.duLieuNen.loi)
            ra(`LOI-BENCHMARK\t${d}\n`);
        for (const d of kq.duLieuNen.dong)
            for (const n of d.noi)
                ra(`LECH-BENCHMARK\t${d.bidVersionId}\t${n}\n`);
        ra(`benchmark\tdong=${String(kq.duLieuNen.soDong)}\tdat=${String(kq.duLieuNen.soDat)}\tlech=${String(kq.duLieuNen.soLech)}\n`);
        ra(`anh-xa-hoi-to\tso=${String(kq.duLieuNen.soAnhXaHoiTo)}\tkhong-phan-duoc=${String(kq.duLieuNen.soKhongPhanDuoc)}\n`);
    }
    for (const d of kq.camKet.loi)
        ra(`LECH-CAM-KET\t${d}\n`);
    ra(`cam-ket\tso=${String(kq.camKet.soCamKet)}\tdat=${String(kq.camKet.soDat)}` +
        `\tde-xuat-khong-cam-ket=${String(kq.camKet.soDeXuatKhongCamKet)}\tquy-doi=${String(kq.soQuyDoi)}\n`);
    for (const d of kq.quanTri.loi)
        ra(`LOI-QUAN-TRI\t${d}\n`);
    for (const d of kq.quanTri.canhBao)
        ra(`CANH-BAO-QUAN-TRI\t${d}\n`);
    ra(`quan-tri\tche-do=${kq.quanTri.cheDo}\tky-mo-goi=${kq.quanTri.soNguoiKyMoGoi === null ? "chua-mo" : String(kq.quanTri.soNguoiKyMoGoi)}` +
        `\ttrao-thau-duyet=${String(kq.quanTri.soTraoThauDuyet)}\tloi=${String(kq.quanTri.loi.length)}\tcanh-bao=${String(kq.quanTri.canhBao.length)}\n`);
    for (const d of kq.ruiRo.loi)
        ra(`LOI-RUI-RO\t${d}\n`);
    for (const d of kq.ruiRo.canhBao)
        ra(`CANH-BAO-RUI-RO\t${d}\n`);
    ra(`rui-ro\tdanh-gia=${String(kq.ruiRo.soDanhGia)}\tno=${String(kq.ruiRo.soNo)}\tchu-ky=${String(kq.ruiRo.soChuKy)}` +
        `\tde-xuat-khong-danh-gia=${String(kq.ruiRo.soDeXuatKhongDanhGia)}\tloi=${String(kq.ruiRo.loi.length)}\tcanh-bao=${String(kq.ruiRo.canhBao.length)}\n`);
    if (kq.goiYMay !== null) {
        for (const d of kq.goiYMay.loi)
            ra(`LOI-GOI-Y-MAY\t${d}\n`);
        ra(`goi-y-may\tgoi-y=${String(kq.goiYMay.soGoiY)}\txac-nhan=${String(kq.goiYMay.soXacNhan)}\ttham-chieu=${String(kq.goiYMay.soThamChieu)}` +
            `\tchua-xac-nhan=${String(kq.goiYMay.soChuaXacNhan)}\tloi=${String(kq.goiYMay.loi.length)}\n`);
    }
    ra(`${kq.dat ? "ok=true" : "ok=false"}` +
        `\thang=${String(kq.soHang)}\tdat=${String(kq.soDat)}\tlech=${String(kq.soLech)}` +
        `\tkhong-tai-lap-duoc=${String(kq.soKhongTaiLapDuoc)}\n`);
    return kq.dat ? 0 : 1;
}
return Object.freeze({ kiemThuMuc });
})();

// ---- tools/bo-xuat-danh-gia/src/tham-so.ts
const __tp_m21 = (() => {
function docCo(thamSo, can, tuyChon = []) {
    const duoc = [...can, ...tuyChon];
    const ra = new Map();
    for (let i = 0; i < thamSo.length; i += 1) {
        const co = thamSo[i];
        if (co === undefined || !co.startsWith("--"))
            throw new Error(`Tham số lạ: "${String(co)}".`);
        const ten = co.slice(2);
        if (!duoc.includes(ten))
            throw new Error(`Cờ lạ: "${co}". Cần: ${duoc.map((c) => `--${c}`).join(" ")}.`);
        if (ra.has(ten))
            throw new Error(`--${ten} nêu nhiều lần.`);
        const gt = thamSo[i + 1];
        if (gt === undefined || gt.startsWith("--"))
            throw new Error(`--${ten} cần một giá trị.`);
        ra.set(ten, gt);
        i += 1;
    }
    for (const c of can)
        if (!ra.has(c))
            throw new Error(`Thiếu --${c}.`);
    return ra;
}
return Object.freeze({ docCo });
})();

// ---- tools/bo-xuat-danh-gia/src/mot-tep/kiem-bang-chung.ts
const __tp_m22 = (() => {
const { readFile } = __tp_node_fs_promises;
const { argv, exit, stderr, stdout } = __tp_node_process;
const { TEP_DAC_TA, TEP_DU_LIEU } = __tp_m1;
const { docChuKy, docKhoaDaDan, kiemBienNhanBangKhoa } = __tp_m2;
const { kiemThuMuc } = __tp_m20;
const { docCo } = __tp_m21;
const CACH_DUNG = `Cách dùng (node trần, không cần kho, không mạng):
  node kiem-bang-chung.mjs <thu-muc-bo>
  node kiem-bang-chung.mjs kiem --bo <thu-muc-bo>
  node kiem-bang-chung.mjs bien-nhan --van-ban <tep> --chu-ky <tep> --khoa <JSON-hoac-tep> [--dau-van-tay <hex>]

<thu-muc-bo> chứa ${TEP_DU_LIEU} và ${TEP_DAC_TA} của một bộ bằng chứng. Kết quả giống hệt "pnpm bang-chung kiem": dòng cuối ok=true
hoặc ok=false; mã thoát 0 khi đạt, 1 khi không (stderr thêm dòng FAIL).

bien-nhan: --van-ban là văn bản chính tắc của biên nhận (đúng byte), --chu-ky là chữ ký (tệp DER hoặc văn bản base64), --khoa là
nội dung JSON lấy từ /.well-known/trustprocure-receipt-keys (dán thẳng, hoặc đường dẫn tới tệp đã lưu). Bộ kiểm không tải khoá.
--dau-van-tay: SHA-256 của khoá lấy từ một nguồn ngoài máy chủ (hợp đồng, điện thoại); có thì khoá đã dùng phải khớp.
`;
async function docJsonKhoa(gt) {
    return gt.trimStart().startsWith("{") ? gt : readFile(gt, "utf8");
}
async function bienNhan(thamSo) {
    const co = docCo(thamSo, ["van-ban", "chu-ky", "khoa"], ["dau-van-tay"]);
    const khoa = docKhoaDaDan(await docJsonKhoa(co.get("khoa") ?? ""));
    const kq = kiemBienNhanBangKhoa(await readFile(co.get("van-ban") ?? ""), docChuKy(await readFile(co.get("chu-ky") ?? "")), khoa, co.get("dau-van-tay") ?? null);
    for (const d of kq.dong)
        stdout.write(d);
    return kq.ok ? 0 : 1;
}
async function main() {
    const [lenh, ...thamSo] = argv.slice(2);
    if (lenh === "bien-nhan")
        return bienNhan(thamSo);
    if (lenh === "kiem")
        return kiemThuMuc(docCo(thamSo, ["bo"]).get("bo") ?? "", (s) => stdout.write(s), (s) => stderr.write(s));
    if (lenh !== undefined && !lenh.startsWith("-") && thamSo.length === 0) {
        return kiemThuMuc(lenh, (s) => stdout.write(s), (s) => stderr.write(s));
    }
    stderr.write(CACH_DUNG);
    return 2;
}
main().then((ma) => {
    if (ma === 1)
        stderr.write("FAIL\n");
    exit(ma);
}, (loi) => {
    stderr.write(`${loi instanceof Error ? loi.message : String(loi)}\nFAIL\n`);
    exit(1);
});
return Object.freeze({  });
})();
