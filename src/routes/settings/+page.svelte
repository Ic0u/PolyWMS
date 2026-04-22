<script lang="ts">
  import {
    products,
    transactions,
    suppliers,
    users,
    categories,
    tasks,
    auditLogs,
    showAlert,
    addAuditLog,
  } from "$lib/stores";
  import Icon from "$lib/components/Icon.svelte";
  import Modal from "$lib/components/Modal.svelte";

  let showRestoreModal = $state(false);
  let restoreData = $state("");
  let restoreError = $state("");

  function backupData() {
    const data = {
      _meta: {
        version: 8,
        exportedAt: new Date().toISOString(),
        app: "Poly WMS",
      },
      products: $products,
      transactions: $transactions,
      suppliers: $suppliers,
      users: $users,
      categories: $categories,
      tasks: $tasks,
      auditLog: $auditLogs,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poly_wms_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog("Sao lưu dữ liệu hệ thống");
    showAlert("Đã sao lưu dữ liệu thành công");
  }

  function openRestore() {
    restoreData = "";
    restoreError = "";
    showRestoreModal = true;
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      restoreData = reader.result as string;
      restoreError = "";
    };
    reader.readAsText(file);
  }

  function restoreBackup() {
    try {
      const data = JSON.parse(restoreData);
      if (!data._meta || data._meta.app !== "Poly WMS") {
        restoreError =
          "File không hợp lệ. Vui lòng chọn file sao lưu từ Poly WMS.";
        return;
      }
      if (data.products) products.set(data.products);
      if (data.transactions) transactions.set(data.transactions);
      if (data.suppliers) suppliers.set(data.suppliers);
      if (data.users) users.set(data.users);
      if (data.categories) categories.set(data.categories);
      if (data.tasks) tasks.set(data.tasks);
      if (data.auditLog) auditLogs.set(data.auditLog);
      addAuditLog("Khôi phục dữ liệu từ bản sao lưu");
      showAlert("Đã khôi phục dữ liệu thành công");
      showRestoreModal = false;
    } catch {
      restoreError =
        "Không thể đọc file. Vui lòng kiểm tra lại định dạng JSON.";
    }
  }

  function resetAllData() {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xoá toàn bộ dữ liệu? Hành động này không thể hoàn tác.",
      )
    )
      return;
    if (
      !confirm(
        "Xác nhận lần cuối: TẤT CẢ dữ liệu sẽ bị xoá và khôi phục về mặc định.",
      )
    )
      return;
    localStorage.removeItem("opus_store_version");
    localStorage.removeItem("opus_products");
    localStorage.removeItem("opus_transactions");
    localStorage.removeItem("opus_suppliers");
    localStorage.removeItem("opus_users");
    localStorage.removeItem("opus_categories");
    localStorage.removeItem("opus_tasks");
    localStorage.removeItem("opus_audit_log");
    showAlert("Đã xoá toàn bộ dữ liệu. Tải lại trang để áp dụng.");
    setTimeout(() => location.reload(), 1500);
  }

  let storageUsed = $derived(() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("opus_")) {
        total += (localStorage.getItem(key) || "").length;
      }
    }
    return (total / 1024).toFixed(1);
  });
</script>

<svelte:head><title>Cài đặt - Poly WMS</title></svelte:head>

<div class="fade-in">
  <h1 class="page-title">Cài đặt hệ thống</h1>

  <div class="settings-grid">
    <!-- System Info -->
    <div class="settings-card">
      <div class="card-header">
        <Icon
          name="dashboard"
          size={16}
          color="var(--accent)"
          strokeWidth={2}
        />
        <h3>Thông tin hệ thống</h3>
      </div>
      <div class="info-rows">
        <div class="info-row">
          <span class="info-label">Ứng dụng</span>
          <span class="info-value">Poly WMS v1.0</span>
        </div>
        <div class="info-row">
          <span class="info-label">Sản phẩm</span>
          <span class="info-value">{$products.length} sản phẩm</span>
        </div>
        <div class="info-row">
          <span class="info-label">Giao dịch</span>
          <span class="info-value">{$transactions.length} phiếu</span>
        </div>
        <div class="info-row">
          <span class="info-label">Nhà cung cấp</span>
          <span class="info-value">{$suppliers.length} NCC</span>
        </div>
        <div class="info-row">
          <span class="info-label">Người dùng</span>
          <span class="info-value">{$users.length} tài khoản</span>
        </div>
        <div class="info-row">
          <span class="info-label">Dung lượng</span>
          <span class="info-value">{storageUsed()} KB</span>
        </div>
      </div>
    </div>

    <!-- Backup -->
    <div class="settings-card">
      <div class="card-header">
        <Icon name="download" size={16} color="var(--green)" strokeWidth={2} />
        <h3>Sao lưu dữ liệu</h3>
      </div>
      <p class="card-desc">
        Tải xuống toàn bộ dữ liệu hệ thống dưới dạng file JSON. Sử dụng file này
        để khôi phục dữ liệu khi cần.
      </p>
      <button class="btn btn-primary" onclick={backupData}>
        <Icon name="download" size={14} color="white" strokeWidth={2} />
        Sao lưu ngay
      </button>
    </div>

    <!-- Restore -->
    <div class="settings-card">
      <div class="card-header">
        <Icon name="upload" size={16} color="var(--accent)" strokeWidth={2} />
        <h3>Khôi phục dữ liệu</h3>
      </div>
      <p class="card-desc">
        Khôi phục dữ liệu từ file sao lưu JSON. Dữ liệu hiện tại sẽ bị ghi đè.
      </p>
      <button class="btn btn-secondary" onclick={openRestore}>
        <Icon name="upload" size={14} color="var(--text)" strokeWidth={2} />
        Chọn file khôi phục
      </button>
    </div>

    <!-- Danger Zone -->
    <div class="settings-card danger">
      <div class="card-header">
        <Icon name="warning" size={16} color="var(--red)" strokeWidth={2} />
        <h3>Vùng nguy hiểm</h3>
      </div>
      <p class="card-desc">
        Xoá toàn bộ dữ liệu và khôi phục về trạng thái mặc định ban đầu. Hành
        động này không thể hoàn tác.
      </p>
      <button class="btn btn-danger" onclick={resetAllData}>
        <Icon name="trash" size={14} color="white" strokeWidth={2} />
        Xoá toàn bộ dữ liệu
      </button>
    </div>
  </div>
</div>

<!-- Restore Modal -->
<Modal
  show={showRestoreModal}
  title="Khôi phục dữ liệu"
  onclose={() => (showRestoreModal = false)}
>
  <div class="form-group">
    <label for="restore-file">Chọn file sao lưu (.json)</label>
    <input
      id="restore-file"
      type="file"
      accept=".json"
      onchange={handleFileSelect}
    />
  </div>
  {#if restoreError}
    <p style="color:var(--red);font-size:12px;margin-top:8px">{restoreError}</p>
  {/if}
  {#if restoreData && !restoreError}
    <p style="color:var(--green);font-size:12px;margin-top:8px">
      File hợp lệ. Nhấn "Khôi phục" để tiếp tục.
    </p>
  {/if}
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => (showRestoreModal = false)}
      >Huỷ</button
    >
    <button
      class="btn btn-primary"
      onclick={restoreBackup}
      disabled={!restoreData}>Khôi phục</button
    >
  </div>
</Modal>

<style>
  .settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .settings-card {
    background: var(--bg-card);
    border: 0.5px solid var(--separator-op);
    border-radius: var(--r-xl);
    padding: 24px;
    transition: transform 0.3s var(--spring);
  }
  .settings-card:hover {
    transform: translateY(-2px);
  }
  .settings-card.danger {
    border-color: rgba(255, 69, 58, 0.2);
  }
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .card-header h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.02em;
  }
  .card-desc {
    font-size: 13px;
    color: var(--text3);
    line-height: 1.5;
    margin-bottom: 20px;
  }
  .info-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 0.5px solid var(--separator-op);
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-label {
    font-size: 13px;
    color: var(--text3);
  }
  .info-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }
  .btn-danger {
    background: var(--red);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: var(--r-md);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font);
    transition: opacity 0.2s;
  }
  .btn-danger:hover {
    opacity: 0.85;
  }
  input[type="file"] {
    font-size: 13px;
    color: var(--text);
    font-family: var(--font);
  }
</style>
