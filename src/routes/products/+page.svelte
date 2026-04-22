<script lang="ts">
  import {
    products,
    transactions,
    suppliers,
    categories as catStore,
    formatCurrency,
    showAlert,
    addAuditLog,
    getProductStatus,
    type Product,
  } from "$lib/stores";
  import Icon from "$lib/components/Icon.svelte";
  import Modal from "$lib/components/Modal.svelte";

  let showModal = $state(false);
  let showCatModal = $state(false);
  let newCatName = $state("");
  let showDetailModal = $state(false);
  let detailProduct = $state<Product | null>(null);

  // RQ18: Get last import date for a product
  function getLastImport(productName: string): string {
    const imports = $transactions.filter(
      (t) => t.type === "import" && t.product === productName,
    );
    return imports.length > 0 ? imports[0].date : "Chưa có";
  }

  // RQ18: Get supplier for a product by supplierId
  function getSupplier(p: Product) {
    if (!p.supplierId) return null;
    return $suppliers.find((s) => s.id === p.supplierId) || null;
  }

  let editing = $state(false);
  let searchQuery = $state("");
  let form = $state<Product>({
    id: "",
    name: "",
    category: "Điện tử",
    qty: 0,
    price: 0,
    min: 10,
    supplierId: "",
  });

  let selectedCategory = $state("Tất cả");

  let filterCategories = $derived(["Tất cả", ...$catStore]);

  let filtered = $derived(
    $products.filter((p) => {
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === "Tất cả" || p.category === selectedCategory;
      return matchQuery && matchCat;
    }),
  );

  function openAdd() {
    editing = false;
    form = {
      id: `SP${String($products.length + 1).padStart(3, "0")}`,
      name: "",
      category: $catStore[0] || "",
      qty: 0,
      price: 0,
      min: 10,
      supplierId: "",
    };
    showModal = true;
  }
  function openEdit(p: Product) {
    editing = true;
    form = { ...p };
    showModal = true;
  }
  function save() {
    form.id = form.id.trim();
    form.name = form.name.trim();
    if (!form.id) {
      showAlert("Vui lòng nhập mã sản phẩm.", "error");
      return;
    }
    if (!form.name) {
      showAlert("Vui lòng nhập tên sản phẩm.", "error");
      return;
    }
    if (form.qty === null || form.qty === undefined || form.qty < 0) {
      showAlert("Số lượng phải là số lớn hơn hoặc bằng 0.", "error");
      return;
    }
    if (form.price === null || form.price === undefined || form.price < 0) {
      showAlert("Đơn giá phải là số lớn hơn hoặc bằng 0.", "error");
      return;
    }
    if (form.min === null || form.min === undefined || form.min < 1) {
      showAlert("Tồn tối thiểu phải là số lớn hơn hoặc bằng 1.", "error");
      return;
    }

    if (!editing && $products.some((p) => p.id === form.id)) {
      showAlert("Thất bại: Mã sản phẩm đã tồn tại!", "error");
      return;
    }
    if (editing) {
      products.update((list) =>
        list.map((p) => (p.id === form.id ? { ...form } : p)),
      );
      addAuditLog(`Cập nhật: ${form.name}`);
      showAlert("Đã cập nhật sản phẩm");
    } else {
      products.update((list) => [...list, { ...form }]);
      addAuditLog(`Thêm SP: ${form.name}`);
      showAlert("Đã thêm sản phẩm mới");
    }
    showModal = false;
  }
  function remove(p: Product) {
    if (confirm(`Xóa "${p.name}"?`)) {
      products.update((list) => list.filter((x) => x.id !== p.id));
      addAuditLog(`Xóa SP: ${p.name}`);
      showAlert("Đã xóa sản phẩm");
    }
  }

  function addCategory() {
    const name = newCatName.trim();
    if (!name) return;
    if ($catStore.includes(name)) {
      showAlert("Danh mục này đã tồn tại", "error");
      return;
    }
    catStore.update((list) => [...list, name]);
    newCatName = "";
  }

  let editingCat = $state<{ old: string; newName: string } | null>(null);

  function startEditCat(cat: string) {
    editingCat = { old: cat, newName: cat };
  }

  function saveEditCat() {
    if (!editingCat) return;
    const newName = editingCat.newName.trim();
    if (!newName) {
      showAlert("Tên danh mục không được trống", "error");
      return;
    }
    if (newName !== editingCat.old && $catStore.includes(newName)) {
      showAlert("Danh mục này đã tồn tại", "error");
      return;
    }
    const oldName = editingCat.old;
    catStore.update((list) => list.map((c) => (c === oldName ? newName : c)));
    // Update products that use the old category name
    products.update((list) =>
      list.map((p) =>
        p.category === oldName ? { ...p, category: newName } : p,
      ),
    );
    editingCat = null;
  }

  function deleteCategory(cat: string) {
    if ($products.some((p) => p.category === cat)) {
      showAlert("Không thể xóa danh mục đang có sản phẩm", "error");
      return;
    }
    catStore.update((list) => list.filter((c) => c !== cat));
  }
</script>

<svelte:head><title>Sản phẩm - Poly WMS</title></svelte:head>

<div class="fade-in">
  <div class="h-col">
    <h1 class="page-title">Danh sách Sản phẩm</h1>
  </div>
  <div class="toolbar">
    <div style="display:flex;gap:12px;flex:1;max-width:500px;">
      <div class="search-wrap" style="flex:1">
        <Icon name="search" size={13} color="var(--text3)" strokeWidth={2.5} />
        <input
          class="search-input"
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          bind:value={searchQuery}
        />
      </div>
      <select class="apple-select" bind:value={selectedCategory}>
        {#each filterCategories as cat}
          <option value={cat}>{cat}</option>
        {/each}
      </select>
      <button
        class="icon-btn"
        onclick={() => (showCatModal = true)}
        title="Quản lý danh mục"
        style="background:var(--bg-card); border:0.5px solid var(--separator-op); width:32px; height:32px"
      >
        <Icon name="edit" size={14} color="var(--text2)" />
      </button>
    </div>
    <button class="btn btn-primary btn-sm" onclick={openAdd}>
      <Icon name="plus" size={13} color="white" strokeWidth={2.5} />
      Thêm sản phẩm
    </button>
  </div>

  <div class="table-card">
    <table>
      <thead>
        <tr
          ><th>Mã SP</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Tồn kho</th
          ><th>Đơn giá</th><th>Trạng thái</th><th></th></tr
        >
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
                <button
                  class="icon-btn"
                  onclick={() => {
                    detailProduct = p;
                    showDetailModal = true;
                  }}
                  title="Xem chi tiết"
                >
                  <Icon
                    name="search"
                    size={14}
                    color="var(--text2)"
                    strokeWidth={2}
                  />
                </button>
                <button
                  class="icon-btn"
                  onclick={() => openEdit(p)}
                  title="Sửa"
                >
                  <Icon
                    name="edit"
                    size={14}
                    color="var(--accent)"
                    strokeWidth={2}
                  />
                </button>
                <button
                  class="icon-btn danger"
                  onclick={() => remove(p)}
                  title="Xóa"
                >
                  <Icon
                    name="trash"
                    size={14}
                    color="var(--red)"
                    strokeWidth={2}
                  />
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

<Modal
  show={showModal}
  title={editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
  onclose={() => (showModal = false)}
>
  <div class="form-group">
    <label for="prod-id">Mã SP</label><input
      id="prod-id"
      bind:value={form.id}
      readonly={editing}
    />
  </div>
  <div class="form-group">
    <label for="prod-name">Tên sản phẩm</label><input
      id="prod-name"
      bind:value={form.name}
      placeholder="Tên sản phẩm..."
    />
  </div>
  <div class="form-group">
    <label for="prod-cat">Danh mục</label>
    <select id="prod-cat" bind:value={form.category}>
      {#each $catStore as cat}
        <option value={cat}>{cat}</option>
      {/each}
    </select>
  </div>
  <div class="form-grid">
    <div class="form-group">
      <label for="prod-qty">Số lượng</label><input
        id="prod-qty"
        type="number"
        bind:value={form.qty}
        min="0"
      />
    </div>
    <div class="form-group">
      <label for="prod-price">Đơn giá (₫)</label><input
        id="prod-price"
        type="number"
        bind:value={form.price}
        min="0"
      />
    </div>
    <div class="form-group">
      <label for="prod-min">Tồn tối thiểu</label><input
        id="prod-min"
        type="number"
        bind:value={form.min}
        min="1"
      />
    </div>
  </div>
  <div class="form-group">
    <label for="prod-supplier">Nhà cung cấp</label>
    <select id="prod-supplier" bind:value={form.supplierId}>
      <option value="">-- Chọn NCC --</option>
      {#each $suppliers as s}
        <option value={s.id}>{s.name} ({s.phone})</option>
      {/each}
    </select>
  </div>
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => (showModal = false)}
      >Huỷ</button
    >
    <button class="btn btn-primary" onclick={save}>Lưu</button>
  </div>
</Modal>

<Modal
  show={showCatModal}
  title="Quản lý danh mục"
  onclose={() => (showCatModal = false)}
>
  <div class="form-group" style="display:flex; gap:8px">
    <input
      bind:value={newCatName}
      placeholder="Tên danh mục mới..."
      onkeydown={(e) => e.key === "Enter" && addCategory()}
    />
    <button
      class="btn btn-primary"
      onclick={addCategory}
      style="width:auto; padding:0 16px">Thêm</button
    >
  </div>
  <div style="max-height: 200px; overflow-y: auto; margin-top: 16px">
    {#each $catStore as cat}
      <div
        style="display:flex; justify-content:space-between; align-items:center; padding: 8px 0; border-bottom: 0.5px solid var(--separator-op)"
      >
        {#if editingCat && editingCat.old === cat}
          <input
            bind:value={editingCat.newName}
            onkeydown={(e) => e.key === "Enter" && saveEditCat()}
            style="flex:1; margin-right:8px"
          />
          <div class="action-btns">
            <button class="icon-btn" onclick={saveEditCat} title="Lưu">
              <Icon name="check" size={14} color="var(--green)" />
            </button>
            <button
              class="icon-btn"
              onclick={() => (editingCat = null)}
              title="Huỷ"
            >
              <Icon name="x" size={14} color="var(--text2)" />
            </button>
          </div>
        {:else}
          <span style="font-size: 14px">{cat}</span>
          <div class="action-btns">
            <button
              class="icon-btn"
              onclick={() => startEditCat(cat)}
              title="Sửa"
            >
              <Icon name="edit" size={12} color="var(--accent)" />
            </button>
            <button
              class="icon-btn danger"
              onclick={() => deleteCategory(cat)}
              title="Xóa"
            >
              <Icon name="trash" size={12} color="var(--red)" />
            </button>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => (showCatModal = false)}
      >Đóng</button
    >
  </div>
</Modal>

<!-- RQ18: Product Detail Modal -->
<Modal
  show={showDetailModal}
  title="Chi tiết sản phẩm"
  onclose={() => (showDetailModal = false)}
>
  {#if detailProduct}
    {@const st = getProductStatus(detailProduct)}
    {@const supplier = getSupplier(detailProduct)}
    <div class="detail-grid">
      <div class="detail-row">
        <span class="detail-label">Mã SP</span><span class="mono"
          >{detailProduct.id}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">Tên sản phẩm</span><span
          style="font-weight:500">{detailProduct.name}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">Danh mục</span><span
          >{detailProduct.category}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">Số lượng tồn</span><span class="mono"
          >{detailProduct.qty}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">Đơn giá</span><span class="mono"
          >{formatCurrency(detailProduct.price)}₫</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">Tồn tối thiểu</span><span class="mono"
          >{detailProduct.min}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">Trạng thái</span><span class="badge {st.cls}"
          >{st.text}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">Nhà cung cấp</span><span
          >{supplier ? supplier.name : "Chưa liên kết"}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">SĐT NCC</span><span
          >{supplier ? supplier.phone : "—"}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">Ngày nhập gần nhất</span><span
          >{getLastImport(detailProduct.name)}</span
        >
      </div>
    </div>
    <div class="modal-actions">
      <button
        class="btn btn-secondary"
        onclick={() => (showDetailModal = false)}>Đóng</button
      >
    </div>
  {/if}
</Modal>

<style>
  .detail-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 0.5px solid var(--separator-op);
  }
  .detail-label {
    color: var(--text2);
    font-size: 13px;
  }

  .apple-select {
    width: 140px;
    font-size: 13px;
    padding: 6px 10px;
    background: var(--bg-card);
    border: 0.5px solid var(--separator-op);
    border-radius: var(--r-md);
    color: var(--text);
    font-family: var(--font);
    outline: none;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    appearance: auto;
  }
  .apple-select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-op);
  }
</style>
