<script lang="ts">
  import { isLoggedIn, currentUser, currentRole, users } from '$lib/stores';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';

  let username = $state('');
  let password = $state('');
  let showPassword = $state(false);

  function showComingSoon(feature: string, e?: Event) {
    if (e) e.preventDefault();
    alert(`Sắp ra mắt: Tính năng ${feature} đang được phát triển.`);
  }

  function handleLogin() {
    const userList = get(users);
    const foundUser = userList.find(u => 
      u.username.toLowerCase() === username.trim().toLowerCase() || 
      u.name.toLowerCase() === username.trim().toLowerCase()
    );

    if (foundUser) {
      currentUser.set(foundUser.name);
      currentRole.set(foundUser.role);
    } else {
      currentUser.set(username.trim() || 'Test User');
      currentRole.set('admin');
    }
    isLoggedIn.set(true);
    goto('/');
  }
</script>

<div class="auth-root">
  
  <div class="auth-left">
    <!-- Inner layer: rounded blue card -->
    <div class="auth-left-bg">
      <!-- Image inside the card -->
      <img src="/slash.png" alt="App Splash" class="bloom-img" draggable="false" />
    </div>
  </div>
  
  <div class="auth-right">
    <div class="form-panel">
      <!-- Logo Container -->
      <div class="logo-container">
        <img src="/AppLogo.png" alt="PolyWMS Logo" class="app-logo" draggable="false" />
      </div>

      <!-- Elegantly italicized serif title -->
      <h2 class="auth-heading">Đăng Nhập</h2>
      
      <div class="input-stack">
        <!-- Email Input -->
        <div class="glass-input">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" />
            <rect x="3" y="5" width="18" height="14" rx="2" />
          </svg>
          <input type="text" bind:value={username} placeholder="Email hoặc Tên đăng nhập" />
        </div>
        
        <!-- Password Input -->
        <div class="glass-input">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input type={showPassword ? 'text' : 'password'} bind:value={password} placeholder="••••••••••••" />
          <button type="button" class="icon-action-btn" aria-label="Toggle password visibility" onclick={() => showPassword = !showPassword}>
            {#if showPassword}
              <svg class="icon icon-action" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>
              </svg>
            {:else}
              <svg class="icon icon-action" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            {/if}
          </button>
        </div>
        

      </div>
      
      <!-- Solid Button -->
      <button class="btn-signin" onclick={handleLogin}>Đăng nhập</button>
      
      <div class="forgot-row">
        <a href="#" class="forgot-link" onclick={(e) => showComingSoon('Quên mật khẩu', e)}>Quên mật khẩu?</a>
      </div>
      
      <div class="divider">
        <span>hoặc <strong>Tiếp tục</strong> bằng</span>
      </div>
      
      <div class="social-row">
        <!-- Google -->
        <button class="social-btn" onclick={() => showComingSoon('Đăng nhập Google')}>
          <Icon name="google" size={18} />
        </button>
        <!-- Apple -->
        <button class="social-btn" onclick={() => showComingSoon('Đăng nhập Apple')}>
          <Icon name="apple" size={18} />
        </button>  
        <!-- Facebook -->
        <button class="social-btn" onclick={() => showComingSoon('Đăng nhập Facebook')}>
          <Icon name="facebook" size={18} />
        </button>
      </div>
      
      <p class="signup-row">Chưa có tài khoản? <strong onclick={(e) => showComingSoon('Đăng ký tài khoản', e)} role="button" tabindex="0" onkeydown={(e) => {if(e.key === 'Enter') showComingSoon('Đăng ký tài khoản', e)}}>Đăng ký ngay</strong></p>
      <p class="terms-row">Bằng cách nhấp vào nút trên, bạn đồng ý với <u>Điều khoản sử dụng</u> và <u>Chính sách quyền riêng tư</u></p>
    </div>
  </div>
</div>

<style>
  .window-drag-region {
    position: absolute;
    top: 0; left: 0; right: 0; height: 38px;
    -webkit-app-region: drag;
    z-index: 9999;
  }

  .auth-root {
    display: flex; 
    flex-direction: row-reverse; /* Đưa form sang trái, ảnh sang phải */
    height: 100vh;
    background: transparent; /* Allows macOS under-window vibrancy to bleed through! */
    overflow: hidden;
    -webkit-app-region: drag; /* Toàn bộ background ảnh thành vùng kéo thả */
  }

  .auth-left {
    flex: 1; /* Chia đôi 50/50 với form */
    position: relative;
    padding: 0; /* No padding for full-bleed effect */
    z-index: 10;
  }

  .auth-left-bg {
    width: 100%; height: 100%;
    background: #111;
    position: relative;
    
    /* Subtle Micro-Sine Wave on the LEFT edge */
    -webkit-mask-image: 
      linear-gradient(black, black), 
      url("data:image/svg+xml,%3Csvg width='6' height='12' viewBox='0 0 6 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 0 L3 0 C3 2, 0 4, 0 6 C0 8, 3 10, 3 12 L6 12 Z' fill='black'/%3E%3C/svg%3E");
    -webkit-mask-size: calc(100% - 6px) 100%, 6px 12px;
    -webkit-mask-position: right top, left top;
    -webkit-mask-repeat: no-repeat, repeat-y;

    mask-image: 
      linear-gradient(black, black), 
      url("data:image/svg+xml,%3Csvg width='6' height='12' viewBox='0 0 6 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 0 L3 0 C3 2, 0 4, 0 6 C0 8, 3 10, 3 12 L6 12 Z' fill='black'/%3E%3C/svg%3E");
    mask-size: calc(100% - 6px) 100%, 6px 12px;
    mask-position: right top, left top;
    mask-repeat: no-repeat, repeat-y;
  }

  /* Keyframes for the glass panel floating */
  @keyframes floatPanel {
    0% { transform: translateY(0) perspective(1000px) rotateX(0) rotateY(0); }
    100% { transform: translateY(-6px) perspective(1000px) rotateX(1.5deg) rotateY(1deg); }
  }

  /* Subtle gradient overlay to smoothly transition image to the form area on the left */
  .auth-left-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to left, transparent 60%, rgba(0,0,0,0.4) 100%);
    pointer-events: none;
    z-index: 2;
  }

  /* Image — Static Background */
  .bloom-img {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: 0% center; /* Thêm một chút negative để xích quá đà sang trái luôn */
    filter: brightness(0.9) contrast(1.05); /* Slightly dimmed for focus on the form */
    z-index: 1;
  }


  /* Right Panel: Form Area */
  .auth-right {
    flex: 1; /* Chia đôi 50/50 với hình ảnh */
    min-width: 400px; 
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    position: relative;
    z-index: 2;
    -webkit-app-region: no-drag; /* Form đăng nhập không bị ảnh hưởng */
  }
  .form-panel {
    width: 320px;
    display: flex; flex-direction: column;
    animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Typography & Layout */
  .logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 10px; /* Nhỉnh hơn chút */
  }
  .app-logo {
    width: 56px; /* To hơn xíu */
    height: auto;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
  }

  .auth-heading {
    font-family: var(--font);
    font-size: 26px; /* To hơn xíu */
    color: white; 
    margin-bottom: 40px; /* Dãn ra xíu */
    text-align: center;
    font-weight: 700; 
    letter-spacing: -0.02em;
  }

  /* Glass Inputs matching Mockup */
  .input-stack {
    display: flex; flex-direction: column; gap: 16px; /* Dãn gap ra xíu */
  }
  .glass-input {
    display: flex; align-items: center;
    /* Soft frosted glass background */
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    height: 48px; /* Cao hơn xíu */
    padding: 0 16px; gap: 12px;
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.1);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    /* In case Electron Native doesn't blur perfectly here */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .glass-input:focus-within {
    border-color: rgba(255,255,255,0.3);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.2);
  }
  .icon {
    width: 18px; 
    color: rgba(255,255,255,0.4);
    flex-shrink: 0;
  }
  .icon-action-btn {
    background: none; border: none; padding: 0; outline: none;
    display: flex; align-items: center; justify-content: center;
  }
  .icon-action {
    color: rgba(255,255,255,0.3);
    cursor: pointer;
    transition: color 0.15s;
  }
  .icon-action:hover { color: rgba(255,255,255,0.8); }

  .glass-input input {
    flex: 1; 
    background: transparent; 
    border: none; outline: none;
    color: white; 
    font-size: 14px; font-weight: 500;
  }
  .glass-input input::placeholder { color: rgba(255,255,255,0.3); font-weight: 400; }
  


  /* Primary Action */
  .btn-signin {
    margin-top: 20px;
    height: 48px; /* Cao hơn xíu */
    background: white; 
    color: black;
    border: none; border-radius: 12px;
    font-size: 15px; font-weight: 700; 
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(255,255,255,0.15);
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
  }
  .btn-signin:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(255,255,255,0.2);
  }
  .btn-signin:active { transform: translateY(0) scale(0.98); }

  .forgot-row {
    display: flex; justify-content: flex-end; margin-top: 12px;
  }
  .forgot-link {
    color: rgba(255,255,255,0.6); font-size: 12px; text-decoration: none;
    transition: color 0.15s;
    letter-spacing: 0.01em;
  }
  .forgot-link:hover { color: white; }
  
  /* Social Divider */
  .divider {
    display: flex; align-items: center; margin: 30px 0 20px; gap: 16px;
  }
  .divider::before, .divider::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08);
  }
  .divider span {
    font-size: 12px; color: rgba(255,255,255,0.6); font-weight: 400;
  }
  .divider strong { color: white; font-weight: 600; }
  
  /* Social Logins */
  .social-row {
    display: flex; justify-content: space-between; gap: 14px;
  }
  .social-btn {
    flex: 1; height: 52px; /* Cao hơn xíu */
    background: rgba(255,255,255,0.04); 
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; 
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .social-btn:hover { 
    background: rgba(255,255,255,0.08); 
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
  
  /* Footers */
  .signup-row {
    margin-top: 40px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.5);
  }
  .signup-row strong { color: white; cursor: pointer; font-weight: 600; }
  
  .terms-row {
    margin-top: 10px; text-align: center; font-size: 10px; color: rgba(255,255,255,0.3);
    font-style: italic; line-height: 1.5; letter-spacing: 0.02em;
  }
  .terms-row u { cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
  .terms-row u:hover { color: rgba(255,255,255,0.6); }

  @media (max-width: 960px) {
    .auth-left { display: none; }
    .auth-right { 
      min-width: 100%; 
      max-width: 100%; 
      background: rgba(0,0,0,0.6); 
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
    }
    .auth-root { 
      background: url('/slash.png') center/cover no-repeat; 
    }
  }

  @media (max-width: 480px) {
    .form-panel {
      width: 100%;
      padding: 0 24px;
      box-sizing: border-box;
    }
    .auth-heading { font-size: 22px; margin-bottom: 24px; }
    .app-logo { width: 48px; }
  }
</style>
