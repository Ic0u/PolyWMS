# PolyWMS - PPS Estimation (Project Point System)

Dựa trên Backlog và công thức chuẩn Agile/PPS:
- **C** (Hệ số nhân môi trường): Với `ED = 32` (thuộc khoảng `24 <= ED <= 36`), hệ số `C = 0.5`.
- **AP** (Điểm đã hiệu chỉnh) = `UP * C`
- **PPS** (Điểm mỗi Sprint/Feature) = `(AP * ED) / 36`

Bảng dưới đây được chia lại theo **từng Sprint (từ PB01 đến PB07)** gộp các Request hợp lý để tránh chia lẻ tẻ sai cấu trúc Agile.

| Sprint | Tên Feature (Backlog) | Loại tương tác | Quy tắc NV | Thực thể | Loại thao tác DL | Điểm UP | Hệ số nhân (C) | Điểm AP | ED | PPS |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Sprint 1** | **Quản lý Đăng nhập & Đăng xuất (PB01)**<br>_(RQ01, RQ15, RQ16, RQ26, RQ27, RQ32)_ | 3 | 2 | 1 | 1 | **7.00** | 0.5 | 3.50 | 32 | **3.1** |
| **Sprint 2** | **Quản lý Sản phẩm (PB02)**<br>_(RQ02, RQ06, RQ09, RQ17, RQ18, RQ19, RQ20)_ | 3 | 2 | 1 | 2 | **8.00** | 0.5 | 4.00 | 32 | **3.6** |
| **Sprint 3** | **Quản lý Nhập/Xuất hàng (PB03)**<br>_(RQ03, RQ04, RQ10, RQ11, RQ12)_ | 3 | 3 | 2 | 3 | **11.00** | 0.5 | 5.50 | 32 | **4.9** |
| **Sprint 4** | **Quản lý Tồn kho & Cảnh báo (PB04)**<br>_(RQ05, RQ07, RQ08, RQ21, RQ23)_ | 2 | 2 | 2 | 1 | **7.00** | 0.5 | 3.50 | 32 | **3.1** |
| **Sprint 5** | **Hệ thống Báo cáo (PB05)**<br>_(RQ13, RQ14, RQ22)_ | 2 | 2 | 2 | 1 | **7.00** | 0.5 | 3.50 | 32 | **3.1** |
| **Sprint 6** | **NCC & Phân công công việc (PB06)**<br>_(RQ24, RQ25)_ | 3 | 2 | 2 | 2 | **9.00** | 0.5 | 4.50 | 32 | **4.0** |
| **Sprint 7** | **Phân quyền, Audit Log & Dashboard (PB07)**<br>_(RQ28, RQ29, RQ30, RQ31)_ | 2 | 3 | 3 | 1 | **9.00** | 0.5 | 4.50 | 32 | **4.0** |
| | | | | | | | | | | |
| **Tổng** | **Toàn bộ dự án PolyWMS** | - | - | - | - | **58.00** | - | **29.00** | - | **25.8** |

### Cách tính mẫu cho Sprint 3 (PB03 - Nhập xuất hàng)
- **Tương tác (3):** Giao diện nhập liệu phức tạp, cần tương tác con người (điền Form nhập/xuất).
- **Quy tắc NV (3):** Phức tạp (>3 quy tắc: validation, check tồn kho, tự động cộng/trừ quantity).
- **Thực thể (2):** Cập nhật đồng thời 2 thực thể (Product, Transaction).
- **Thao tác DL (3):** Insert và Update chéo nhau phức tạp.
- **Tính toán:** 
  - `UP` = 3 + 3 + 2 + 3 = 11.
  - `AP` = 11 * 0.5 = 5.5.
  - `PPS` = (5.5 * 32) / 36 ≈ 4.888 ➜ **4.9**
