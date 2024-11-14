const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const UPDATE_INTERVAL = 6000; // 1 minute in milliseconds

let timetable = {};
let currentDay = "";
let currentLecture = null;

const currentLectureElement = document.getElementById("current-lecture");
const fullTimetableElement = document.getElementById("full-timetable");
const clockElement = document.getElementById("clock");
const daySelector = document.getElementById("day-selector");

const getCurrentDay = () =>
  DAYS_OF_WEEK[new Date().getDay() - 1] || DAYS_OF_WEEK[0];

const convertTo12Hour = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const adjustedHour = hour % 12 || 12;
  return `${adjustedHour}:${minute.toString().padStart(2, "0")} ${period}`;
};

async function loadTimetable() {
  try {
    const timetableData = await Promise.all(
      DAYS_OF_WEEK.map((day) =>
        fetch(`${day}.json`).then((response) => response.json())
      )
    );
    DAYS_OF_WEEK.forEach((day, index) => {
      timetable[day] = timetableData[index];
    });
    setupDaySelector();
    updateCurrentInfo();
    setInterval(updateCurrentInfo, UPDATE_INTERVAL);
  } catch (error) {
    console.error("Error loading timetable:", error);
    // TODO: Add user-friendly error handling
  }
}

function setupDaySelector() {
  SHORT_DAYS.forEach((day, index) => {
    const button = document.createElement("button");
    button.textContent = day;
    button.classList.add("day-button");
    button.addEventListener("click", () => selectDay(DAYS_OF_WEEK[index]));
    daySelector.appendChild(button);
  });
  selectDay(getCurrentDay());
}

function selectDay(day) {
  currentDay = day;
  document.querySelectorAll(".day-button").forEach((btn, index) => {
    btn.classList.toggle("active", DAYS_OF_WEEK[index] === day);
  });
  displayFullTimetable();
}

function getCurrentLecture() {
  const now = new Date();
  const day = getCurrentDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  return (
    timetable[day]?.find((lecture) => {
      const [startHour, startMinute] = lecture.starttime.split(":").map(Number);
      const [endHour, endMinute] = lecture.endtime.split(":").map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      return currentTime >= startTime && currentTime <= endTime;
    }) || null
  );
}

function updateCurrentInfo() {
  updateClock();
  displayCurrentLecture();
}

function displayCurrentLecture() {
  currentLecture = getCurrentLecture();

  if (currentLecture) {
    const { subject, starttime, endtime, room, teacher } = currentLecture;
    currentLectureElement.innerHTML = `
      <h2>Current Lecture</h2>
      <p class="lecture-subject">${subject}</p>
      <p class="lecture-time">${convertTo12Hour(starttime)} - ${convertTo12Hour(
      endtime
    )}</p>
      <p class="lecture-details">Room: ${room} | ${teacher}</p>
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
    const progressPercentage = Math.min(
      Math.max((elapsedTime / totalDuration) * 100, 0),
      100
    );

    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
      progressBar.style.width = `${progressPercentage}%`;
    }
  }
}

function displayFullTimetable() {
  const daySchedule = timetable[currentDay];
  const capitalizedDay =
    currentDay.charAt(0).toUpperCase() + currentDay.slice(1);

  const scheduleHTML = daySchedule
    ? daySchedule
        .map(
          ({ subject, starttime, endtime, room, teacher }) => `
        <div class="lecture">
          <p class="lecture-subject">${subject}</p>
          <p class="lecture-time">${convertTo12Hour(
            starttime
          )} - ${convertTo12Hour(endtime)}</p>
          <p class="lecture-details">Room: ${room} | ${teacher}</p>
        </div>
      `
        )
        .join("")
    : "<p>No classes scheduled for this day.</p>";

  fullTimetableElement.innerHTML = `
    <h3>${capitalizedDay}'s Schedule</h3>
    ${scheduleHTML}
  `;
}

function updateClock() {
  clockElement.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

loadTimetable();
