<script lang="ts">
  import { products, transactions, showAlert, addAuditLog, users, currentUser } from '$lib/stores';
  import { get } from 'svelte/store';
  import Icon from '$lib/components/Icon.svelte';
  import Modal from '$lib/components/Modal.svelte';

  let currentUsername = $derived(() => {
    const u = get(users).find(u => u.name === $currentUser);
    return u?.username ?? '';
  });

  let showModal = $state(false);
  let txType = $state<'import' | 'export'>('import');
  let txProduct = $state('');
  let txQty = $state(1);
  let txNote = $state('');

  function openTx(type: 'import' | 'export') {
    txType = type;
    txProduct = $products[0]?.name ?? '';
    txQty = 1;
    txNote = '';
    showModal = true;
  }

  function saveTx() {
    if (txQty <= 0) { showAlert('Số lượng phải lớn hơn 0', 'error'); return; }
    const p = $products.find(x => x.name === txProduct);
    if (txType === 'export' && p && p.qty < txQty) { showAlert('Không đủ hàng trong kho', 'error'); return; }
    if (p) products.update(list => list.map(x => x.name === txProduct ? { ...x, qty: txType === 'import' ? x.qty + txQty : x.qty - txQty } : x));
    transactions.update(list => [{
      date: new Date().toLocaleString('vi-VN'),
      type: txType, product: txProduct, qty: txQty, note: txNote || '—', user: currentUsername()
    }, ...list]);
    addAuditLog(`${txType === 'import' ? 'Nhập' : 'Xuất'} kho: ${txQty}x ${txProduct}`);
    showAlert(txType === 'import' ? 'Nhập kho thành công' : 'Xuất kho thành công');
    showModal = false;
  }
</script>

<svelte:head><title>Nhập/Xuất kho</title></svelte:head>

<div class="fade-in">
    <div class="h-col">
      <h1 class="page-title">Nhập/Xuất kho</h1>
    </div>
  <div class="action-row">
    <button class="tx-btn" onclick={() => openTx('import')}>
      <Icon name="import" size={16} color="var(--green)" strokeWidth={2}/>
      <div>
        <div class="tx-btn-title">Nhập kho</div>
        <div class="tx-btn-sub">Thêm hàng vào kho</div>
      </div>
    </button>
    <button class="tx-btn" onclick={() => openTx('export')}>
      <Icon name="export" size={16} color="var(--accent)" strokeWidth={2}/>
      <div>
        <div class="tx-btn-title">Xuất kho</div>
        <div class="tx-btn-sub">Lấy hàng từ kho</div>
      </div>
    </button>
  </div>

  <div class="table-card">
    <div class="table-header">
      <h3>Lịch sử giao dịch</h3>
      <span class="count">{$transactions.length} giao dịch</span>
    </div>
    <table>
      <thead>
        <tr><th>Thời gian</th><th>Loại</th><th>Sản phẩm</th><th>Số lượng</th><th>Người tạo</th><th>Ghi chú</th></tr>
      </thead>
      <tbody>
        {#each $transactions as tx, i}
          <tr class="row-anim" style="animation-delay:{i * 20}ms">
            <td style="color:var(--text2);font-size:12px;white-space:nowrap">{tx.date}</td>
            <td>
              <span class="tx-badge {tx.type}">
                <Icon name={tx.type === 'import' ? 'import' : 'export'} size={11} strokeWidth={2.5} color={tx.type === 'import' ? 'var(--green)' : 'var(--accent)'}/>
                {tx.type === 'import' ? 'Nhập' : 'Xuất'}
              </span>
            </td>
            <td style="font-weight:500">{tx.product}</td>
            <td class="qty-cell {tx.type}" style="font-weight:600;font-variant-numeric:tabular-nums">{tx.type === 'import' ? '+' : '-'}{tx.qty}</td>
            <td style="color:var(--text3)">{tx.user || '—'}</td>
            <td style="color:var(--text3)">{tx.note}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Modal show={showModal} title={txType === 'import' ? 'Nhập kho' : 'Xuất kho'} onclose={() => showModal = false}>
  <div class="form-group">
    <label for="tx-product">Sản phẩm</label>
    <select id="tx-product" bind:value={txProduct}>
      {#each $products as p}<option>{p.name}</option>{/each}
    </select>
  </div>
  <div class="form-group"><label for="tx-qty">Số lượng</label><input id="tx-qty" type="number" bind:value={txQty} min="1" /></div>
  <div class="form-group"><label for="tx-note">Ghi chú</label><input id="tx-note" bind:value={txNote} placeholder="Lý do nhập/xuất..." /></div>
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => showModal = false}>Huỷ</button>
    <button class="btn btn-primary" onclick={saveTx}>Xác nhận</button>
  </div>
</Modal>
