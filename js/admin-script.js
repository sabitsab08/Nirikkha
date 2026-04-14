(function () {

  // ── Date string ──
  const dateEl = document.getElementById('datestr');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // ── Dark mode ──
  let dark = false;

  window.toggleTheme = function () {
    dark = !dark;
    document.documentElement.classList.toggle('dark', dark);
    document.getElementById('theme-ic').textContent = dark ? 'light_mode' : 'dark_mode';
  };

  // ── Sidebar ──
  window.toggleSidebar = function () {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
  };

  window.closeSidebar = function () {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
  };

  // ── Bottom nav active state ──
  window.setActive = function (el) {
    document.querySelectorAll('.bn-item').forEach(function (b) {
      b.classList.remove('active');
    });
    el.classList.add('active');
  };

  // ── Sidebar nav active state ──
  window.setNav = function (el) {
    document.querySelectorAll('.nav-item').forEach(function (b) {
      b.classList.remove('active');
    });
    el.classList.add('active');
  };

})();