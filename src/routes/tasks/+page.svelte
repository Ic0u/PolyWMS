<script lang="ts">
  import { tasks, users, currentUser, currentRole, showAlert, addAuditLog, type Task } from '$lib/stores';
  import { get } from 'svelte/store';
  import Icon from '$lib/components/Icon.svelte';
  import Modal from '$lib/components/Modal.svelte';

  let showModal = $state(false);
  let filterStatus = $state<'all' | 'pending' | 'in_progress' | 'done'>('all');

  // Resolve current user's username
  let currentUsername = $derived(() => {
    const u = get(users).find(u => u.name === $currentUser);
    return u?.username ?? '';
  });

  let isManager = $derived($currentRole === 'manager' || $currentRole === 'admin');

  // Staff see only tasks assigned to them; managers/admins see all
  let visibleTasks = $derived(
    $tasks
      .filter(t => isManager || t.assignee === currentUsername())
      .filter(t => filterStatus === 'all' || t.status === filterStatus)
  );

  let staffList = $derived(get(users).filter(u => u.role === 'staff' && u.active));

  // New task form
  let form = $state<Omit<Task, 'id' | 'createdAt' | 'assignedBy'>>({
    title: '', assignee: '', priority: 'medium', status: 'pending', dueDate: '', note: ''
  });

  function openNew() {
    form = { title: '', assignee: staffList[0]?.username ?? '', priority: 'medium', status: 'pending', dueDate: '', note: '' };
    showModal = true;
  }

  function save() {
    form.title = form.title.trim();
    if (!form.title) { showAlert('Vui lòng nhập tên công việc.', 'error'); return; }
    if (!form.assignee) { showAlert('Vui lòng chọn nhân sự đảm nhận.', 'error'); return; }
    if (form.dueDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(form.dueDate.trim())) { showAlert('Hạn hoàn thành (nếu có) phải theo định dạng DD/MM/YYYY.', 'error'); return; }
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const newTask: Task = {
      id: `CV${String($tasks.length + 1).padStart(3, '0')}`,
      title: form.title,
      assignee: form.assignee,
      assignedBy: currentUsername(),
      priority: form.priority,
      status: 'pending',
      dueDate: form.dueDate,
      createdAt: dateStr,
      note: form.note
    };
    tasks.update(list => [newTask, ...list]);
    addAuditLog(`Phân công ${form.title} cho ${form.assignee}`);
    showAlert('Đã giao công việc mới');
    showModal = false;
  }

  function updateStatus(task: Task, newStatus: 'pending' | 'in_progress' | 'done') {
    tasks.update(list => list.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    const labels: Record<string, string> = { pending: 'Chờ', in_progress: 'Đang làm', done: 'Hoàn thành' };
    addAuditLog(`Cập nhật CV ${task.title}: ${labels[newStatus]}`);
    showAlert(`Đã cập nhật trạng thái`);
  }

  function removeTask(task: Task) {
    if (confirm(`Xóa "${task.title}"?`)) {
      tasks.update(list => list.filter(t => t.id !== task.id));
      addAuditLog(`Xóa CV: ${task.title}`);
      showAlert('Đã xóa công việc');
    }
  }

  function getUserName(username: string): string {
    const u = get(users).find(u => u.username === username);
    return u?.name ?? username;
  }

  const PRIORITY_BADGE: Record<string, { cls: string; label: string }> = {
    high: { cls: 'badge-red', label: 'Cao' },
    medium: { cls: 'badge-orange', label: 'Trung bình' },
    low: { cls: 'badge-gray', label: 'Thấp' },
  };
  const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
    pending: { cls: 'badge-gray', label: 'Chờ xử lý' },
    in_progress: { cls: 'badge-blue', label: 'Đang làm' },
    done: { cls: 'badge-green', label: 'Hoàn thành' },
  };
</script>

<svelte:head><title>Công việc - Poly WMS</title></svelte:head>

<div class="fade-in">
  <div class="h-col">
    <h1 class="page-title">Phân công công việc</h1>
  </div>

  <div class="toolbar">
    <div class="seg-control">
      <button class="seg-btn" class:active={filterStatus === 'all'} onclick={() => filterStatus = 'all'}>Tất cả</button>
      <button class="seg-btn" class:active={filterStatus === 'pending'} onclick={() => filterStatus = 'pending'}>Chờ xử lý</button>
      <button class="seg-btn" class:active={filterStatus === 'in_progress'} onclick={() => filterStatus = 'in_progress'}>Đang làm</button>
      <button class="seg-btn" class:active={filterStatus === 'done'} onclick={() => filterStatus = 'done'}>Hoàn thành</button>
    </div>
    {#if isManager}
      <button class="btn btn-primary btn-sm" onclick={openNew}>
        <Icon name="plus" size={13} color="white" strokeWidth={2.5}/>
        Giao việc
      </button>
    {/if}
  </div>

  <!-- Task Cards -->
  <div class="task-grid">
    {#each visibleTasks as task, i}
      {@const pri = PRIORITY_BADGE[task.priority]}
      {@const sta = STATUS_BADGE[task.status]}
      <div class="task-card" class:done={task.status === 'done'} style="animation-delay:{i * 40}ms">
        <div class="task-top">
          <span class="badge {pri.cls}">{pri.label}</span>
          <span class="badge {sta.cls}">{sta.label}</span>
        </div>
        <h4 class="task-title">{task.title}</h4>
        {#if task.note}
          <p class="task-note">{task.note}</p>
        {/if}
        <div class="task-meta">
          <span><Icon name="users" size={11} color="var(--text4)" strokeWidth={2}/> {getUserName(task.assignee)}</span>
          <span>Hạn: {task.dueDate || '—'}</span>
        </div>
        <div class="task-meta" style="margin-top:4px">
          <span style="color:var(--text4)">Giao bởi: {getUserName(task.assignedBy)}</span>
        </div>
        <div class="task-actions">
          {#if task.status === 'pending'}
            <button class="btn btn-sm btn-secondary" onclick={() => updateStatus(task, 'in_progress')}>Bắt đầu</button>
          {/if}
          {#if task.status === 'in_progress'}
            <button class="btn btn-sm btn-secondary" onclick={() => updateStatus(task, 'done')}>
              <Icon name="check" size={12} color="var(--text)" strokeWidth={2.5}/>
              Hoàn thành
            </button>
          {/if}
          {#if task.status === 'done'}
            <button class="btn btn-sm btn-secondary" onclick={() => updateStatus(task, 'pending')}>Mở lại</button>
          {/if}
          {#if isManager}
            <button class="icon-btn danger" onclick={() => removeTask(task)} title="Xóa">
              <Icon name="trash" size={13} color="var(--red)" strokeWidth={2}/>
            </button>
          {/if}
        </div>
      </div>
    {:else}
      <div class="empty-state">
        <Icon name="tasks" size={40} color="var(--text4)" strokeWidth={1.5}/>
        <p>{isManager ? 'Chưa có công việc nào. Nhấn "Giao việc" để bắt đầu!' : 'Không có công việc nào cho bạn.'}</p>
      </div>
    {/each}
  </div>
</div>

<!-- New Task Modal -->
<Modal show={showModal} title="Giao công việc mới" onclose={() => showModal = false}>
  <div class="form-group">
    <label for="task-title">Tên công việc</label>
    <input id="task-title" bind:value={form.title} placeholder="VD: Kiểm kê lô hàng Apple kho A" />
  </div>
  <div class="form-grid" style="grid-template-columns:1fr 1fr">
    <div class="form-group">
      <label for="task-assignee">Giao cho</label>
      <select id="task-assignee" bind:value={form.assignee}>
        {#each staffList as s}
          <option value={s.username}>{s.name}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="task-priority">Độ ưu tiên</label>
      <select id="task-priority" bind:value={form.priority}>
        <option value="high">Cao</option>
        <option value="medium">Trung bình</option>
        <option value="low">Thấp</option>
      </select>
    </div>
  </div>
  <div class="form-group">
    <label for="task-due">Hạn hoàn thành</label>
    <input id="task-due" bind:value={form.dueDate} placeholder="VD: 25/03/2026" />
  </div>
  <div class="form-group">
    <label for="task-note">Ghi chú</label>
    <input id="task-note" bind:value={form.note} placeholder="Ghi chú thêm (không bắt buộc)" />
  </div>
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => showModal = false}>Huỷ</button>
    <button class="btn btn-primary" onclick={save}>Giao việc</button>
  </div>
</Modal>

<style>
  /* macOS Segmented Control */
  .seg-control {
    display: inline-flex;
    background: var(--glass-bg);
    border-radius: var(--r-md);
    padding: 2px;
    border: 0.5px solid var(--separator-op);
  }
  .seg-btn {
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 500;
    font-family: var(--font);
    background: none;
    border: none;
    color: var(--text3);
    cursor: pointer;
    border-radius: calc(var(--r-md) - 2px);
    transition: all 0.2s var(--spring);
    letter-spacing: -0.01em;
  }
  .seg-btn.active {
    background: var(--accent);
    color: #fff;
    box-shadow: 0 1px 4px rgba(0,102,204,0.25);
  }
  .seg-btn:hover:not(.active) { color: var(--text); }

  /* Task Grid */
  .task-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-top: 8px;
  }
  .task-card {
    background: var(--glass-bg);
    border-radius: var(--r-2xl);
    padding: 20px;
    border: none;
    box-shadow: 0 4px 14px rgba(0,0,0,0.1);
    transition: transform 0.3s var(--spring);
    animation: fadeSlideUp 0.35s var(--spring) both;
  }
  .task-card:hover { transform: translateY(-2px); }
  .task-card.done { opacity: 0.6; }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .task-top {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
  }
  .task-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.02em;
    margin-bottom: 6px;
    line-height: 1.3;
  }
  .task-note {
    font-size: 12px;
    color: var(--text3);
    margin-bottom: 12px;
    line-height: 1.4;
  }
  .task-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text3);
  }
  .task-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .task-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 0.5px solid var(--separator-op);
  }
  .badge-orange {
    background: rgba(255,159,10,0.12);
    color: #FF9F0A;
  }
  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--text3);
  }
  .empty-state p {
    margin-top: 12px;
    font-size: 13px;
  }
</style>
