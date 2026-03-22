<script lang="ts">
  import { products, transactions, totalInventoryValue, lowStockProducts, formatCurrency } from '$lib/stores';
  import Icon from '$lib/components/Icon.svelte';

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const weekVals = [65, 40, 80, 55, 90, 30, 20];

  let todayTickets = $derived(
    $transactions.filter(t => {
      const d = new Date();
      const todayStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
      return t.date.startsWith(todayStr);
    }).length
  );
</script>

<svelte:head><title>Dashboard - Poly WMS</title></svelte:head>

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
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Phiếu hôm nay</span>
        <div class="stat-icon-sm yellow" style="background:rgba(245,158,11,0.12)"><Icon name="edit" size={14} color="#F59E0B" strokeWidth={2}/></div>
      </div>
      <div class="stat-value">{todayTickets}</div>
      <span class="stat-change">Nhập & xuất trong ngày</span>
    </div>
  </div>

  <!-- Stock Alerts Section -->
  {#if $lowStockProducts.length > 0}
    <div class="alert-section">
      <div class="alert-header">
        <div class="alert-title-row">
          <Icon name="bell" size={16} color="var(--red)" strokeWidth={2}/>
          <h3>Cảnh báo tồn kho</h3>
        </div>
        <span class="alert-count badge badge-red">{$lowStockProducts.length} sản phẩm</span>
      </div>
      <div class="alert-grid">
        {#each $lowStockProducts as p}
          <div class="alert-card">
            <div class="alert-card-top">
              <Icon name="warning" size={16} color="var(--red)" strokeWidth={2}/>
              <span class="alert-product">{p.name}</span>
            </div>
            <div class="alert-card-stats">
              <div class="alert-stat">
                <span class="alert-stat-label">Tồn kho</span>
                <span class="alert-stat-value red">{p.qty}</span>
              </div>
              <div class="alert-stat">
                <span class="alert-stat-label">Tối thiểu</span>
                <span class="alert-stat-value">{p.min}</span>
              </div>
              <div class="alert-stat">
                <span class="alert-stat-label">Thiếu</span>
                <span class="alert-stat-value red">-{p.min - p.qty}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="ok-banner">
      <Icon name="check" size={16} color="var(--green)" strokeWidth={2.5}/>
      <span>Kho hàng ổn định — Không có sản phẩm nào dưới mức tối thiểu</span>
    </div>
  {/if}

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
    border-bottom: 1px solid var(--separator-op, rgba(255,255,255,0.05));
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
    background: var(--accent, #3A3A3C);
    opacity: 0.7;
    border-radius: 4px 4px 0 0;
    transition: background 0.3s, opacity 0.3s;
    animation: growUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) both;
  }
  .bar-wrapper:hover .bar-flat {
    opacity: 1;
  }
  .bar-label {
    margin-top: 12px;
    font-size: 10px;
    color: var(--text4, #8E8E93);
    font-weight: 500;
  }

  /* ── Stock Alert Section ── */
  .alert-section {
    margin-bottom: 40px;
  }
  .alert-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .alert-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .alert-title-row h3 {
    font-size: 17px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.02em;
  }
  .alert-count {
    font-size: 11px;
  }
  .alert-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
  }
  .alert-card {
    background: rgba(255, 69, 58, 0.06);
    border: 0.5px solid rgba(255, 69, 58, 0.15);
    border-radius: var(--r-xl);
    padding: 16px;
    transition: transform 0.3s var(--spring);
  }
  .alert-card:hover {
    transform: translateY(-2px);
  }
  .alert-card-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .alert-product {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.01em;
  }
  .alert-card-stats {
    display: flex;
    gap: 16px;
  }
  .alert-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .alert-stat-label {
    font-size: 10px;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 500;
  }
  .alert-stat-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
  .alert-stat-value.red {
    color: var(--red);
  }

  .ok-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    background: rgba(48, 209, 88, 0.06);
    border: 0.5px solid rgba(48, 209, 88, 0.15);
    border-radius: var(--r-xl);
    margin-bottom: 40px;
    font-size: 13px;
    font-weight: 500;
    color: var(--green);
  }

  @media (max-width: 768px) {
    .alert-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
