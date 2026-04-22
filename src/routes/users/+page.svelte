<script lang="ts">
  import {
    users,
    auditLogs,
    showAlert,
    addAuditLog,
    type User,
  } from "$lib/stores";
  import Icon from "$lib/components/Icon.svelte";
  import Modal from "$lib/components/Modal.svelte";

  const ROLE_LABELS: Record<string, string> = {
    admin: "Quản trị",
    manager: "Quản lý",
    staff: "Nhân viên",
  };
  const DEFAULT_PASSWORD = "12345678";

  let showModal = $state(false);
  let editing = $state(false);
  let editingUsername = $state("");
  let form = $state<{
    username: string;
    name: string;
    role: "admin" | "manager" | "staff";
  }>({ username: "", name: "", role: "staff" });

  function openAdd() {
    editing = false;
    form = { username: "", name: "", role: "staff" };
    showModal = true;
  }

  function openEdit(u: User) {
    editing = true;
    editingUsername = u.username;
    form = { username: u.username, name: u.name, role: u.role };
    showModal = true;
  }

  function save() {
    form.username = form.username.trim();
    form.name = form.name.trim();
    if (!form.username) {
      showAlert("Vui lòng nhập Username.", "error");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,}$/.test(form.username)) {
      showAlert(
        "Username phải viết liền không dấu, không khoảng trắng và có ít nhất 3 ký tự.",
        "error",
      );
      return;
    }
    if (!form.name) {
      showAlert("Vui lòng nhập Họ tên đầy đủ.", "error");
      return;
    }

    if (editing) {
      users.update((list) =>
        list.map((u) =>
          u.username === editingUsername
            ? { ...u, name: form.name, role: form.role }
            : u,
        ),
      );
      addAuditLog(`Cập nhật user: ${form.name}`);
      showAlert("Đã cập nhật người dùng");
    } else {
      if ($users.some((u) => u.username === form.username)) {
        showAlert("Username đã tồn tại.", "error");
        return;
      }
      users.update((list) => [
        ...list,
        { ...form, active: true, password: DEFAULT_PASSWORD },
      ]);
      addAuditLog(`Thêm người dùng: ${form.name}`);
      showAlert("Đã thêm người dùng");
    }
    showModal = false;
  }

  function toggleUser(u: User) {
    users.update((list) =>
      list.map((x) =>
        x.username === u.username ? { ...x, active: !x.active } : x,
      ),
    );
    addAuditLog(`${u.active ? "Vô hiệu hoá" : "Kích hoạt"}: ${u.name}`);
    showAlert(u.active ? "Đã vô hiệu hoá tài khoản" : "Đã kích hoạt tài khoản");
  }

  function deleteUser(u: User) {
    if (
      u.role === "admin" &&
      $users.filter((x) => x.role === "admin" && x.active).length <= 1
    ) {
      showAlert("Không thể xóa admin cuối cùng.", "error");
      return;
    }
    if (confirm(`Xóa tài khoản "${u.name}" (${u.username})?`)) {
      users.update((list) => list.filter((x) => x.username !== u.username));
      addAuditLog(`Xóa user: ${u.name}`);
      showAlert("Đã xóa tài khoản");
    }
  }

  function resetPassword(u: User) {
    if (confirm(`Đặt lại mật khẩu cho "${u.name}" về ${DEFAULT_PASSWORD}?`)) {
      users.update((list) =>
        list.map((x) =>
          x.username === u.username ? { ...x, password: DEFAULT_PASSWORD } : x,
        ),
      );
      addAuditLog(`Reset mật khẩu: ${u.name}`);
      showAlert("Đã đặt lại mật khẩu");
    }
  }
</script>

<svelte:head><title>Người dùng - Poly WMS</title></svelte:head>

<div class="fade-in">
  <div class="h-col">
    <h1 class="page-title">Quản lý User</h1>
  </div>

  <div class="table-card" style="margin-bottom:16px">
    <div class="table-header">
      <h3>Danh sách người dùng</h3>
      <button class="btn btn-primary btn-sm" onclick={openAdd}>
        <Icon name="plus" size={13} color="white" strokeWidth={2.5} />
        Thêm
      </button>
    </div>
    <table>
      <thead
        ><tr
          ><th>Username</th><th>Họ tên</th><th>Vai trò</th><th>Trạng thái</th
          ><th></th></tr
        ></thead
      >
      <tbody>
        {#each $users as u}
          <tr>
            <td class="mono">{u.username}</td>
            <td style="font-weight:500">{u.name}</td>
            <td><span class="badge badge-blue">{ROLE_LABELS[u.role]}</span></td>
            <td
              ><span class="badge {u.active ? 'badge-green' : 'badge-gray'}"
                >{u.active ? "Hoạt động" : "Vô hiệu"}</span
              ></td
            >
            <td>
              <div class="action-btns">
                <button
                  class="icon-btn"
                  onclick={() => openEdit(u)}
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
                  class="icon-btn"
                  onclick={() => resetPassword(u)}
                  title="Đặt lại mật khẩu"
                >
                  <Icon
                    name="key"
                    size={14}
                    color="var(--text2)"
                    strokeWidth={2}
                  />
                </button>
                <button
                  class="icon-btn"
                  onclick={() => toggleUser(u)}
                  title={u.active ? "Vô hiệu hoá" : "Kích hoạt"}
                >
                  <Icon
                    name={u.active ? "lock" : "unlock"}
                    size={14}
                    color={u.active ? "var(--text2)" : "var(--green)"}
                    strokeWidth={2}
                  />
                </button>
                <button
                  class="icon-btn danger"
                  onclick={() => deleteUser(u)}
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
  </div>

  <div class="table-card">
    <div class="table-header"><h3>Nhật ký hoạt động</h3></div>
    <table>
      <thead
        ><tr><th>Thời gian</th><th>Người dùng</th><th>Hành động</th></tr></thead
      >
      <tbody>
        {#each $auditLogs as log}
          <tr>
            <td style="color:var(--text2);font-size:12px">{log.time}</td>
            <td class="mono">{log.user}</td>
            <td>{log.action}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Modal
  show={showModal}
  title={editing ? "Cập nhật người dùng" : "Thêm người dùng"}
  onclose={() => (showModal = false)}
>
  <div class="form-group">
    <label for="user-username">Username</label><input
      id="user-username"
      bind:value={form.username}
      placeholder="username..."
      readonly={editing}
    />
  </div>
  <div class="form-group">
    <label for="user-name">Họ tên</label><input
      id="user-name"
      bind:value={form.name}
      placeholder="Nguyễn Văn ..."
    />
  </div>
  <div class="form-group">
    <label for="user-role">Vai trò</label>
    <select id="user-role" bind:value={form.role}>
      <option value="staff">Nhân viên</option>
      <option value="manager">Quản lý</option>
      <option value="admin">Quản trị</option>
    </select>
  </div>
  <div class="modal-actions">
    <button class="btn btn-secondary" onclick={() => (showModal = false)}
      >Huỷ</button
    >
    <button class="btn btn-primary" onclick={save}>Lưu</button>
  </div>
</Modal>
