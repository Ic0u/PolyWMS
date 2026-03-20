<script lang="ts">
  import { suppliers, showAlert, addAuditLog, type Supplier } from '$lib/stores';
  import Icon from '$lib/components/Icon.svelte';
  import Modal from '$lib/components/Modal.svelte';

  let showModal = $state(false);
  let editing = $state(false);
  let form = $state<Supplier>({ id:'', name:'', contact:'', email:'', address:'', phone:'', products:0 });

  function openAdd() {
    editing = false;
    form = { id: `NCC${String($suppliers.length+1).padStart(2,'0')}`, name:'', contact:'', email:'', address:'', phone:'', products:0 };
    showModal = true;
  }
  function openEdit(s: Supplier) { editing=true; form={...s}; showModal=true; }
  function save() {
    if (!form.name) { showAlert('Vui lòng nhập tên nhà cung cấp', 'error'); return; }
    if (editing) {
      suppliers.update(list => list.map(s => s.id===form.id ? {...form} : s));
      addAuditLog(`Cập nhật NCC: ${form.name}`);
      showAlert('Đã cập nhật nhà cung cấp');
    } else {
      suppliers.update(list => [...list, {...form}]);
      addAuditLog(`Thêm NCC: ${form.name}`);
      showAlert('Đã thêm nhà cung cấp');
    }
    showModal = false;
  }
</script>

<svelte:head><title>Nhà cung cấp - Poly WMS</title></svelte:head>

<div class="fade-in">
  <div class="h-col">
    <h1 class="page-title">Nhà cung cấp</h1>
  </div>

  <div class="toolbar">
    <span class="count">{$suppliers.length} nhà cung cấp</span>
    <button class="btn btn-primary btn-sm" onclick={openAdd}>
      <Icon name="plus" size={13} color="white" strokeWidth={2.5}/>
      Thêm
    </button>
  </div>

  <div class="table-card">
    <table>
      <thead><tr><th>Mã</th><th>Tên nhà cung cấp</th><th>Người liên hệ</th><th>Điện thoại</th><th>Email</th><th>Địa chỉ</th><th></th></tr></thead>
      <tbody>
        {#each $suppliers as s}
          <tr>
            <td class="mono">{s.id}</td>
            <td style="font-weight:500">{s.name}</td>
            <td style="color:var(--text2)">{s.contact}</td>
            <td class="mono">{s.phone}</td>
            <td style="color:var(--text2)">{s.email}</td>
            <td style="color:var(--text3);font-size:12px;max-width:200px" class="ellipsis">{s.address}</td>
            <td style="text-align:right">
              <button class="icon-btn" onclick={() => openEdit(s)}>
                <Icon name="edit" size={14} color="var(--accent)" strokeWidth={2}/>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Modal show={showModal} title={editing ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'} onclose={() => showModal=false}>
  <div class="form-group"><label>Mã NCC</label><input bind:value={form.id} readonly={editing}/></div>
  <div class="form-group"><label>Tên nhà cung cấp</label><input bind:value={form.name} placeholder="Tên NCC..."/></div>
  <div class="form-grid" style="grid-template-columns:1fr 1fr">
    <div class="form-group"><label>Người liên hệ</label><input bind:value={form.contact} placeholder="Họ tên..."/></div>
    <div class="form-group"><label>Điện thoại</label><input bind:value={form.phone} placeholder="Số ĐT..."/></div>
  </div>
  <div class="form-group"><label>Email</label><input bind:value={form.email} placeholder="email@example.com"/></div>
  <div class="form-group"><label>Địa chỉ</label><input bind:value={form.address} placeholder="Địa chỉ..."/></div>
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => showModal=false}>Huỷ</button>
    <button class="btn btn-primary" onclick={save}>Lưu</button>
  </div>
</Modal>
