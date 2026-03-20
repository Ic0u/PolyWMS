<script lang="ts">
  import { products, transactions, getProductStatus } from '$lib/stores';
  import Icon from '$lib/components/Icon.svelte';

  let totalImport = $derived($transactions.filter(t => t.type === 'import').reduce((s,t) => s+t.qty, 0));
  let totalExport = $derived($transactions.filter(t => t.type === 'export').reduce((s,t) => s+t.qty, 0));

  const months = ['T1','T2','T3','T4','T5','T6'];
  const monthVals = [45,60,35,80,55,70];
</script>

<svelte:head><title>Báo cáo</title></svelte:head>

<div class="fade-in">
  <div class="h-col">
    <h1 class="page-title">Báo cáo</h1>
  </div>

  <div class="grid-stats">
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Tổng nhập</span>
        <div class="stat-icon-sm green"><Icon name="import" size={14} color="var(--green)" strokeWidth={2}/></div>
      </div>
      <div class="stat-value">{totalImport}</div>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Tổng xuất</span>
        <div class="stat-icon-sm blue"><Icon name="export" size={14} color="var(--accent)" strokeWidth={2}/></div>
      </div>
      <div class="stat-value">{totalExport}</div>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Giao dịch</span>
        <div class="stat-icon-sm teal"><Icon name="inventory" size={14} color="var(--teal)" strokeWidth={2}/></div>
      </div>
      <div class="stat-value">{$transactions.length}</div>
    </div>
  </div>

  <div class="chart-card" style="margin-bottom:16px">
    <h3>Tổng hợp theo tháng</h3>
    <div class="bar-chart">
      {#each monthVals as val, i}
        <div class="bar" style="height:{val}%;animation-delay:{i*50}ms"><span>{months[i]}</span></div>
      {/each}
    </div>
  </div>

  <div class="table-card">
    <div class="table-header"><h3>Chi tiết tồn kho</h3></div>
    <table>
      <thead><tr><th>Sản phẩm</th><th>Tồn kho</th><th>Tối thiểu</th><th>Trạng thái</th></tr></thead>
      <tbody>
        {#each $products as p}
          {@const st = getProductStatus(p)}
          <tr>
            <td style="font-weight:500">{p.name}</td>
            <td class="mono">{p.qty}</td>
            <td class="mono">{p.min}</td>
            <td><span class="badge {st.cls}">{st.text}</span></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
