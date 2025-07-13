export class TimetableManager {
  constructor() {
    this.timetable = {};
    this.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    this.currentDay = "";
    this.isLoading = true;
    this.currentLectureElement = document.getElementById("current-lecture");
    this.scheduleTitle = document.getElementById("schedule-title");
    this.scheduleContent = document.getElementById("schedule-content");
    this.init();
  }

  async init() {
    await this.loadTimetable();
    this.setupDaySelector();
    this.selectDay(this.getCurrentDay());
    this.startLectureUpdater();
  }

  async loadTimetable() {
    try {
      const response = await fetch("timetable.json");
      this.timetable = response.ok ? await response.json() : {};
    } catch (error) {
      console.error("Error loading timetable:", error);
      this.timetable = {};
    }
    this.isLoading = false;
  }

  getCurrentDay() {
    const day = new Date().getDay() - 1;
    return day >= 0 && day < this.days.length ? this.days[day] : this.days[0];
  }

  timeToMinutes(timeStr) {
    const [hour, minute] = timeStr.split(":").map(Number);
    return hour * 60 + minute;
  }

  formatTime(timeStr) {
    const [hour, minute] = timeStr.split(":").map(Number);
    return `${hour % 12 || 12}:${minute.toString().padStart(2, "0")} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  }

  createLectureHTML(lecture) {
    const [start, end] = lecture.time.split("-");
    const faculty = lecture.faculty || "";
    const room = lecture.room || "";

    return `
      <p class="lecture-name">${lecture.subject_name}</p>
      <p class="lecture-details">${this.formatTime(start)} - ${this.formatTime(
      end
    )}</p>
      <p class="lecture-details">Faculty: ${faculty}</p>
      ${room ? `<p class="lecture-details">Room: ${room}</p>` : ""}
      <p class="lecture-details">Type: ${lecture.type}</p>
    `;
  }

  getCurrentStatus() {
    if (this.isLoading) return { type: "loading" };

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check break time
    if (currentMinutes >= 760 && currentMinutes <= 810) {
      // 12:40 PM - 1:30 PM
      return { type: "break" };
    }

    // Find current lecture
    const day = this.getCurrentDay();
    const lecture = this.timetable[day]?.find((lecture) => {
      const [start, end] = lecture.time.split("-");
      const startMinutes = this.timeToMinutes(start);
      const endMinutes = this.timeToMinutes(end);
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    });

    return lecture ? { type: "lecture", data: lecture } : { type: "none" };
  }

  updateCurrentLecture() {
    const status = this.getCurrentStatus();

    const statusConfig = {
      loading: { class: "current-lecture", html: "<p>Loading...</p>" },
      break: {
        class: "current-lecture break",
        html: `
          <p class="lecture-name">Break Time</p>
          <p class="lecture-details">12:40 PM - 1:30 PM</p>
          <p class="lecture-details">Enjoy your break! 🍽️</p>
        `,
      },
      lecture: {
        class: "current-lecture active",
        html: this.createLectureHTML(status.data),
      },
      none: { class: "current-lecture", html: "<p>No current lecture</p>" },
    };

    const config = statusConfig[status.type];
    this.currentLectureElement.className = config.class;
    this.currentLectureElement.innerHTML = config.html;
  }

  setupDaySelector() {
    document.querySelectorAll("#day-selector button").forEach((btn) => {
      btn.addEventListener("click", () => this.selectDay(btn.dataset.day));
    });
  }

  selectDay(day) {
    this.currentDay = day;
    document.querySelectorAll("#day-selector button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.day === day);
    });
    this.displaySchedule();
  }

  displaySchedule() {
    this.scheduleTitle.textContent = `${this.currentDay}'s Schedule`;

    if (this.isLoading) {
      this.scheduleContent.innerHTML = '<p class="no-classes">Loading...</p>';
      return;
    }

    const schedule = this.timetable[this.currentDay];
    this.scheduleContent.innerHTML = schedule?.length
      ? schedule
          .map(
            (lecture) =>
              `<div class="schedule-item">${this.createLectureHTML(
                lecture
              )}</div>`
          )
          .join("")
      : '<p class="no-classes">No classes today</p>';
  }

  startLectureUpdater() {
    this.updateCurrentLecture();
    setInterval(() => this.updateCurrentLecture(), 1000);
  }
}
