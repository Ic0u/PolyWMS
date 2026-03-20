<script lang="ts">
  import { products, transactions, totalInventoryValue, formatCurrency } from '$lib/stores';
  import Icon from '$lib/components/Icon.svelte';

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const weekVals = [65, 40, 80, 55, 90, 30, 20];
</script>

<svelte:head><title>Dashboard - Opus WMS</title></svelte:head>

<div class="fade-in">
  <h1 class="page-heading">Dashboard</h1>

  <div class="grid-stats">
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Sản phẩm</span>
        <div class="stat-icon-sm blue"><Icon name="products" size={14} color="#3B82F6" strokeWidth={2}/></div>
      </div>
      <div class="stat-value">{$products.length}</div>
      <span class="stat-change up">+2 mới tuần này</span>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Giá trị ước tính</span>
        <div class="stat-icon-sm green"><Icon name="reports" size={14} color="#10B981" strokeWidth={2}/></div>
      </div>
      <div class="stat-value">{formatCurrency(Math.round($totalInventoryValue / 1e6))}M₫</div>
      <span class="stat-change up">Tổng quy đổi theo vốn</span>
    </div>
  </div>

  <div class="chart-card">
    <h3 class="card-title">Nhập/Xuất trong tuần</h3>
    <div class="bar-chart-flat">
      {#each weekVals as val, i}
        <div class="bar-wrapper">
          <div class="bar-flat" style="height:{val}%;animation-delay:{i * 40}ms"></div>
          <span class="bar-label">{weekDays[i]}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="table-card">
    <div class="table-header">
      <h3>Giao dịch gần đây</h3>
    </div>
    <table>
      <thead>
        <tr><th>Thời gian</th><th>Loại</th><th>Sản phẩm</th><th>Số lượng</th></tr>
      </thead>
      <tbody>
        {#each $transactions.slice(0, 5) as tx}
          <tr>
            <td style="color:var(--text2)">{tx.date}</td>
            <td>
              <span class="tx-badge {tx.type}">
                <Icon name={tx.type === 'import' ? 'import' : 'export'} size={11} strokeWidth={2.5}
                  color={tx.type === 'import' ? 'var(--green)' : 'var(--accent)'}/>
                {tx.type === 'import' ? 'Nhập' : 'Xuất'}
              </span>
            </td>
            <td style="font-weight:500">{tx.product}</td>
            <td style="font-weight:600;font-variant-numeric:tabular-nums">{tx.qty}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: white;
    margin-bottom: 30px;
    letter-spacing: 0.02em;
  }
  .bar-chart-flat {
    display: flex;
    align-items: flex-end;
    height: 120px;
    gap: 12px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255,255,255,0.05); /* Baseline */
  }
  .bar-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
  }
  .bar-flat {
    width: 100%;
    max-width: 60px;
    background: #3A3A3C;
    border-radius: 4px 4px 0 0;
    transition: background 0.3s;
    animation: growUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) both;
  }
  .bar-wrapper:hover .bar-flat {
    background: #505052;
  }
  .bar-label {
    margin-top: 12px;
    font-size: 10px;
    color: #8E8E93;
    font-weight: 500;
  }
</style>
