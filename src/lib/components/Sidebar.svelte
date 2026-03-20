<script lang="ts">
  import { currentRole, currentUser, ROLE_NAMES, isLoggedIn, isSidebarOpen } from '$lib/stores';
  import { page } from '$app/state';
  import Icon from '$lib/components/Icon.svelte';

  let path = $derived(page.url.pathname);

  const NAV: Record<string, { href: string; icon: string; label: string; }[]> = {
    staff: [
      { href: '/', icon: 'dashboard', label: 'Dashboard' },
      { href: '/products', icon: 'products', label: 'Sản phẩm' },
      { href: '/inventory', icon: 'inventory', label: 'Nhập/Xuất kho' }
    ],
    manager: [
      { href: '/', icon: 'dashboard', label: 'Dashboard' },
      { href: '/products', icon: 'products', label: 'Sản phẩm' },
      { href: '/inventory', icon: 'inventory', label: 'Nhập/Xuất kho' },
      { href: '/reports', icon: 'reports', label: 'Báo cáo' },
      { href: '/suppliers', icon: 'suppliers', label: 'Nhà cung cấp' }
    ],
    admin: [
      { href: '/', icon: 'dashboard', label: 'Dashboard' },
      { href: '/products', icon: 'products', label: 'Sản phẩm' },
      { href: '/inventory', icon: 'inventory', label: 'Nhập/Xuất kho' },
      { href: '/reports', icon: 'reports', label: 'Báo cáo' },
      { href: '/suppliers', icon: 'suppliers', label: 'Nhà cung cấp' },
      { href: '/users', icon: 'users', label: 'Người dùng' }
    ]
  };

  let items = $derived(NAV[$currentRole] ?? NAV.staff);
  
  let searchTerm = $state('');
  
  let filteredItems = $derived(
    searchTerm.trim() === ''
      ? items
      : items.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
  );
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
{#if $isSidebarOpen}
  <div class="sidebar-overlay" onclick={() => $isSidebarOpen = false}></div>
{/if}

<aside class="sidebar" class:mobile-open={$isSidebarOpen} class:desktop-closed={!$isSidebarOpen}>
  <div class="sidebar-top">
    <div class="sidebar-search-container">
      <Icon name="search" size={14} color="rgba(255,255,255,0.4)" strokeWidth={2.5} />
      <input type="text" class="sidebar-search-input" placeholder="Search" bind:value={searchTerm} />
    </div>
    <button class="mobile-close" onclick={() => $isSidebarOpen = false}>
      <Icon name="x" size={18} color="rgba(255,255,255,0.6)" />
    </button>
  </div>

  <nav class="nav">
    {#each filteredItems as item}
      <a class="nav-item" class:active={path === item.href} href={item.href}>
        <span class="nav-icon">
          <Icon name={item.icon} size={16} color="currentColor" strokeWidth={1.5} />
        </span>
        <span class="nav-label">{item.label}</span>
      </a>
    {:else}
      <div class="no-results">No results found</div>
    {/each}
  </nav>

  <div class="sidebar-bottom">
    <button class="user-row" onclick={() => { if(window.confirm('Bạn có chắc chắn muốn đăng xuất?')) isLoggedIn.set(false); }}>
      <div class="user-info-wrapper">
        <div class="avatar" style="overflow: hidden; padding: 0;">
          {#if $currentUser === 'Test User'}
            <Icon name="default-avatar" size={36} color="#8E8E93" strokeWidth={0} />
          {:else}
            <img src="/avatar.jpg" alt="{$currentUser}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
          {/if}
        </div>
        <div class="user-details">
          <div class="user-name">{$currentUser}</div>
          <div class="user-role">{ROLE_NAMES[$currentRole]}</div>
        </div>
      </div>
    </button>
  </div>
</aside>

<style>
  .sidebar {
    width: 250px;
    flex-shrink: 0;
    /* Codex style relies entirely on the window's dark vibrancy/color */
    background: transparent;
    border-right: 0.5px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 100;
    transition: margin-left 0.3s var(--spring), transform 0.3s var(--spring);
  }

  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 90;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* Accommodate macOS standard 38px titlebar with traffic lights */
  .sidebar-top {
    padding: 44px 12px 12px; /* Top space for traffic lights, slightly taller like App Store */
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .sidebar-search-container {
    background: rgba(0, 0, 0, 0.2); /* App store style inset search */
    border-radius: 6px;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    -webkit-app-region: no-drag;
    box-shadow: inset 0 0 0 0.5px rgba(255,255,255,0.08); /* App Store subtle border */
  }

  .sidebar-search-input {
    background: transparent;
    border: none;
    color: white;
    font-size: 13px;
    width: 100%;
    outline: none;
    font-family: inherit;
  }
  .sidebar-search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .mobile-close {
    display: none;
    background: none; border: none; padding: 4px;
    cursor: pointer;
    -webkit-app-region: no-drag;
  }

  .nav {
    flex: 1;
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    transition: all 0.15s ease;
    letter-spacing: 0;
    -webkit-app-region: no-drag;
  }

  .no-results {
    padding: 20px 12px;
    text-align: center;
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    font-style: italic;
  }

  .nav-icon {
    width: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: inherit;
  }
  
  .nav-item:hover {
    color: white;
  }

  /* Active: white text on subtle gray pill */
  .nav-item.active {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .sidebar-bottom {
    padding: 12px 14px 16px;
    display: flex;
    flex-direction: column;
  }

  .user-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    background: none;
    border: none;
    font-family: var(--font);
    cursor: pointer;
    transition: background 0.15s ease;
    width: 100%;
    text-align: left;
    -webkit-app-region: no-drag;
  }
  
  .user-row:hover {
    background: rgba(255, 255, 255, 0.08); /* Minimal hover like Codex */
  }

  .user-info-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .avatar {
    width: 36px; height: 36px; border-radius: 50%; /* Completely circular App Store style */
    background: rgba(255, 255, 255, 0.1);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 0 0.5px rgba(255,255,255,0.1);
  }

  .user-name {
    font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 15px; font-weight: 600; color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.015em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .user-role {
    font-size: 12px; color: rgba(255, 255, 255, 0.4); margin-top: 1px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .user-details { flex: 1; min-width: 0; }

  @media (min-width: 769px) {
    .sidebar.desktop-closed {
      margin-left: -250px;
    }
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      /* Apply direct vibrancy background for mobile when there's no Electron window context */
      background: rgba(20, 20, 22, 0.7);
      backdrop-filter: blur(40px) saturate(150%);
      -webkit-backdrop-filter: blur(40px) saturate(150%);
      transform: translateX(-100%);
    }
    .sidebar.mobile-open {
      transform: translateX(0);
    }
    .sidebar-overlay {
      display: block;
    }
    .sidebar-top {
      height: 40px; /* Reset padding for mobile, no traffic lights */
      margin-top: 8px;
    }
    .mobile-close {
      display: flex;
    }
  }
</style>
