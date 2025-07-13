export class ClockManager {
  constructor() {
    this.clockElement = document.getElementById("clock");
    this.init();
  }

  init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  updateClock() {
    this.clockElement.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
}
