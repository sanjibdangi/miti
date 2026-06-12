/**
 * Miti PWA — Initialization & Mobile Adaptations
 * Overrides the Electron-specific behavior for web/mobile use
 */

(function () {
  function initPWA() {
    const app = window.mitiApp;
    if (!app) {
      // Retry after a short delay — app may not be ready yet
      setTimeout(initPWA, 100);
      return;
    }

  // Override: PWA is always in "expanded" mode
  app.isExpanded = true;

  // Render the PWA header (today card)
  function renderPWAHeader() {
    const today = app.converter.getToday();
    const holiday = HolidayManager.getHoliday(today.bs.year, today.bs.month, today.bs.day);

    const dayNameEl = document.getElementById('pwa-day-name');
    const bsDateEl = document.getElementById('pwa-bs-date');
    const bsDateNpEl = document.getElementById('pwa-bs-date-np');
    const adDateEl = document.getElementById('pwa-ad-date');
    const holidayEl = document.getElementById('pwa-holiday');

    if (dayNameEl) {
      dayNameEl.textContent = `${BS_DAYS.en[today.bs.dayOfWeek]} • ${BS_DAYS.np[today.bs.dayOfWeek]}`;
    }
    if (bsDateEl) {
      bsDateEl.textContent = `${today.bs.day} ${BS_MONTHS.en[today.bs.month - 1]} ${today.bs.year}`;
    }
    if (bsDateNpEl) {
      bsDateNpEl.textContent = `${MitiUtils.toNepaliNumeral(today.bs.day)} ${BS_MONTHS.np[today.bs.month - 1]} ${MitiUtils.toNepaliNumeral(today.bs.year)}`;
    }
    if (adDateEl) {
      adDateEl.textContent = MitiUtils.formatADDateShort(new Date());
    }
    if (holidayEl) {
      if (holiday) {
        holidayEl.textContent = `${holiday.emoji} ${holiday.nameEn} — ${holiday.name}`;
        holidayEl.classList.add('visible');
      }
    }
  }

  // Copy button
  document.getElementById('pwa-copy-btn')?.addEventListener('click', () => {
    const today = app.converter.getToday();
    const bsStr = MitiUtils.formatBSDate(today.bs.year, today.bs.month, today.bs.day);
    const bsStrNp = MitiUtils.formatBSDate(today.bs.year, today.bs.month, today.bs.day, 'np');
    const adStr = MitiUtils.formatADDate(new Date());
    MitiUtils.copyToClipboard(`${bsStr} BS (${bsStrNp}) | ${adStr}`);
    MitiUtils.showToast('📋 Date copied!');
  });

  // Theme toggle (re-bind for PWA header)
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    app.toggleTheme();
  });

  // Tab switching — render into pwa-content area
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      app.currentTab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      app.renderExpanded();
    });
  });

  // PWA Install prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    if (document.querySelector('.install-banner')) return;
    if (localStorage.getItem('miti_install_dismissed')) return;

    const banner = document.createElement('div');
    banner.className = 'install-banner';
    banner.innerHTML = `
      <span style="font-size:28px">🇳🇵</span>
      <div class="install-banner-text">
        <div class="install-banner-title">Install Miti</div>
        <div class="install-banner-desc">Add to home screen for quick access</div>
      </div>
      <button class="install-banner-btn" id="install-btn">Install</button>
      <button class="install-banner-close" id="install-close">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('install-btn')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          banner.remove();
        }
        deferredPrompt = null;
      }
    });

    document.getElementById('install-close')?.addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('miti_install_dismissed', 'true');
    });
  }

  // Initialize
  renderPWAHeader();
  app.renderExpanded();

  // Refresh header every minute
  setInterval(renderPWAHeader, 60000);
  }

  // Kick off init (wait for DOMContentLoaded + app init)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initPWA, 50));
  } else {
    setTimeout(initPWA, 50);
  }
})();
