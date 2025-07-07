// Configure Tailwind for dark mode
if (typeof tailwind !== "undefined") {
  tailwind.config = {
    darkMode: "class",
  };
}

// Show loading screen initially and hide when everything is ready
window.addEventListener("load", () => {
  // Reduced minimum loading time for faster experience
  setTimeout(() => {
    hideLoadingScreen();
  }, 300);
});

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  const mainContent = document.getElementById("main-content");

  loadingScreen.classList.add("loading-fade-out");
  loadingScreen.style.opacity = "0";

  setTimeout(() => {
    loadingScreen.style.display = "none";
    mainContent.classList.remove("content-hidden");
    mainContent.classList.add("content-visible");
  }, 200);
}

document.addEventListener("DOMContentLoaded", () => {
  const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const selectedClasses = "bg-green-500 dark:bg-green-600 text-white";
  const unselectedClasses =
    "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300";

  let timetable = {};
  let currentDay = "";
  let currentLecture = null;

  const elements = {
    currentLectureTitle: document.getElementById("current-lecture-title"),
    lectureInfo: document.getElementById("lecture-info"),
    lectureName: document.getElementById("lecture-name"),
    lectureTime: document.getElementById("lecture-time"),
    lectureRoom: document.getElementById("lecture-room"),
    noLectureMessage: document.getElementById("no-lecture-message"),
    progressBar: document.getElementById("progress-bar"),
    clock: document.getElementById("clock"),
    dayButtons: document.querySelectorAll("#day-selector button"),
    scheduleTitle: document.getElementById("schedule-title"),
    scheduleContent: document.getElementById("schedule-content"),
  };

  function getCurrentDay() {
    const day = new Date().getDay() - 1;
    return day >= 0 && day < DAYS_OF_WEEK.length
      ? DAYS_OF_WEEK[day]
      : DAYS_OF_WEEK[0];
  }

  function convertTo12Hour(time) {
    const [hour, minute] = time.split(":").map(Number);
    return `${hour % 12 || 12}:${minute.toString().padStart(2, "0")} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  }

  async function loadTimetable() {
    try {
      const response = await fetch("timetable.json");
      if (!response.ok) throw new Error("Failed to load timetable");
      timetable = await response.json();
      setupDaySelector();
      updateCurrentInfo();
      setInterval(updateCurrentInfo, 1000);
    } catch (error) {
      console.error("Error loading timetable:", error);
      elements.scheduleContent.textContent =
        "Failed to load timetable. Please try again later.";
      elements.scheduleContent.className = "text-red-500 dark:text-red-400";
    }
  }

  function setupDaySelector() {
    elements.dayButtons.forEach((button, index) => {
      button.className = `py-2 px-4 rounded-lg focus:outline-none ${unselectedClasses}`;
      button.addEventListener("click", () => selectDay(DAYS_OF_WEEK[index]));
    });
    selectDay(getCurrentDay());
  }

  function selectDay(day) {
    currentDay = day;
    elements.dayButtons.forEach((btn, index) => {
      const classes =
        DAYS_OF_WEEK[index] === day ? selectedClasses : unselectedClasses;
      btn.className = `py-2 px-4 rounded-lg focus:outline-none ${classes}`;
    });
    displayFullTimetable();
  }

  function getCurrentLecture() {
    const now = new Date();
    const day = getCurrentDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return (
      timetable[day]?.find((lecture) => {
        const [startHour, startMinute] = lecture.start_time
          .split(":")
          .map(Number);
        const [endHour, endMinute] = lecture.end_time.split(":").map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      }) || null
    );
  }

  function updateCurrentInfo() {
    elements.clock.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    currentLecture = getCurrentLecture();

    if (currentLecture) {
      elements.currentLectureTitle.textContent = "Current Lecture";
      elements.lectureName.textContent = currentLecture.lecture;
      elements.lectureTime.textContent = `${convertTo12Hour(
        currentLecture.start_time
      )} - ${convertTo12Hour(currentLecture.end_time)}`;
      elements.lectureRoom.textContent = `Room: ${currentLecture.room}`;

      elements.lectureInfo.classList.remove("hidden");
      elements.noLectureMessage.classList.add("hidden");
      updateProgressBar();
    } else {
      elements.currentLectureTitle.textContent = "No Current Lecture";
      elements.lectureInfo.classList.add("hidden");
      elements.noLectureMessage.classList.remove("hidden");
    }
  }

  function updateProgressBar() {
    if (!currentLecture) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = currentLecture.start_time
      .split(":")
      .map(Number);
    const [endHour, endMinute] = currentLecture.end_time.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    const totalDuration = endMinutes - startMinutes;
    const elapsedTime = currentMinutes - startMinutes;
    const progressPercentage = Math.min(
      Math.max((elapsedTime / totalDuration) * 100, 0),
      100
    );

    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
      progressBar.style.width = `${progressPercentage}%`;
    }
  }

  function displayFullTimetable() {
    const daySchedule = timetable[currentDay];
    elements.scheduleTitle.textContent = `${currentDay}'s Schedule`;

    if (daySchedule?.length) {
      elements.scheduleContent.innerHTML = "";
      elements.scheduleContent.className = "space-y-4";

      daySchedule.forEach(({ lecture, start_time, end_time, room }) => {
        const lectureDiv = document.createElement("div");
        lectureDiv.className = "border-l-4 border-green-500 pl-4 py-2";

        const nameP = document.createElement("p");
        nameP.className =
          "text-sm md:text-base font-bold text-gray-800 dark:text-gray-100";
        nameP.textContent = lecture;

        const timeP = document.createElement("p");
        timeP.className = "text-xs md:text-sm text-gray-600 dark:text-gray-400";
        timeP.textContent = `${convertTo12Hour(start_time)} - ${convertTo12Hour(
          end_time
        )}`;

        const roomP = document.createElement("p");
        roomP.className = "text-xs md:text-sm text-gray-600 dark:text-gray-400";
        roomP.textContent = `Room: ${room}`;

        lectureDiv.appendChild(nameP);
        lectureDiv.appendChild(timeP);
        lectureDiv.appendChild(roomP);
        elements.scheduleContent.appendChild(lectureDiv);
      });
    } else {
      elements.scheduleContent.textContent =
        "No classes scheduled for this day.";
      elements.scheduleContent.className =
        "text-sm md:text-base text-gray-500 dark:text-gray-400";
    }
  }

  function updateThemeIcon() {
    // Just keep the moon icon always - no switching needed
    iconPath.setAttribute(
      "d",
      "M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
    );
    iconPath.removeAttribute("fill-rule");
    iconPath.removeAttribute("clip-rule");
  }

  // Theme management
  const themeToggle = document.getElementById("theme-toggle");
  const htmlElement = document.documentElement;
  const iconPath = document.getElementById("icon-path");

  // Initialize theme from localStorage
  const isDarkMode = localStorage.getItem("darkMode") !== "false";
  if (isDarkMode) {
    htmlElement.classList.add("dark");
  } else {
    htmlElement.classList.remove("dark");
  }
  updateThemeIcon();

  function toggleTheme() {
    htmlElement.classList.toggle("dark");
    const isDark = htmlElement.classList.contains("dark");
    localStorage.setItem("darkMode", isDark.toString());
  }

  themeToggle.addEventListener("click", toggleTheme);

  // Load timetable after DOM is ready
  loadTimetable();
});
