import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

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
  user: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  phone: string;
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

export interface StocktakeItem {
  productId: string;
  productName: string;
  systemQty: number;
  actualQty: number;
  diff: number;
}

export interface Stocktake {
  id: string;
  date: string;
  items: StocktakeItem[];
  status: 'draft' | 'confirmed';
  createdBy: string;
}

export type Role = 'admin' | 'manager' | 'staff';

export interface Task {
  id: string;
  title: string;
  assignee: string;       // username of staff
  assignedBy: string;     // username of manager/admin
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'done';
  dueDate: string;
  createdAt: string;
  note: string;
}

// ── Store Version (bump this whenever DEFAULT_* data changes) ──
const STORE_VERSION = '5';

if (browser) {
  const savedVersion = localStorage.getItem('opus_store_version');
  if (savedVersion !== STORE_VERSION) {
    // Clear all persisted store keys so new defaults are used
    ['opus_products','opus_transactions','opus_suppliers','opus_users',
     'opus_auditlogs','opus_stocktakes','opus_tasks','opus_loggedin','opus_current_user','opus_current_role']
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem('opus_store_version', STORE_VERSION);
  }
}

// ── localStorage helper ─────────────────────
function persistentWritable<T>(key: string, defaultValue: T) {
  let initial = defaultValue;
  if (browser) {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) initial = JSON.parse(stored) as T;
    } catch { /* ignore corrupted data, use default */ }
  }
  const store = writable<T>(initial);
  if (browser) {
    store.subscribe(val => {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage quota */ }
    });
  }
  return store;
}

// ── Auth (persisted so session survives reload) ──
export const isLoggedIn   = persistentWritable<boolean>('opus_loggedin', false);
export const currentUser  = persistentWritable<string>('opus_current_user', 'Mai Quốc Tam');
export const currentRole  = persistentWritable<Role>('opus_current_role', 'admin');

// ── Theme ──
export const isDarkMode = writable<boolean>(true);

export const ROLE_NAMES: Record<Role, string> = {
  admin:   'Quản trị hệ thống',
  manager: 'Quản lý',
  staff:   'Nhân viên'
};
export const roleName = derived(currentRole, $r => ROLE_NAMES[$r]);

// ── Theme ────────────────────────────────────
export const accentColor = writable('#0066CC');

// ── Mobile Responsive State ──────────────────
export const isSidebarOpen = writable<boolean>(true);

// ── Seed Data ────────────────────────────────
const DEFAULT_PRODUCTS: Product[] = [
  { id: 'SP001', name: 'Laptop Dell XPS 15',    category: 'Điện tử',   qty: 45,  price: 28000000, min: 10 },
  { id: 'SP002', name: 'iPhone 15 Pro Max',      category: 'Điện thoại', qty: 120, price: 34000000, min: 20 },
  { id: 'SP003', name: 'Samsung Galaxy S24',     category: 'Điện thoại', qty: 8,   price: 26000000, min: 15 },
  { id: 'SP004', name: 'AirPods Pro 2',          category: 'Phụ kiện',  qty: 200, price: 6500000,  min: 30 },
  { id: 'SP005', name: 'MacBook Air M3',         category: 'Điện tử',   qty: 32,  price: 32000000, min: 10 },
  { id: 'SP006', name: 'Bàn phím Logitech MX',  category: 'Phụ kiện',  qty: 5,   price: 2800000,  min: 20 },
  { id: 'SP007', name: 'Màn hình LG 27"',       category: 'Điện tử',   qty: 18,  price: 8500000,  min: 5  },
  { id: 'SP008', name: 'Chuột Magic Mouse',     category: 'Phụ kiện',  qty: 3,   price: 2200000,  min: 15 },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { date: '17/03/2026 08:30', type: 'import', product: 'iPhone 15 Pro Max',     qty: 50, note: 'Nhập lô mới', user: 'staff1' },
  { date: '16/03/2026 15:20', type: 'export', product: 'AirPods Pro 2',         qty: 20, note: 'Đơn hàng #1023', user: 'staff1' },
  { date: '16/03/2026 10:00', type: 'import', product: 'Laptop Dell XPS 15',   qty: 15, note: 'Bổ sung kho', user: 'manager1' },
  { date: '15/03/2026 14:45', type: 'export', product: 'MacBook Air M3',        qty: 5,  note: 'Đơn hàng #1020', user: 'staff1' },
  { date: '15/03/2026 09:10', type: 'import', product: 'Bàn phím Logitech MX', qty: 30, note: 'Nhập lô Q1', user: 'staff1' },
  { date: '14/03/2026 16:30', type: 'export', product: 'Samsung Galaxy S24',    qty: 12, note: 'Đơn hàng #1018', user: 'staff2' },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 'NCC01', name: 'Apple Vietnam',        contact: 'Nguyễn Văn A', email: 'apple@vn.com',     address: 'Quận 1, TP.HCM', phone: '0901234567', products: 3 },
  { id: 'NCC02', name: 'Samsung Distribution', contact: 'Trần Thị B',   email: 'samsung@dist.vn',  address: 'Quận 3, TP.HCM', phone: '0987654321', products: 2 },
  { id: 'NCC03', name: 'Logitech APAC',        contact: 'Lê Văn C',     email: 'logi@apac.com',    address: 'Quận 7, TP.HCM', phone: '0912345678', products: 2 },
];

const DEFAULT_USERS: User[] = [
  { username: 'tam', name: 'Mai Quốc Tam',      role: 'admin',   active: true },
  { username: 'trinh',    name: 'Phạm Thùy Trinh',   role: 'manager', active: true },
  { username: 'an',        name: 'Trần Hải An',        role: 'staff',   active: true },
  { username: 'bao',      name: 'Trần Vinh Bảo',      role: 'staff',   active: true },
  { username: 'nam',    name: 'Nguyễn Nam',         role: 'staff',   active: true },
  { username: 'minh',    name: 'Như Lê Hoàng Minh',  role: 'staff',   active: true },
];

const DEFAULT_AUDIT: AuditLog[] = [
  { time: '17/03 08:30', user: 'staff1',   action: 'Nhập kho 50x iPhone 15 Pro Max'         },
  { time: '16/03 15:20', user: 'staff1',   action: 'Xuất kho 20x AirPods Pro 2'             },
  { time: '16/03 10:00', user: 'manager1', action: 'Cập nhật giá Laptop Dell XPS 15'        },
  { time: '15/03 14:45', user: 'admin',    action: 'Thêm user mới: staff2'                  },
  { time: '15/03 09:10', user: 'staff1',   action: 'Nhập kho 30x Bàn phím Logitech MX'     },
];

// ── Data Stores (persisted) ──────────────────
export const products    = persistentWritable<Product[]>('opus_products',    DEFAULT_PRODUCTS);
export const transactions = persistentWritable<Transaction[]>('opus_transactions', DEFAULT_TRANSACTIONS);
export const suppliers   = persistentWritable<Supplier[]>('opus_suppliers',  DEFAULT_SUPPLIERS);
export const users       = persistentWritable<User[]>('opus_users',          DEFAULT_USERS);
export const auditLogs   = persistentWritable<AuditLog[]>('opus_auditlogs',  DEFAULT_AUDIT);
export const stocktakes  = persistentWritable<Stocktake[]>('opus_stocktakes', []);

const DEFAULT_TASKS: Task[] = [
  { id: 'CV001', title: 'Kiểm kê lô hàng Apple kho A', assignee: 'nam', assignedBy: 'trinh', priority: 'high', status: 'pending', dueDate: '21/03/2026', createdAt: '20/03/2026 09:00', note: 'Ưu tiên iPhone và MacBook' },
  { id: 'CV002', title: 'Nhập hàng Samsung từ NCC02', assignee: 'an', assignedBy: 'trinh', priority: 'medium', status: 'in_progress', dueDate: '22/03/2026', createdAt: '19/03/2026 14:30', note: 'Liên hệ Trần Thị B' },
  { id: 'CV003', title: 'Sắp xếp lại kệ phụ kiện', assignee: 'bao', assignedBy: 'tam', priority: 'low', status: 'done', dueDate: '20/03/2026', createdAt: '18/03/2026 10:00', note: '' },
];
export const tasks = persistentWritable<Task[]>('opus_tasks', DEFAULT_TASKS);

// ── Derived ──────────────────────────────────
export const lowStockProducts    = derived(products, $p => $p.filter(p => p.qty < p.min));
export const totalInventoryValue = derived(products, $p => $p.reduce((s, p) => s + p.qty * p.price, 0));
export const totalStock          = derived(products, $p => $p.reduce((s, p) => s + p.qty, 0));

// ── Helpers ──────────────────────────────────
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function getProductStatus(p: { qty: number; min: number }) {
  if (p.qty < p.min)     return { cls: 'badge-red',    text: 'Sắp hết'  };
  if (p.qty < p.min * 2) return { cls: 'badge-orange', text: 'Thấp'     };
  return                        { cls: 'badge-green',  text: 'Đủ hàng'  };
}

// ── Toast Alert ──────────────────────────────
export const alertMessage = writable<{ text: string; type: 'success' | 'error' } | null>(null);
let alertTimer: ReturnType<typeof setTimeout>;
export function showAlert(text: string, type: 'success' | 'error' = 'success') {
  if (type === 'error' && typeof window !== 'undefined' && (window as any).electronAPI?.showDialog) {
    (window as any).electronAPI.showDialog({ type: 'error', title: 'Thông báo lỗi', message: text });
    return;
  }
  clearTimeout(alertTimer);
  alertMessage.set({ text, type });
  alertTimer = setTimeout(() => alertMessage.set(null), 2500);
}

// ── Audit Logger ─────────────────────────────
export function addAuditLog(action: string) {
  const now  = new Date();
  const time = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  auditLogs.update(logs => [{ time, user: get(currentUser), action }, ...logs]);
}

// ── Reset to Seed (dev helper) ───────────────
export function resetAllData() {
  if (!browser) return;
  const keys = ['opus_products','opus_transactions','opus_suppliers','opus_users','opus_auditlogs','opus_stocktakes','opus_loggedin','opus_current_user','opus_current_role'];
  keys.forEach(k => localStorage.removeItem(k));
  location.reload();
}
