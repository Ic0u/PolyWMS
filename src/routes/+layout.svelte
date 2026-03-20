<script lang="ts">
  import '$lib/styles/global.css';
  import { isLoggedIn, currentUser, currentRole, alertMessage, isSidebarOpen } from '$lib/stores';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import Login from '$lib/components/Login.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  $effect(() => {
    if ($alertMessage && typeof window !== 'undefined' && (window as any).electronAPI) {
        (window as any).electronAPI.showNotification({
            title: $alertMessage.type === 'error' ? 'Lỗi' : 'Thành công',
            body: $alertMessage.text
        });
    }
  });

  // Sync accent color with OS (macOS/Windows)
  $effect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.getAccentColor) {
      (window as any).electronAPI.getAccentColor().then((color: string | null) => {
        if (color) document.documentElement.style.setProperty('--accent', color);
      });
      (window as any).electronAPI.onAccentColorChanged?.((color: string) => {
        document.documentElement.style.setProperty('--accent', color);
      });
    }
  });

  // Page-Level Route Guard (RBAC)
  $effect(() => {
    if ($isLoggedIn) {
      const path = page.url.pathname;
      const role = $currentRole;
      
      const roleAccess: Record<string, string[]> = {
        staff: ['/', '/products', '/inventory', '/tasks'],
        manager: ['/', '/products', '/inventory', '/reports', '/suppliers', '/stocktake', '/audit', '/tasks'],
      };

      if (role !== 'admin') {
        const allowedRoutes = roleAccess[role] || [];
        if (path !== '/' && !allowedRoutes.some(r => path === r || (r !== '/' && path.startsWith(r + '/')))) {
          goto('/');
        }
      }
    }
  });
</script>

{#if !$isLoggedIn}
  <Login />
{:else}
  <!-- Global Windows Drag Region -->
  <div class="global-drag-bar"></div>

  <!-- Desktop Global Toggle -->
  <button class="desktop-sidebar-toggle" class:sidebar-closed={!$isSidebarOpen} onclick={() => $isSidebarOpen = !$isSidebarOpen}>
    <Icon name="sidebar.left" size={16} color="rgba(255,255,255,0.7)" />
  </button>

  <div class="app-layout">
    <Sidebar />
    <div class="main-area">
      <!-- Mobile Header -->
      <div class="mobile-header">
        <button class="hamburger-btn" onclick={() => $isSidebarOpen = true}>
          <Icon name="menu" size={24} color="var(--text)" />
        </button>
        <div class="mobile-brand">Poly WMS</div>
        <div class="mobile-spacer"></div>
      </div>

      <main class="content-area">
        {@render children()}
      </main>
    </div>
  </div>
{/if}

<style>
  .global-drag-bar {
    position: absolute;
    top: 0; left: 0; right: 0; height: 38px;
    -webkit-app-region: drag;
    z-index: 9999;
  }

  .desktop-sidebar-toggle {
    position: absolute;
    top: 13px;
    left: 260px; /* Sticks to right edge of the sidebar */
    z-index: 10000;
    background: none; border: none; padding: 6px;
    border-radius: 6px; cursor: pointer;
    -webkit-app-region: no-drag;
    transition: transform 0.3s var(--spring), background 0.15s ease;
    display: flex; align-items: center; justify-content: center;
  }
  .desktop-sidebar-toggle:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .desktop-sidebar-toggle.sidebar-closed {
    transform: translateX(-180px); /* Slides left along with sidebar, stopping after traffic lights */
  }

  .app-layout {
    display: flex;
    height: 100vh;
    animation: fadeIn 0.3s var(--spring);
  }
  .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg);
    transition: background 0.4s var(--spring);
    position: relative;
    z-index: 10;
  }
  .content-area {
    flex: 1;
    overflow-y: auto;
    padding: 48px 56px;
  }

  .mobile-header {
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur-sm);
    -webkit-backdrop-filter: var(--glass-blur-sm);
    border-bottom: 0.5px solid var(--glass-border);
    -webkit-app-region: drag;
  }

  .mobile-brand {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }

  .hamburger-btn {
    background: none; border: none; padding: 4px;
    cursor: pointer;
    -webkit-app-region: no-drag;
    display: flex; align-items: center; justify-content: center;
  }
  .mobile-spacer { width: 32px; }

  @media (max-width: 768px) {
    .desktop-sidebar-toggle {
      display: none;
    }
    .mobile-header {
      display: flex;
    }
    .content-area {
      padding: 24px 20px;
    }
  }
</style>
