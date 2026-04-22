<script lang="ts">
  import {
    products,
    transactions,
    showAlert,
    addAuditLog,
    users,
    currentUser,
    currentRole,
    type Transaction,
  } from "$lib/stores";
  import { get } from "svelte/store";
  import Icon from "$lib/components/Icon.svelte";
  import Modal from "$lib/components/Modal.svelte";

  let currentUsername = $derived(() => {
    const u = get(users).find((u) => u.name === $currentUser);
    return u?.username ?? "";
  });

  // Voucher ID generation
  function nextVoucherId(type: "import" | "export"): string {
    const prefix = type === "import" ? "PN" : "PX";
    const existing = $transactions.filter((t) =>
      t.voucherId.startsWith(prefix),
    );
    const maxNum = existing.reduce((max, t) => {
      const num = parseInt(t.voucherId.replace(prefix, ""), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
  }

  let showModal = $state(false);
  let txType = $state<"import" | "export">("import");
  let txProduct = $state("");
  let txQty = $state(1);
  let txNote = $state("");

  // Filters
  let filterType = $state<"all" | "import" | "export">("all");
  let filterStatus = $state<"all" | "pending" | "approved" | "rejected">("all");

  let filteredTxns = $derived(
    $transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      return true;
    }),
  );

  let pendingCount = $derived(
    $transactions.filter((t) => t.status === "pending").length,
  );

  function openTx(type: "import" | "export") {
    txType = type;
    txProduct = $products[0]?.name ?? "";
    txQty = 1;
    txNote = "";
    showModal = true;
  }

  function saveTx() {
    if (!txProduct) {
      showAlert("Vui lòng chọn sản phẩm.", "error");
      return;
    }
    if (
      txQty === null ||
      txQty === undefined ||
      txQty <= 0 ||
      !Number.isInteger(txQty)
    ) {
      showAlert("Số lượng phải là số nguyên lớn hơn 0.", "error");
      return;
    }
    const p = $products.find((x) => x.name === txProduct);
    if (!p) {
      showAlert("Sản phẩm không tồn tại.", "error");
      return;
    }
    if (txType === "export" && p.qty < txQty) {
      showAlert("Không đủ số lượng trong kho để xuất.", "error");
      return;
    }

    const isManagerOrAdmin =
      $currentRole === "manager" || $currentRole === "admin";
    const vid = nextVoucherId(txType);

    if (isManagerOrAdmin) {
      products.update((list) =>
        list.map((x) =>
          x.name === txProduct
            ? { ...x, qty: txType === "import" ? x.qty + txQty : x.qty - txQty }
            : x,
        ),
      );
      transactions.update((list) => [
        {
          voucherId: vid,
          date: new Date().toLocaleString("vi-VN"),
          type: txType,
          product: txProduct,
          qty: txQty,
          note: txNote || "—",
          user: currentUsername(),
          status: "approved" as const,
          approvedBy: currentUsername(),
          approvedAt: new Date().toLocaleString("vi-VN"),
        },
        ...list,
      ]);
      addAuditLog(
        `${txType === "import" ? "Nhập" : "Xuất"} kho (tự duyệt): ${vid} - ${txQty}x ${txProduct}`,
      );
      showAlert(
        `${txType === "import" ? "Nhập" : "Xuất"} kho thành công. Mã phiếu: ${vid}`,
      );
    } else {
      transactions.update((list) => [
        {
          voucherId: vid,
          date: new Date().toLocaleString("vi-VN"),
          type: txType,
          product: txProduct,
          qty: txQty,
          note: txNote || "—",
          user: currentUsername(),
          status: "pending" as const,
        },
        ...list,
      ]);
      addAuditLog(`Tạo phiếu chờ duyệt: ${vid} - ${txQty}x ${txProduct}`);
      showAlert(`Đã tạo phiếu ${vid}. Chờ quản lý duyệt.`);
    }
    showModal = false;
  }

  // RQ36: Approve/Reject
  function approveVoucher(tx: Transaction) {
    const p = $products.find((x) => x.name === tx.product);
    if (!p) {
      showAlert("Sản phẩm không tồn tại.", "error");
      return;
    }
    if (tx.type === "export" && p.qty < tx.qty) {
      showAlert("Không đủ số lượng để duyệt xuất.", "error");
      return;
    }
    products.update((list) =>
      list.map((x) =>
        x.name === tx.product
          ? {
              ...x,
              qty: tx.type === "import" ? x.qty + tx.qty : x.qty - tx.qty,
            }
          : x,
      ),
    );
    transactions.update((list) =>
      list.map((t) =>
        t.voucherId === tx.voucherId
          ? {
              ...t,
              status: "approved" as const,
              approvedBy: currentUsername(),
              approvedAt: new Date().toLocaleString("vi-VN"),
            }
          : t,
      ),
    );
    addAuditLog(`Duyệt phiếu: ${tx.voucherId}`);
    showAlert(`Đã duyệt phiếu ${tx.voucherId}`);
  }

  let rejectId = $state("");
  let rejectReason = $state("");
  let showRejectModal = $state(false);

  function openReject(vid: string) {
    rejectId = vid;
    rejectReason = "";
    showRejectModal = true;
  }

  function rejectVoucher() {
    if (!rejectReason.trim()) {
      showAlert("Vui lòng nhập lý do từ chối.", "error");
      return;
    }
    transactions.update((list) =>
      list.map((t) =>
        t.voucherId === rejectId
          ? {
              ...t,
              status: "rejected" as const,
              approvedBy: currentUsername(),
              approvedAt: new Date().toLocaleString("vi-VN"),
              rejectReason: rejectReason.trim(),
            }
          : t,
      ),
    );
    addAuditLog(`Từ chối phiếu: ${rejectId} - Lý do: ${rejectReason.trim()}`);
    showAlert(`Đã từ chối phiếu ${rejectId}`);
    showRejectModal = false;
  }

  let canApprove = $derived(
    $currentRole === "manager" || $currentRole === "admin",
  );

  function statusBadge(s: string) {
    if (s === "approved") return { cls: "badge-green", text: "Đã duyệt" };
    if (s === "rejected") return { cls: "badge-red", text: "Từ chối" };
    return { cls: "badge-orange", text: "Chờ duyệt" };
  }
</script>

<svelte:head><title>Nhập/Xuất kho - Poly WMS</title></svelte:head>

<div class="fade-in">
  <div class="h-col"><h1 class="page-title">Nhập/Xuất kho</h1></div>

  <div class="action-row">
    <button class="tx-btn" onclick={() => openTx("import")}>
      <Icon name="import" size={16} color="var(--green)" strokeWidth={2} />
      <div>
        <div class="tx-btn-title">Nhập kho</div>
        <div class="tx-btn-sub">Thêm hàng vào kho</div>
      </div>
    </button>
    <button class="tx-btn" onclick={() => openTx("export")}>
      <Icon name="export" size={16} color="var(--accent)" strokeWidth={2} />
      <div>
        <div class="tx-btn-title">Xuất kho</div>
        <div class="tx-btn-sub">Lấy hàng từ kho</div>
      </div>
    </button>
  </div>

  {#if canApprove && pendingCount > 0}
    <div class="pending-banner">
      <Icon name="bell" size={14} color="var(--orange)" strokeWidth={2} />
      <span>{pendingCount} phiếu đang chờ duyệt</span>
      <button
        class="btn btn-sm"
        style="margin-left:auto;font-size:11px"
        onclick={() => (filterStatus = "pending")}>Xem tất cả</button
      >
    </div>
  {/if}

  <div class="filter-row">
    <div class="seg-control">
      <button
        class="seg-btn"
        class:active={filterType === "all"}
        onclick={() => (filterType = "all")}>Tất cả</button
      >
      <button
        class="seg-btn"
        class:active={filterType === "import"}
        onclick={() => (filterType = "import")}>Nhập</button
      >
      <button
        class="seg-btn"
        class:active={filterType === "export"}
        onclick={() => (filterType = "export")}>Xuất</button
      >
    </div>
    <div class="seg-control">
      <button
        class="seg-btn"
        class:active={filterStatus === "all"}
        onclick={() => (filterStatus = "all")}>Tất cả</button
      >
      <button
        class="seg-btn"
        class:active={filterStatus === "pending"}
        onclick={() => (filterStatus = "pending")}
        >Chờ duyệt {pendingCount > 0 ? `(${pendingCount})` : ""}</button
      >
      <button
        class="seg-btn"
        class:active={filterStatus === "approved"}
        onclick={() => (filterStatus = "approved")}>Đã duyệt</button
      >
      <button
        class="seg-btn"
        class:active={filterStatus === "rejected"}
        onclick={() => (filterStatus = "rejected")}>Từ chối</button
      >
    </div>
  </div>

  <div class="table-card">
    <div class="table-header">
      <h3>Lịch sử giao dịch</h3>
      <span class="count">{filteredTxns.length} giao dịch</span>
    </div>
    <table>
      <thead>
        <tr
          ><th>Mã phiếu</th><th>Thời gian</th><th>Loại</th><th>Sản phẩm</th><th
            >Số lượng</th
          ><th>Người tạo</th><th>Ghi chú</th><th>Trạng thái</th
          >{#if canApprove}<th></th>{/if}</tr
        >
      </thead>
      <tbody>
        {#each filteredTxns as tx, i}
          {@const sb = statusBadge(tx.status)}
          <tr class="row-anim" style="animation-delay:{i * 20}ms">
            <td class="mono" style="font-weight:600;font-size:12px"
              >{tx.voucherId}</td
            >
            <td style="color:var(--text2);font-size:12px;white-space:nowrap"
              >{tx.date}</td
            >
            <td>
              <span class="tx-badge {tx.type}">
                <Icon
                  name={tx.type === "import" ? "import" : "export"}
                  size={11}
                  strokeWidth={2.5}
                  color={tx.type === "import"
                    ? "var(--green)"
                    : "var(--accent)"}
                />
                {tx.type === "import" ? "Nhập" : "Xuất"}
              </span>
            </td>
            <td style="font-weight:500">{tx.product}</td>
            <td
              class="qty-cell {tx.type}"
              style="font-weight:600;font-variant-numeric:tabular-nums"
              >{tx.type === "import" ? "+" : "-"}{tx.qty}</td
            >
            <td style="color:var(--text3)">{tx.user || "—"}</td>
            <td
              style="color:var(--text3);max-width:150px;overflow:hidden;text-overflow:ellipsis"
              >{tx.note}</td
            >
            <td>
              <span
                class="badge {sb.cls}"
                title={tx.rejectReason
                  ? `Lý do: ${tx.rejectReason}`
                  : tx.approvedBy
                    ? `Người duyệt: ${tx.approvedBy}`
                    : ""}>{sb.text}</span
              >
            </td>
            {#if canApprove}
              <td>
                {#if tx.status === "pending"}
                  <div class="action-btns">
                    <button
                      class="icon-btn"
                      onclick={() => approveVoucher(tx)}
                      title="Duyệt"
                    >
                      <Icon
                        name="check"
                        size={14}
                        color="var(--green)"
                        strokeWidth={2.5}
                      />
                    </button>
                    <button
                      class="icon-btn danger"
                      onclick={() => openReject(tx.voucherId)}
                      title="Từ chối"
                    >
                      <Icon
                        name="x"
                        size={14}
                        color="var(--red)"
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>
                {/if}
              </td>
            {/if}
          </tr>
        {:else}
          <tr
            ><td
              colspan="9"
              style="text-align:center;color:var(--text3);padding:40px"
              >Không có giao dịch nào</td
            ></tr
          >
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Modal
  show={showModal}
  title={txType === "import" ? "Tạo phiếu nhập kho" : "Tạo phiếu xuất kho"}
  onclose={() => (showModal = false)}
>
  <div class="voucher-info">
    <span>Mã phiếu:</span>
    <span class="mono" style="font-weight:700">{nextVoucherId(txType)}</span>
  </div>
  <div class="form-group">
    <label for="tx-product">Sản phẩm</label>
    <select id="tx-product" bind:value={txProduct}>
      {#each $products as p}<option>{p.name}</option>{/each}
    </select>
  </div>
  <div class="form-group">
    <label for="tx-qty">Số lượng</label><input
      id="tx-qty"
      type="number"
      bind:value={txQty}
      min="1"
    />
  </div>
  <div class="form-group">
    <label for="tx-note">Ghi chú</label><input
      id="tx-note"
      bind:value={txNote}
      placeholder="Lý do nhập/xuất..."
    />
  </div>
  {#if $currentRole === "staff"}
    <p style="font-size:12px;color:var(--text3);margin-top:8px">
      Phiếu sẽ chờ quản lý duyệt trước khi cập nhật tồn kho.
    </p>
  {/if}
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => (showModal = false)}
      >Huỷ</button
    >
    <button class="btn btn-primary" onclick={saveTx}>Xác nhận</button>
  </div>
</Modal>

<Modal
  show={showRejectModal}
  title="Từ chối phiếu"
  onclose={() => (showRejectModal = false)}
>
  <div class="form-group">
    <label for="reject-reason">Lý do từ chối</label>
    <input
      id="reject-reason"
      bind:value={rejectReason}
      placeholder="Nhập lý do..."
    />
  </div>
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => (showRejectModal = false)}
      >Huỷ</button
    >
    <button
      class="btn btn-primary"
      style="background:var(--red)"
      onclick={rejectVoucher}>Từ chối</button
    >
  </div>
</Modal>

<style>
  .pending-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(245, 158, 11, 0.08);
    border: 0.5px solid rgba(245, 158, 11, 0.2);
    border-radius: var(--r-xl);
    margin-bottom: 20px;
    font-size: 13px;
    font-weight: 500;
    color: var(--orange);
  }
  .filter-row {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .seg-control {
    display: inline-flex;
    background: var(--glass-bg);
    border-radius: var(--r-md);
    padding: 2px;
    border: 0.5px solid var(--separator-op);
  }
  .seg-btn {
    padding: 5px 12px;
    font-size: 11px;
    font-weight: 500;
    background: none;
    border: none;
    border-radius: calc(var(--r-md) - 2px);
    color: var(--text2);
    cursor: pointer;
    transition: all 0.2s;
  }
  .seg-btn.active {
    background: var(--accent);
    color: white;
  }
  .voucher-info {
    display: flex;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--glass-bg);
    border: 0.5px solid var(--separator-op);
    border-radius: var(--r-md);
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--text2);
  }
</style>
