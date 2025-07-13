export class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.init();
  }

  init() {
    this.loadTheme();
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
  }

  toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    this.themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      this.themeToggle.textContent = '☀️';
    } else {
      document.body.classList.remove('dark');
      this.themeToggle.textContent = '🌙';
    }
  }
}
