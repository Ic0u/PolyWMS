<script lang="ts">
  import { products, stocktakes, addAuditLog, showAlert, currentUser, type StocktakeItem, type Stocktake } from '$lib/stores';
  import { get } from 'svelte/store';
  import Icon from '$lib/components/Icon.svelte';
  import Modal from '$lib/components/Modal.svelte';

  let showModal = $state(false);
  let items = $state<StocktakeItem[]>([]);

  function openStocktake() {
    items = $products.map(p => ({
      productId: p.id,
      productName: p.name,
      systemQty: p.qty,
      actualQty: p.qty,
      diff: 0
    }));
    showModal = true;
  }

  function updateDiff(index: number) {
    items[index].diff = items[index].actualQty - items[index].systemQty;
  }

  function saveStocktake() {
    const now = new Date();
    const id = `KK${now.getFullYear().toString().slice(2)}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;
    const record: Stocktake = {
      id,
      date: now.toLocaleString('vi-VN'),
      items: items.map(i => ({ ...i })),
      status: 'confirmed',
      createdBy: get(currentUser)
    };

    stocktakes.update(list => [record, ...list]);

    // Update product quantities based on actual count
    const diffs = items.filter(i => i.diff !== 0);
    if (diffs.length > 0) {
      products.update(list =>
        list.map(p => {
          const found = items.find(i => i.productId === p.id);
          return found ? { ...p, qty: found.actualQty } : p;
        })
      );
      addAuditLog(`Kiểm kê ${id}: điều chỉnh ${diffs.length} sản phẩm`);
    } else {
      addAuditLog(`Kiểm kê ${id}: khớp hoàn toàn`);
    }

    showAlert('Đã lưu phiếu kiểm kê');
    showModal = false;
  }
</script>

<svelte:head><title>Kiểm kê - Poly WMS</title></svelte:head>

<div class="fade-in">
  <div class="h-col">
    <h1 class="page-title">Kiểm kê kho</h1>
  </div>

  <div class="toolbar">
    <span class="count">{$stocktakes.length} phiếu kiểm kê</span>
    <button class="btn btn-primary btn-sm" onclick={openStocktake}>
      <Icon name="stocktake" size={13} color="white" strokeWidth={2.5}/>
      Tạo phiếu kiểm kê
    </button>
  </div>

  {#if $stocktakes.length > 0}
    <div class="table-card">
      <table>
        <thead>
          <tr><th>Mã phiếu</th><th>Thời gian</th><th>Người tạo</th><th>Sai lệch</th><th>Trạng thái</th></tr>
        </thead>
        <tbody>
          {#each $stocktakes as st}
            {@const totalDiff = st.items.filter(i => i.diff !== 0).length}
            <tr class="row-anim">
              <td class="mono" style="font-weight:500">{st.id}</td>
              <td style="color:var(--text2);font-size:12px">{st.date}</td>
              <td>{st.createdBy}</td>
              <td>
                {#if totalDiff > 0}
                  <span class="badge badge-orange">{totalDiff} sản phẩm lệch</span>
                {:else}
                  <span class="badge badge-green">Khớp hoàn toàn</span>
                {/if}
              </td>
              <td><span class="badge badge-blue">{st.status === 'confirmed' ? 'Đã xác nhận' : 'Nháp'}</span></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="empty-state">
      <Icon name="stocktake" size={48} color="var(--text4)" strokeWidth={1}/>
      <p>Chưa có phiếu kiểm kê nào</p>
      <span>Nhấn "Tạo phiếu kiểm kê" để bắt đầu đếm hàng thực tế</span>
    </div>
  {/if}
</div>

<Modal show={showModal} title="Tạo phiếu kiểm kê" onclose={() => showModal = false} wide={true}>
  <div class="stocktake-info">Nhập số lượng thực tế cho từng sản phẩm. Hệ thống sẽ tự tính chênh lệch.</div>
  <div class="stocktake-table">
    <table>
      <thead>
        <tr><th>Sản phẩm</th><th>Hệ thống</th><th>Thực tế</th><th>Chênh lệch</th></tr>
      </thead>
      <tbody>
        {#each items as item, i}
          <tr>
            <td style="font-weight:500;font-size:13px">{item.productName}</td>
            <td class="mono" style="color:var(--text2)">{item.systemQty}</td>
            <td>
              <input
                type="number"
                class="stocktake-input"
                bind:value={item.actualQty}
                oninput={() => updateDiff(i)}
                min="0"
              />
            </td>
            <td>
              <span class="diff-value" class:negative={item.diff < 0} class:positive={item.diff > 0}>
                {item.diff > 0 ? '+' : ''}{item.diff}
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => showModal = false}>Huỷ</button>
    <button class="btn btn-primary" onclick={saveStocktake}>Xác nhận kiểm kê</button>
  </div>
</Modal>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 12px;
  }
  .empty-state p {
    font-size: 17px;
    font-weight: 600;
    color: var(--text2);
    margin-top: 8px;
  }
  .empty-state span {
    font-size: 13px;
    color: var(--text3);
  }

  .stocktake-info {
    font-size: 12px;
    color: var(--text3);
    margin-bottom: 16px;
    padding: 10px 14px;
    background: rgba(0,102,204,0.06);
    border-radius: var(--r-md);
    border: 0.5px solid rgba(0,102,204,0.12);
  }

  .stocktake-table {
    max-height: 400px;
    overflow-y: auto;
    border-radius: var(--r-md);
    border: 0.5px solid var(--separator-op);
  }
  .stocktake-table table {
    width: 100%;
  }
  .stocktake-table th {
    position: sticky;
    top: 0;
    background: var(--surface);
    z-index: 1;
  }
  .stocktake-table td {
    padding: 10px 16px;
  }
  .stocktake-table th {
    padding: 8px 16px;
    font-size: 10px;
  }

  .stocktake-input {
    width: 80px;
    padding: 6px 10px;
    border: 0.5px solid var(--glass-border);
    border-radius: var(--r-sm);
    font-size: 14px;
    font-family: var(--font);
    background: var(--glass-bg);
    color: var(--text);
    outline: none;
    font-variant-numeric: tabular-nums;
    transition: var(--transition-fast);
    text-align: center;
  }
  .stocktake-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0,102,204,0.15);
  }

  .diff-value {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-size: 14px;
    color: var(--text3);
  }
  .diff-value.negative { color: var(--red); }
  .diff-value.positive { color: var(--green); }

  .modal-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 24px;
  }
</style>
