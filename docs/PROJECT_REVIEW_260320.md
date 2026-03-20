# 📊 BÁO CÁO DỰ ÁN: Poly WMS (Warehouse Management System)

## 🎯 App này làm gì?
Poly WMS là phần mềm Quản lý Kho Hàng Desktop (chạy như Windows/macOS app). Hệ thống được thiết kế theo phong cách UI cực xịn của Apple (macOS Tahoe Liquid Glass) mượt mà, hỗ trợ giao diện tối màu. Ứng dụng hỗ trợ Quản trị viên, Quản lý kho, và Nhân viên phối hợp quản lý tồn kho, giao nhận, kiểm kê và báo cáo chặt chẽ.

## 📁 Cấu trúc chính
```text
opus/
├── electron/
│   ├── main.cjs         # Cấu hình app Desktop window, ipcMain
│   └── preload.cjs      # Cầu nối an toàn (Bridge) IPC renderer
├── src/
│   ├── lib/
│   │   ├── components/  # Sidebar, Modal, Login, Icon (SF Symbols)
│   │   ├── styles/      # global.css (System design)
│   │   └── stores.ts    # Database cục bộ (LocalStorage + persist)
│   ├── routes/          # Các trang (SvelteKit Routing)
│   │   ├── (auth)
│   │   ├── audit        # Nhật ký hệ thống
│   │   ├── inventory    # Nhập/Xuất kho hàng
│   │   ├── products     # Danh mục sản phẩm
│   │   ├── reports      # Báo cáo thống kê
│   │   ├── stocktake    # Kiểm kê định kỳ
│   │   ├── suppliers    # Nhà cung cấp
│   │   ├── tasks        # Phân công nhân viên
│   │   ├── users        # Phân quyền admin
│   │   └── +layout.svelte # Route Guard + Layout chung
└── static/              # Assets hình ảnh (avatars, cover)
```

## 🛠️ Công nghệ sử dụng
| Thành phần | Công nghệ | Vai trò |
|------------|-----------|---------|
| Core App   | **SvelteKit (Svelte 5 Runes)** | Render giao diện, Data reactivity |
| Desktop    | **Electron** | Build app ra .dmg / .exe |
| Component  | **Vanilla CSS / HTML** | Không dùng CSS Framework, giữ style siêu nhẹ và chính chủ Apple UI |
| Database   | **LocalStorage (Client-side)** | Hiện tại build Offline-first qua store `persistentWritable` |

## 📍 Tính năng ĐÃ HOÀN THIỆN (The "Done" List)
1. **Phân quyền Role-based Access Control (RBAC)** (Admin, Manager, Staff) với Route Guards chặt chẽ.
2. **Apple Desktop UI System:**
   - Sidebar Acrylic Liquid Glass trong suốt.
   - Sync màu Accent color (Xanh/Cam/Đỏ) theo hệ điều hành Windows/macOS tự động.
3. **Quản lý danh mục ròng:** Sản phẩm, Nhà cung cấp, Quản lý User (Thêm/Sửa/Xóa).
4. **Nhập & Xuất Kho:** Theo dõi luồng hàng (`/inventory`) tích hợp với Tồn kho thực tế (`products`).
5. **Kiểm kê:** Lên danh sách chênh lệch kho.
6. **Task Assignment (Phân công việc):** Quản lý giao việc (`/tasks`) cho Nhân viên.
7. **Báo cáo & Thống kê:** Dashboard overview, Biểu đồ Nhập/Xuất thời gian thực, và nút "Xuất File CSV".
8. **Nhật ký Hệ thống:** Theo dõi song song thao tác Quản trị hệ thống và Giao dịch kho.

## ⚠️ Giới hạn (Known Gaps / Potential Missing Features)
*Đây là những tính năng thường có trong chuỗi cung ứng nhưng App ĐANG THIẾU. Anh so với Product Backlog xem có khớp không nhé:*
1. **Database Online (Supabase/Firebase/PostgreSQL):** Data đang lưu ở máy tính hiện tại. Chưa thể sync với các máy tính khác qua môi trường mạng (ngoài việc cắm chung mạng LAN/Cloud nếu dev sau).
2. **Quy trình Duyệt (Maker/Checker):** Phiếu Nhập kho/Xuất Kho hiện tại bấm là done thẳng vào kho. Chưa có luồng "Nhân viên tạo phiếu -> Quản lý vào App duyệt (Approve) -> Hàng mới vô kho".
3. **In mã vạch / Quét Barcode:** Rất phổ biến trong thao tác kho nhưng trên App chưa có UI quét.
4. **Export phiếu lẻ (PDF):** Mới xuất được file Excel (CSV) tổng cho biểu đồ, chưa xuất được "Phiếu Xuất Kho A4".

## 🚀 Cách chạy
```bash
# Mở Terminal nằm trong folder opus
npm run dev      # Test UI trên web browser
npm run electron # Mở như một ứng dụng gốc (App) MacOS/Win
```
