<script lang="ts">
  import { auditLogs } from '$lib/stores';
  import Icon from '$lib/components/Icon.svelte';

  let searchQuery = $state('');
  let filterCategory = $state<'all' | 'inventory' | 'user'>('all');

  const INVENTORY_KEYWORDS = ['nhập kho', 'xuất kho', 'cập nhật giá', 'kiểm kê', 'tồn kho', 'sản phẩm', 'hàng'];
  const USER_KEYWORDS = ['thêm user', 'xóa user', 'kích hoạt', 'vô hiệu', 'đổi vai trò', 'tạo tài khoản', 'người dùng'];

  function categorize(action: string): 'inventory' | 'user' | 'other' {
    const lower = action.toLowerCase();
    if (USER_KEYWORDS.some(kw => lower.includes(kw))) return 'user';
    if (INVENTORY_KEYWORDS.some(kw => lower.includes(kw))) return 'inventory';
    return 'other';
  }

  let filtered = $derived(
    $auditLogs
      .filter(l => {
        if (filterCategory === 'all') return true;
        const cat = categorize(l.action);
        if (filterCategory === 'inventory') return cat === 'inventory' || cat === 'other';
        if (filterCategory === 'user') return cat === 'user';
        return true;
      })
      .filter(l =>
        searchQuery.trim() === '' ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.user.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );
</script>

<svelte:head><title>Nhật ký - Poly WMS</title></svelte:head>

<div class="fade-in">
  <div class="h-col">
    <h1 class="page-title">Nhật ký hoạt động</h1>
  </div>

  <div class="toolbar">
    <div class="seg-control">
      <button class="seg-btn" class:active={filterCategory === 'all'} onclick={() => filterCategory = 'all'}>Tất cả</button>
      <button class="seg-btn" class:active={filterCategory === 'inventory'} onclick={() => filterCategory = 'inventory'}>Giao dịch hàng hoá</button>
      <button class="seg-btn" class:active={filterCategory === 'user'} onclick={() => filterCategory = 'user'}>Thao tác người dùng</button>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <div class="search-wrap">
        <Icon name="search" size={13} color="var(--text3)" strokeWidth={2.5}/>
        <input class="search-input" type="text" placeholder="Tìm kiếm..." bind:value={searchQuery} />
      </div>
      <span class="count">{filtered.length} bản ghi</span>
    </div>
  </div>

  <div class="table-card">
    <table>
      <thead>
        <tr><th>Thời gian</th><th>Người dùng</th><th>Phân loại</th><th>Hành động</th></tr>
      </thead>
      <tbody>
        {#each filtered as log, i}
          {@const cat = categorize(log.action)}
          <tr class="row-anim" style="animation-delay:{i * 20}ms">
            <td style="color:var(--text2);font-size:12px;white-space:nowrap">{log.time}</td>
            <td class="mono" style="font-weight:500">{log.user}</td>
            <td>
              {#if cat === 'inventory'}
                <span class="badge badge-green">Kho</span>
              {:else if cat === 'user'}
                <span class="badge badge-orange">User</span>
              {:else}
                <span class="badge badge-gray">Khác</span>
              {/if}
            </td>
            <td>{log.action}</td>
          </tr>
        {:else}
          <tr><td colspan="4" style="text-align:center;color:var(--text3);padding:40px">Không tìm thấy bản ghi nào</td></tr>
        {/each}
      </tbody>
    </table>
    <div class="table-footer">{filtered.length} bản ghi</div>
  </div>
</div>

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
  .seg-btn:hover:not(.active) {
    color: var(--text);
  }
  .badge-orange {
    background: rgba(255,159,10,0.12);
    color: #FF9F0A;
  }
</style>
