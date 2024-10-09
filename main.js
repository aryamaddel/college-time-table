let timetable = {};
let currentDay = "";
let currentLecture = null;

async function loadTimetable() {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  for (const day of days) {
    const response = await fetch(`${day}.json`);
    const data = await response.json();
    timetable[day] = data;
  }
  setupDaySelector();
  displayCurrentLecture();
  displayFullTimetable();
  updateClock();
  setInterval(updateClock, 1000);
}

function setupDaySelector() {
  const daySelector = document.getElementById("day-selector");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  days.forEach((day, index) => {
    const button = document.createElement("button");
    button.textContent = day;
    button.classList.add("day-button");
    button.addEventListener("click", () =>
      selectDay(["monday", "tuesday", "wednesday", "thursday", "friday"][index])
    );
    daySelector.appendChild(button);
  });
  selectDay(getCurrentDay());
}

function selectDay(day) {
  currentDay = day;
  document.querySelectorAll(".day-button").forEach((btn, index) => {
    btn.classList.toggle(
      "active",
      ["monday", "tuesday", "wednesday", "thursday", "friday"][index] === day
    );
  });
  displayFullTimetable();
}

function getCurrentDay() {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
}

function convertTo12Hour(time) {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const adjustedHour = hour % 12 || 12;
  return `${adjustedHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

function getCurrentLecture() {
  const now = new Date();
  const day = getCurrentDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  if (timetable[day]) {
    for (const lecture of timetable[day]) {
      const [startHour, startMinute] = lecture.starttime.split(":").map(Number);
      const [endHour, endMinute] = lecture.endtime.split(":").map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      if (currentTime >= startTime && currentTime <= endTime) {
        return lecture;
      }
    }
  }
  return null;
}

function displayCurrentLecture() {
  const currentLectureElement = document.getElementById("current-lecture");
  currentLecture = getCurrentLecture();

  if (currentLecture) {
    currentLectureElement.innerHTML = `
            <h2>Current Lecture</h2>
            <p class="lecture-subject">${currentLecture.subject}</p>
            <p class="lecture-time">${convertTo12Hour(
              currentLecture.starttime
            )} - ${convertTo12Hour(currentLecture.endtime)}</p>
            <p class="lecture-details">Room: ${currentLecture.room} | ${
      currentLecture.teacher
    }</p>
            <div id="progress-bar-container">
              <div id="progress-bar"></div>
            </div>
          `;
    updateProgressBar();
  } else {
    currentLectureElement.innerHTML = "<h2>No Current Lecture</h2>";
  }
}

function updateProgressBar() {
  if (currentLecture) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = currentLecture.starttime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = currentLecture.endtime.split(":").map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const totalDuration = endTime - startTime;
    const elapsedTime = currentTime - startTime;
    const progressPercentage = (elapsedTime / totalDuration) * 100;

    const progressBar = document.getElementById("progress-bar");
    progressBar.style.width = `${progressPercentage}%`;
  }
}

function displayFullTimetable() {
  const fullTimetableElement = document.getElementById("full-timetable");
  let html = `<h3>${
    currentDay.charAt(0).toUpperCase() + currentDay.slice(1)
  }'s Schedule</h3>`;

  if (timetable[currentDay]) {
    timetable[currentDay].forEach((lecture) => {
      html += `
              <div class="lecture">
                <p class="lecture-subject">${lecture.subject}</p>
                <p class="lecture-time">${convertTo12Hour(
                  lecture.starttime
                )} - ${convertTo12Hour(lecture.endtime)}</p>
                <p class="lecture-details">Room: ${lecture.room} | ${
        lecture.teacher
      }</p>
              </div>
            `;
    });
  } else {
    html += "<p>No classes scheduled for this day.</p>";
  }

  fullTimetableElement.innerHTML = html;
}

function updateClock() {
  const clockElement = document.getElementById("clock");
  const now = new Date();
  clockElement.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  displayCurrentLecture();
}

loadTimetable();
