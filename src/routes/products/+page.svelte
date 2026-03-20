<script lang="ts">
  import { products, formatCurrency, showAlert, addAuditLog, getProductStatus, type Product } from '$lib/stores';
  import Icon from '$lib/components/Icon.svelte';
  import Modal from '$lib/components/Modal.svelte';

  let showModal = $state(false);
  let editing = $state(false);
  let searchQuery = $state('');
  let form = $state<Product>({ id: '', name: '', category: 'Điện tử', qty: 0, price: 0, min: 10 });

  let filtered = $derived(
    searchQuery
      ? $products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()))
      : $products
  );

  function openAdd() {
    editing = false;
    form = { id: `SP${String($products.length + 1).padStart(3, '0')}`, name: '', category: 'Điện tử', qty: 0, price: 0, min: 10 };
    showModal = true;
  }
  function openEdit(p: Product) { editing = true; form = { ...p }; showModal = true; }
  function save() {
    if (!form.name) { showAlert('Vui lòng nhập tên sản phẩm', 'error'); return; }
    if (editing) {
      products.update(list => list.map(p => p.id === form.id ? { ...form } : p));
      addAuditLog(`Cập nhật: ${form.name}`);
      showAlert('Đã cập nhật sản phẩm');
    } else {
      products.update(list => [...list, { ...form }]);
      addAuditLog(`Thêm SP: ${form.name}`);
      showAlert('Đã thêm sản phẩm mới');
    }
    showModal = false;
  }
  function remove(p: Product) {
    if (confirm(`Xóa "${p.name}"?`)) {
      products.update(list => list.filter(x => x.id !== p.id));
      addAuditLog(`Xóa SP: ${p.name}`);
      showAlert('Đã xóa sản phẩm');
    }
  }
</script>

<svelte:head><title>Sản phẩm - Opus WMS</title></svelte:head>

<div class="fade-in">
    <div class="h-col">
      <h1 class="page-title">Danh sách Sản phẩm</h1>
    </div>
  <div class="toolbar">
    <div class="search-wrap">
      <Icon name="search" size={13} color="var(--text3)" strokeWidth={2.5}/>
      <input class="search-input" type="text" placeholder="Tìm kiếm sản phẩm..." bind:value={searchQuery} />
    </div>
    <button class="btn btn-primary btn-sm" onclick={openAdd}>
      <Icon name="plus" size={13} color="white" strokeWidth={2.5}/>
      Thêm sản phẩm
    </button>
  </div>

  <div class="table-card">
    <table>
      <thead>
        <tr><th>Mã SP</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Tồn kho</th><th>Đơn giá</th><th>Trạng thái</th><th></th></tr>
      </thead>
      <tbody>
        {#each filtered as p}
          {@const st = getProductStatus(p)}
          <tr class="row-anim">
            <td class="mono">{p.id}</td>
            <td style="font-weight:500">{p.name}</td>
            <td style="color:var(--text2)">{p.category}</td>
            <td class="mono">{p.qty}</td>
            <td class="mono">{formatCurrency(p.price)}₫</td>
            <td><span class="badge {st.cls}">{st.text}</span></td>
            <td>
              <div class="action-btns">
                <button class="icon-btn" onclick={() => openEdit(p)} title="Sửa">
                  <Icon name="edit" size={14} color="var(--accent)" strokeWidth={2}/>
                </button>
                <button class="icon-btn danger" onclick={() => remove(p)} title="Xóa">
                  <Icon name="trash" size={14} color="var(--red)" strokeWidth={2}/>
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="table-footer">{filtered.length} sản phẩm</div>
  </div>
</div>

<Modal show={showModal} title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} onclose={() => showModal = false}>
  <div class="form-group"><label>Mã SP</label><input bind:value={form.id} readonly={editing} /></div>
  <div class="form-group"><label>Tên sản phẩm</label><input bind:value={form.name} placeholder="Tên sản phẩm..." /></div>
  <div class="form-group">
    <label>Danh mục</label>
    <select bind:value={form.category}>
      <option>Điện tử</option><option>Điện thoại</option><option>Phụ kiện</option>
    </select>
  </div>
  <div class="form-grid">
    <div class="form-group"><label>Số lượng</label><input type="number" bind:value={form.qty} min="0" /></div>
    <div class="form-group"><label>Đơn giá (₫)</label><input type="number" bind:value={form.price} min="0" /></div>
    <div class="form-group"><label>Tồn tối thiểu</label><input type="number" bind:value={form.min} min="1" /></div>
  </div>
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => showModal = false}>Huỷ</button>
    <button class="btn btn-primary" onclick={save}>Lưu</button>
  </div>
</Modal>
