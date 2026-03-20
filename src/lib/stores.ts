import { writable, derived, get } from 'svelte/store';

// ── Interfaces ──────────────────────────────
export interface Product {
  id: string;
  name: string;
  category: string;
  qty: number;
  price: number;
  min: number;
}

export interface Transaction {
  date: string;
  type: 'import' | 'export';
  product: string;
  qty: number;
  note: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  products: number;
}

export interface User {
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  active: boolean;
}

export interface AuditLog {
  time: string;
  user: string;
  action: string;
}

export type Role = 'admin' | 'manager' | 'staff';

// ── Auth ─────────────────────────────────────
export const isLoggedIn = writable(false);
export const currentUser = writable('Mai Quốc Tam');
export const currentRole = writable<Role>('admin');

export const ROLE_NAMES: Record<Role, string> = {
  admin: 'Quản trị hệ thống',
  manager: 'Quản lý',
  staff: 'Nhân viên'
};
export const roleName = derived(currentRole, $r => ROLE_NAMES[$r]);

// ── Theme ────────────────────────────────────
export const accentColor = writable('#0066CC');

// ── Mobile Responsive State ──────────────────
export const isSidebarOpen = writable<boolean>(true);

// ── Data stores ──────────────────────────────
export const products = writable<Product[]>([
  { id: 'SP001', name: 'Laptop Dell XPS 15', category: 'Điện tử', qty: 45, price: 28000000, min: 10 },
  { id: 'SP002', name: 'iPhone 15 Pro Max', category: 'Điện thoại', qty: 120, price: 34000000, min: 20 },
  { id: 'SP003', name: 'Samsung Galaxy S24', category: 'Điện thoại', qty: 8, price: 26000000, min: 15 },
  { id: 'SP004', name: 'AirPods Pro 2', category: 'Phụ kiện', qty: 200, price: 6500000, min: 30 },
  { id: 'SP005', name: 'MacBook Air M3', category: 'Điện tử', qty: 32, price: 32000000, min: 10 },
  { id: 'SP006', name: 'Bàn phím Logitech MX', category: 'Phụ kiện', qty: 5, price: 2800000, min: 20 },
  { id: 'SP007', name: 'Màn hình LG 27"', category: 'Điện tử', qty: 18, price: 8500000, min: 5 },
  { id: 'SP008', name: 'Chuột Magic Mouse', category: 'Phụ kiện', qty: 3, price: 2200000, min: 15 },
]);

export const transactions = writable<Transaction[]>([
  { date: '17/03/2026 08:30', type: 'import', product: 'iPhone 15 Pro Max', qty: 50, note: 'Nhập lô mới' },
  { date: '16/03/2026 15:20', type: 'export', product: 'AirPods Pro 2', qty: 20, note: 'Đơn hàng #1023' },
  { date: '16/03/2026 10:00', type: 'import', product: 'Laptop Dell XPS 15', qty: 15, note: 'Bổ sung kho' },
  { date: '15/03/2026 14:45', type: 'export', product: 'MacBook Air M3', qty: 5, note: 'Đơn hàng #1020' },
  { date: '15/03/2026 09:10', type: 'import', product: 'Bàn phím Logitech MX', qty: 30, note: 'Nhập lô Q1' },
  { date: '14/03/2026 16:30', type: 'export', product: 'Samsung Galaxy S24', qty: 12, note: 'Đơn hàng #1018' },
]);

export const suppliers = writable<Supplier[]>([
  { id: 'NCC01', name: 'Apple Vietnam', contact: 'Nguyễn Văn A', email: 'apple@vn.com', products: 3 },
  { id: 'NCC02', name: 'Samsung Distribution', contact: 'Trần Thị B', email: 'samsung@dist.vn', products: 2 },
  { id: 'NCC03', name: 'Logitech APAC', contact: 'Lê Văn C', email: 'logi@apac.com', products: 2 },
]);

export const users = writable<User[]>([
  { username: 'Mai Quốc Tam', name: 'Mai Quốc Tam', role: 'admin', active: true },
  { username: 'thuytrinh', name: 'Phạm thùy Trinh', role: 'manager', active: true },
  { username: 'haian', name: 'tran hai an', role: 'staff', active: true },
  { username: 'vinhbao', name: 'tran vinh bao', role: 'staff', active: true },
  { username: 'nguyennam', name: 'Nguyen nam', role: 'staff', active: true },
  { username: 'hoangminh', name: 'nhu le hoang minh', role: 'staff', active: true }
]);

export const auditLogs = writable<AuditLog[]>([
  { time: '17/03 08:30', user: 'staff1', action: 'Nhập kho 50x iPhone 15 Pro Max' },
  { time: '16/03 15:20', user: 'staff1', action: 'Xuất kho 20x AirPods Pro 2' },
  { time: '16/03 10:00', user: 'manager1', action: 'Cập nhật giá Laptop Dell XPS 15' },
  { time: '15/03 14:45', user: 'admin', action: 'Thêm user mới: staff2' },
  { time: '15/03 09:10', user: 'staff1', action: 'Nhập kho 30x Bàn phím Logitech MX' },
]);

// ── Derived ──────────────────────────────────
export const lowStockProducts = derived(products, $p => $p.filter(p => p.qty < p.min));
export const totalInventoryValue = derived(products, $p => $p.reduce((s, p) => s + p.qty * p.price, 0));
export const totalStock = derived(products, $p => $p.reduce((s, p) => s + p.qty, 0));

// ── Helpers ──────────────────────────────────
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function getProductStatus(p: { qty: number; min: number }) {
  if (p.qty < p.min) return { cls: 'badge-red', text: 'Sắp hết' };
  if (p.qty < p.min * 2) return { cls: 'badge-orange', text: 'Thấp' };
  return { cls: 'badge-green', text: 'Đủ hàng' };
}

// ── Alert ────────────────────────────────────
export const alertMessage = writable<{ text: string; type: 'success' | 'error' } | null>(null);
let alertTimer: ReturnType<typeof setTimeout>;
export function showAlert(text: string, type: 'success' | 'error' = 'success') {
  clearTimeout(alertTimer);
  alertMessage.set({ text, type });
  alertTimer = setTimeout(() => alertMessage.set(null), 2500);
}

export function addAuditLog(action: string) {
  const now = new Date();
  const time = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const user = get(currentUser);
  auditLogs.update(logs => [{ time, user, action }, ...logs]);
}
