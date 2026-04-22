<script lang="ts">
  import {
    products,
    transactions,
    getProductStatus,
    formatCurrency,
  } from "$lib/stores";
  import Icon from "$lib/components/Icon.svelte";

  /* ── Summary stats ── */
  let importTxns = $derived($transactions.filter((t) => t.type === "import"));
  let exportTxns = $derived($transactions.filter((t) => t.type === "export"));
  let totalImport = $derived(importTxns.reduce((s, t) => s + t.qty, 0));
  let totalExport = $derived(exportTxns.reduce((s, t) => s + t.qty, 0));

  /* ── Bar chart: group transactions by date (day) ── */
  let importByDay = $derived(() => {
    const map: Record<string, number> = {};
    importTxns.forEach((t) => {
      const d = t.date.split(" ")[0];
      map[d] = (map[d] || 0) + t.qty;
    });
    return map;
  });
  let exportByDay = $derived(() => {
    const map: Record<string, number> = {};
    exportTxns.forEach((t) => {
      const d = t.date.split(" ")[0];
      map[d] = (map[d] || 0) + t.qty;
    });
    return map;
  });
  let allDays = $derived(() => {
    const s = new Set<string>();
    $transactions.forEach((t) => s.add(t.date.split(" ")[0]));
    return [...s].sort().reverse();
  });
  let maxBarVal = $derived(() => {
    let m = 1;
    const im = importByDay(),
      ex = exportByDay();
    for (const d of allDays()) m = Math.max(m, im[d] || 0, ex[d] || 0);
    return m;
  });

  /* ── Transaction filter ── */
  let filterType = $state<"all" | "import" | "export">("all");
  let searchQuery = $state("");
  let fromDate = $state("");
  let toDate = $state("");

  function parseDate(str: string) {
    const [d, t] = str.split(" ");
    const [DD, MM, YYYY] = d.split("/");
    return new Date(`${YYYY}-${MM}-${DD}T${t || "00:00"}`);
  }

  let filteredTxns = $derived(
    $transactions
      .filter((t) => filterType === "all" || t.type === filterType)
      .filter(
        (t) =>
          searchQuery.trim() === "" ||
          t.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.note.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((t) => {
        if (!fromDate && !toDate) return true;
        const txDate = parseDate(t.date);
        const f = fromDate ? new Date(fromDate) : new Date("2000-01-01");
        const to = toDate ? new Date(toDate) : new Date("2100-01-01");
        to.setHours(23, 59, 59, 999);
        return txDate >= f && txDate <= to;
      }),
  );

  function exportCSV() {
    const BOM = "\uFEFF"; // Excel UTF-8 compatibility
    const header =
      "Mã phiếu,Thời gian,Loại,Sản phẩm,Số lượng,Người thực hiện,Ghi chú,Trạng thái\n";
    const rows = $transactions
      .map(
        (t) =>
          `"${t.voucherId}","${t.date}","${t.type === "import" ? "Nhập" : "Xuất"}","${t.product}",${t.qty},"${t.user || ""}","${t.note}","${t.status}"`,
      )
      .join("\n");
    const blob = new Blob([BOM + header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opus_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<svelte:head><title>Báo cáo - Poly WMS</title></svelte:head>

<div class="fade-in">
  <div class="toolbar" style="margin-bottom:32px">
    <h1 class="page-title" style="margin-bottom:0">Báo cáo & Thống kê</h1>
    <button class="btn btn-primary btn-sm" onclick={exportCSV}>
      <Icon name="download" size={13} color="white" strokeWidth={2.5} />
      Xuất CSV
    </button>
  </div>

  <!-- ── Summary Cards ── -->
  <div class="grid-stats">
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Tổng nhập</span>
        <div class="stat-icon-sm green">
          <Icon name="import" size={14} color="var(--green)" strokeWidth={2} />
        </div>
      </div>
      <div class="stat-value">{totalImport}</div>
      <span class="stat-change up">{importTxns.length} giao dịch</span>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Tổng xuất</span>
        <div class="stat-icon-sm blue">
          <Icon name="export" size={14} color="var(--accent)" strokeWidth={2} />
        </div>
      </div>
      <div class="stat-value">{totalExport}</div>
      <span class="stat-change">{exportTxns.length} giao dịch</span>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-label">Chênh lệch</span>
        <div class="stat-icon-sm teal">
          <Icon
            name="inventory"
            size={14}
            color="var(--teal)"
            strokeWidth={2}
          />
        </div>
      </div>
      <div class="stat-value">
        {totalImport - totalExport > 0 ? "+" : ""}{totalImport - totalExport}
      </div>
      <span
        class="stat-change"
        class:up={totalImport >= totalExport}
        class:down={totalImport < totalExport}
      >
        {totalImport > totalExport
          ? "Nhập nhiều hơn"
          : totalImport < totalExport
            ? "Xuất nhiều hơn"
            : "Cân bằng"}
      </span>
    </div>
  </div>

  <!-- ── Bar Chart: Import vs Export by Day ── -->
  <div class="chart-card">
    <div
      style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"
    >
      <h3>Tổng hợp Nhập / Xuất theo ngày</h3>
      <div class="legend">
        <span class="legend-item"><span class="dot green"></span>Nhập</span>
        <span class="legend-item"><span class="dot blue"></span>Xuất</span>
      </div>
    </div>
    <div class="chart-bars">
      {#each allDays() as day, i}
        {@const imVal = importByDay()[day] || 0}
        {@const exVal = exportByDay()[day] || 0}
        <div class="chart-group" style="animation-delay:{i * 60}ms">
          <div class="chart-pair">
            <div
              class="chart-bar import"
              style="height:{(imVal / maxBarVal()) * 100}%"
              title="Nhập: {imVal}"
            >
              {#if imVal > 0}<span class="chart-val">{imVal}</span>{/if}
            </div>
            <div
              class="chart-bar export"
              style="height:{(exVal / maxBarVal()) * 100}%"
              title="Xuất: {exVal}"
            >
              {#if exVal > 0}<span class="chart-val">{exVal}</span>{/if}
            </div>
          </div>
          <span class="chart-label">{day.substring(0, 5)}</span>
        </div>
      {:else}
        <div
          style="width:100%;text-align:center;color:var(--text3);padding:40px;font-size:13px"
        >
          Chưa có dữ liệu giao dịch
        </div>
      {/each}
    </div>
  </div>

  <!-- ── Inventory Status Table ── -->
  <div class="table-card">
    <div class="table-header"><h3>Xem báo cáo tồn kho</h3></div>
    <table>
      <thead
        ><tr
          ><th>Mã SP</th><th>Sản phẩm</th><th>Tồn kho</th><th>Tối thiểu</th><th
            >Giá trị</th
          ><th>Trạng thái</th></tr
        ></thead
      >
      <tbody>
        {#each $products as p}
          {@const st = getProductStatus(p)}
          <tr>
            <td class="mono" style="color:var(--text3)">{p.id}</td>
            <td style="font-weight:500">{p.name}</td>
            <td class="mono">{p.qty}</td>
            <td class="mono">{p.min}</td>
            <td class="mono" style="color:var(--accent)"
              >{formatCurrency(p.qty * p.price)}đ</td
            >
            <td><span class="badge {st.cls}">{st.text}</span></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- ── Transaction History with Filters ── -->
  <div class="table-card">
    <div class="table-header">
      <h3>Chi tiết giao dịch</h3>
      <div style="display:flex;align-items:center;gap:12px">
        <div class="seg-control" style="margin-right:8px">
          <button
            class="seg-btn"
            class:active={filterType === "all"}
            onclick={() => (filterType = "all")}>Tất cả</button
          >
          <button
            class="seg-btn"
            class:active={filterType === "import"}
            onclick={() => (filterType = "import")}>Nhập</button
          >
          <button
            class="seg-btn"
            class:active={filterType === "export"}
            onclick={() => (filterType = "export")}>Xuất</button
          >
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <input type="date" class="apple-date-input" bind:value={fromDate} />
          <span style="color:var(--text3);font-size:12px">-</span>
          <input type="date" class="apple-date-input" bind:value={toDate} />
        </div>
        <div class="search-wrap">
          <Icon
            name="search"
            size={12}
            color="var(--text3)"
            strokeWidth={2.5}
          />
          <input
            class="search-input"
            type="text"
            placeholder="Tìm sản phẩm..."
            bind:value={searchQuery}
            style="width:120px;font-size:12px"
          />
        </div>
      </div>
    </div>
    <table>
      <thead
        ><tr
          ><th>Mã phiếu</th><th>Thời gian</th><th>Loại</th><th>Sản phẩm</th><th
            >Số lượng</th
          ><th>Người thực hiện</th><th>Ghi chú</th></tr
        ></thead
      >
      <tbody>
        {#each filteredTxns as t, i}
          <tr class="row-anim" style="animation-delay:{i * 20}ms">
            <td class="mono" style="font-weight:600;font-size:12px"
              >{t.voucherId}</td
            >
            <td style="color:var(--text2);font-size:12px;white-space:nowrap"
              >{t.date}</td
            >
            <td>
              {#if t.type === "import"}
                <span class="badge badge-green">Nhập</span>
              {:else}
                <span class="badge badge-blue">Xuất</span>
              {/if}
            </td>
            <td style="font-weight:500">{t.product}</td>
            <td class="mono">{t.qty}</td>
            <td style="color:var(--text2)">{t.user || "—"}</td>
            <td style="color:var(--text3)">{t.note}</td>
          </tr>
        {:else}
          <tr
            ><td
              colspan="7"
              style="text-align:center;color:var(--text3);padding:40px"
              >Không có giao dịch nào</td
            ></tr
          >
        {/each}
      </tbody>
    </table>
    <div class="table-footer">{filteredTxns.length} giao dịch</div>
  </div>
</div>

<style>
  /* ── macOS Segmented Control ── */
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
    box-shadow: 0 1px 4px rgba(0, 102, 204, 0.25);
  }
  .seg-btn:hover:not(.active) {
    color: var(--text);
  }

  /* ── Chart Legend ── */
  .legend {
    display: flex;
    gap: 14px;
    font-size: 11px;
    color: var(--text3);
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }
  .dot.green {
    background: var(--green);
  }
  .dot.blue {
    background: var(--accent);
  }

  /* ── Paired Bar Chart ── */
  .chart-bars {
    display: flex;
    align-items: flex-end;
    gap: 32px;
    height: 220px;
    padding: 24px 16px 8px; /* Extra top padding so values don't get cut off */
    overflow-x: auto;
    overflow-y: hidden;
  }
  .chart-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 64px;
    animation: growUp 0.5s var(--spring) both;
  }
  .chart-pair {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    height: 160px; /* Actual height for the bars to scale within */
    width: 100%;
    justify-content: center;
  }
  .chart-bar {
    width: 28px; /* Thicker, nicer bars */
    border-radius: 6px 6px 0 0;
    position: relative;
    transition: height 0.5s var(--spring);
    min-height: 4px;
  }
  .chart-bar.import {
    background: var(--green);
  }
  .chart-bar.export {
    background: var(--accent);
  }
  .chart-bar:hover {
    opacity: 0.85;
    transform: scaleY(1.02);
  }
  .chart-val {
    position: absolute;
    top: -22px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    font-weight: 600;
    color: var(--text2);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .chart-label {
    font-size: 11px;
    color: var(--text4);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  /* ── Date Inputs ── */
  .apple-date-input {
    width: 125px;
    font-size: 12px;
    padding: 6px 10px;
    background: var(--bg-card);
    border: 0.5px solid var(--separator-op);
    border-radius: var(--r-md);
    color: var(--text);
    font-family: var(--font);
    outline: none;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .apple-date-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-op);
  }
</style>
