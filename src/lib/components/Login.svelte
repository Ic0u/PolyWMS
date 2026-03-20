<script lang="ts">
  import { isLoggedIn, currentUser, currentRole, users, type Role } from '$lib/stores';
  import { get } from 'svelte/store';


  let username = $state('');
  let password = $state('');
  let selectedRole = $state<Role>('admin'); // Default for testing dropdown

  function handleLogin() {
    const userList = get(users);
    const foundUser = userList.find(u => 
      u.username.toLowerCase() === username.toLowerCase() || 
      u.name.toLowerCase() === username.toLowerCase()
    );

    if (foundUser) {
      currentUser.set(foundUser.name);
    } else {
      currentUser.set(username || 'Test User');
    }
    
    // Always use the dropdown selection for testing as requested
    currentRole.set(selectedRole);
    isLoggedIn.set(true);
  }
</script>

<div class="auth-root">
  <div class="window-drag-region"></div>
  
  <div class="auth-left">
    <!-- Inner layer: rounded blue card -->
    <div class="auth-left-bg">
      <!-- Image inside the card — white bg disappears via multiply, sculpture tints blue -->
      <img src="/slash.jpg" alt="App Splash" class="bloom-img" draggable="false" />
    </div>
  </div>
  
  <div class="auth-right">
    <div class="form-panel">
      <!-- Elegantly italicized serif title -->
      <h2 class="auth-heading">Bắt đầu sử dụng</h2>
      
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
          <input type="password" bind:value={password} placeholder="••••••••••••" />
          <svg class="icon icon-action" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        
        <!-- Role Dropdown (For Testing) -->
        <div class="glass-input select-wrapper">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <select bind:value={selectedRole} class="glass-select">
            <option value="admin">Quản trị hệ thống (Admin)</option>
            <option value="manager">Quản lý (Manager)</option>
            <option value="staff">Nhân viên (Staff)</option>
          </select>
          <svg class="icon select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>
      
      <!-- Solid Button -->
      <button class="btn-signin" onclick={handleLogin}>Đăng nhập</button>
      
      <div class="forgot-row">
        <a href="#" class="forgot-link">Quên mật khẩu?</a>
      </div>
      
      <div class="divider">
        <span>hoặc <strong>Tiếp tục</strong> bằng</span>
      </div>
      
      <div class="social-row">
        <!-- Google -->
        <button class="social-btn">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </button>
        <!-- Meta/Infinity Placeholder -->
        <button class="social-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="color: #0668E1">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.2 14.8c-1.52 0-2.8-.76-3.72-2.08-.92 1.32-2.2 2.08-3.72 2.08-3.12 0-5.32-2.48-5.32-5.48 0-3.08 2.2-5.52 5.32-5.52 1.52 0 2.8.76 3.72 2.08.92-1.32 2.2-2.08 3.72-2.08 3.12 0 5.32 2.48 5.32 5.48 0 3.08-2.2 5.48-5.32 5.48z"/>
          </svg>
        </button>  
        <!-- Twitter -->
        <button class="social-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DA1F2">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </button>
      </div>
      
      <p class="signup-row">Chưa có tài khoản? <strong>Đăng ký ngay</strong></p>
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
    height: 100vh;
    background: transparent; /* Allows macOS under-window vibrancy to bleed through! */
    overflow: hidden;
  }

  /* Left Panel */
  .auth-left {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center; justify-content: center;
    padding: 24px;
    -webkit-app-region: no-drag;
  }

  /* The rounded glass panel — 3D depth, glow, and rich shadows */
  .auth-left-bg {
    width: 100%; height: 100%;
    border-radius: 40px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 100%);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      inset 0 1px 3px rgba(255, 255, 255, 0.4),    /* Brighter inner top highlight */
      inset 0 -1px 2px rgba(0, 0, 0, 0.3),         /* Lighter inner bottom shadow */
      0 30px 60px rgba(0, 0, 0, 0.5),              /* Drop shadow */
      0 0 80px rgba(255, 255, 255, 0.2),           /* Intense primary glow */
      0 0 160px rgba(200, 230, 255, 0.15);         /* Massive secondary ambient glow (slight icy tint) */
    overflow: hidden;
    position: relative;
    transform-style: preserve-3d;
    animation: floatPanel 8s ease-in-out infinite alternate;
  }

  /* Keyframes for the glass panel floating */
  @keyframes floatPanel {
    0% { transform: translateY(0) perspective(1000px) rotateX(0) rotateY(0); }
    100% { transform: translateY(-6px) perspective(1000px) rotateX(1.5deg) rotateY(1deg); }
  }

  /* Inner shadow overlay for dramatic vignetting/depth */
  .auth-left-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 40px;
    /* Brighter vignette to let the image shine more while preserving depth */
    background: radial-gradient(circle at center, rgba(255,255,255,0.05) 20%, rgba(0, 0, 0, 0.25) 150%);
    pointer-events: none;
    z-index: 2;
  }

  /* Image — Smooth Zoom Loop and Moved Right */
  .bloom-img {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: 0% 50%; /* Pinned to the left to ensure the mountain is fully visible */
    filter: brightness(1.05) contrast(1.1) saturate(1.15); /* Balanced brightness */
    animation: smoothZoom 15s ease-in-out infinite alternate;
    transform-origin: 30% 50%; /* Zoom centered slightly to the left to focus on the mountain */
    z-index: 1;
  }

  /* Pure scale loop animation without translating */
  @keyframes smoothZoom {
    0% { transform: scale(1); }
    100% { transform: scale(1.15); }
  }

  /* Right Panel: Form Area */
  .auth-right {
    flex: 1; 
    min-width: 400px; /* Ensures the form has enough breathing room */
    display: flex; 
    align-items: center; justify-content: center;
    -webkit-app-region: no-drag;
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

  /* Typography */
  .auth-heading {
    font-family: var(--font);
    font-size: 30px;
    color: white; 
    margin-bottom: 36px; 
    text-align: center;
    font-weight: 600; 
    letter-spacing: -0.01em;
  }

  /* Glass Inputs matching Mockup */
  .input-stack {
    display: flex; flex-direction: column; gap: 14px;
  }
  .glass-input {
    display: flex; align-items: center;
    /* Soft frosted glass background */
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    height: 52px; 
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
  
  .select-wrapper { position: relative; padding-right: 0; }
  .glass-select {
    flex: 1; 
    background: transparent; 
    border: none; outline: none;
    color: white; 
    font-size: 14px; font-weight: 500;
    appearance: none;
    cursor: pointer;
    width: 100%;
    padding-right: 36px; /* Space for the chevron */
  }
  .glass-select option { background: #1a1b1e; color: white; }
  .select-chevron {
    position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
    pointer-events: none;
  }
  
  /* Primary Action */
  .btn-signin {
    margin-top: 20px;
    height: 52px; 
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
    display: flex; align-items: center; margin: 36px 0 24px; gap: 16px;
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
    display: flex; justify-content: space-between; gap: 16px;
  }
  .social-btn {
    flex: 1; height: 60px;
    background: rgba(255,255,255,0.04); 
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; 
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
    margin-top: 48px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.5);
  }
  .signup-row strong { color: white; cursor: pointer; font-weight: 600; }
  
  .terms-row {
    margin-top: 12px; text-align: center; font-size: 10px; color: rgba(255,255,255,0.3);
    font-style: italic; line-height: 1.5; letter-spacing: 0.02em;
  }
  .terms-row u { cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
  .terms-row u:hover { color: rgba(255,255,255,0.6); }

  @media (max-width: 960px) {
    .auth-left { display: none; }
    .auth-right { min-width: 100%; }
    .auth-root { background: rgba(0,0,0,0.3); } /* Dim the background if there's no left visual */
  }
</style>
