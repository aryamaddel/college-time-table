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
    this.updateCurrentLecture();
    setInterval(() => this.updateCurrentLecture(), 1000);
  }

  async loadTimetable() {
    try {
      const response = await fetch("timetable.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.timetable = await response.json();
      this.isLoading = false;
      return true;
    } catch (error) {
      console.error("Error loading timetable:", error);
      this.isLoading = false;
      return false;
    }
  }

  getCurrentDay() {
    const day = new Date().getDay() - 1;
    return day >= 0 && day < this.days.length ? this.days[day] : this.days[0];
  }

  parseTime(timeStr) {
    const [startTime, endTime] = timeStr.split("-");
    return { start: startTime, end: endTime };
  }

  formatTime(time) {
    const [hour, minute] = time.split(":").map(Number);
    return `${hour % 12 || 12}:${minute.toString().padStart(2, "0")} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  }

  createLectureHTML(lecture) {
    const { start, end } = this.parseTime(lecture.time);
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

  isBreakTime() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const breakStart = 12 * 60 + 40; // 12:40 PM
    const breakEnd = 13 * 60 + 30; // 1:30 PM
    return currentMinutes >= breakStart && currentMinutes <= breakEnd;
  }

  getCurrentLecture() {
    if (this.isLoading) return null;

    const now = new Date();
    const day = this.getCurrentDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return this.timetable[day]?.find((lecture) => {
      const { start, end } = this.parseTime(lecture.time);
      const [startHour, startMinute] = start.split(":").map(Number);
      const [endHour, endMinute] = end.split(":").map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    });
  }

  updateCurrentLecture() {
    const lecture = this.getCurrentLecture();

    if (this.isLoading) {
      this.currentLectureElement.className = "current-lecture";
      this.currentLectureElement.innerHTML = "<p>Loading...</p>";
      return;
    }

    if (this.isBreakTime()) {
      this.currentLectureElement.className = "current-lecture break";
      this.currentLectureElement.innerHTML = `
        <p class="lecture-name">Break Time</p>
        <p class="lecture-details">12:40 PM - 1:30 PM</p>
        <p class="lecture-details">Enjoy your break! 🍽️</p>
      `;
    } else if (lecture) {
      this.currentLectureElement.className = "current-lecture active";
      this.currentLectureElement.innerHTML = this.createLectureHTML(lecture);
    } else {
      this.currentLectureElement.className = "current-lecture";
      this.currentLectureElement.innerHTML = "<p>No current lecture</p>";
    }
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
    const schedule = this.timetable[this.currentDay];
    this.scheduleTitle.textContent = `${this.currentDay}'s Schedule`;

    if (this.isLoading) {
      this.scheduleContent.innerHTML = '<p class="no-classes">Loading...</p>';
      return;
    }

    if (schedule?.length) {
      this.scheduleContent.innerHTML = schedule
        .map(
          (lecture) => `
          <div class="schedule-item">
            ${this.createLectureHTML(lecture)}
          </div>
        `
        )
        .join("");
    } else {
      this.scheduleContent.innerHTML =
        '<p class="no-classes">No classes today</p>';
    }
  }
}
