// ==================================
// MY JOURNEY 365
// MAIN JAVASCRIPT
// ==================================


// DATABASE (BROWSER STORAGE)

let records = JSON.parse(localStorage.getItem("myRecords")) || [];
let goals = JSON.parse(localStorage.getItem("myGoals")) || [];

let progressChart = null;


// SAVE DATA

function saveData() {
    localStorage.setItem("myRecords", JSON.stringify(records));
    localStorage.setItem("myGoals", JSON.stringify(goals));
}


// DATE HELPER

function localDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ESCAPE USER CONTENT

function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


// NAVIGATION

function showSection(sectionName) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const selected = document.getElementById(sectionName);

    if (selected) {
        selected.classList.add("active");
    }

    updateDashboard();

    if (sectionName === "analytics") {
        updateAnalytics();
    }
}


// ==================================
// DAILY JOURNAL
// ==================================

document.getElementById("date").value = localDate();

document.getElementById("journalForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const record = {

        id: Date.now(),

        date: document.getElementById("date").value,

        category: document.getElementById("category").value,

        achievement: document.getElementById("achievement").value.trim(),

        learning: document.getElementById("learning").value.trim(),

        mistake: document.getElementById("mistake").value.trim(),

        improvement: document.getElementById("improvement").value.trim()

    };

    if (!record.achievement && !record.learning &&
        !record.mistake && !record.improvement) {

        alert("Please enter something about your day.");

        return;
    }

    records.push(record);

    saveData();

    this.reset();

    document.getElementById("date").value = localDate();

    displayRecords();

    updateDashboard();

    alert("Your daily record has been saved successfully!");

});


// DISPLAY JOURNAL RECORDS

function displayRecords() {

    const container = document.getElementById("journalRecords");

    if (records.length === 0) {

        container.innerHTML = "<p>No records yet. Start documenting your journey!</p>";

        return;
    }

    container.innerHTML = [...records]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(record => `

        <div>

            <p class="record-date">${escapeHTML(record.date)}</p>

            <h3>${escapeHTML(record.category)}</h3>

            <p><strong>Achievement:</strong> ${escapeHTML(record.achievement) || "Not recorded"}</p>

            <p><strong>Learning:</strong> ${escapeHTML(record.learning) || "Not recorded"}</p>

            <p><strong>Mistakes:</strong> ${escapeHTML(record.mistake) || "Not recorded"}</p>

            <p><strong>Improvement:</strong> ${escapeHTML(record.improvement) || "Not recorded"}</p>

            <button class="delete-btn" onclick="deleteRecord(${record.id})">
                Delete Record
            </button>

        </div>

    `).join("");

}


// DELETE RECORD

function deleteRecord(id) {

    if (!confirm("Are you sure you want to delete this record?")) return;

    records = records.filter(record => record.id !== id);

    saveData();

    displayRecords();

    updateDashboard();

    updateAnalytics();

}


// ==================================
// GOALS MANAGEMENT
// ==================================

document.getElementById("goalForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const goal = {

        id: Date.now(),

        name: document.getElementById("goalName").value.trim(),

        deadline: document.getElementById("goalDeadline").value,

        completed: false

    };

    goals.push(goal);

    saveData();

    this.reset();

    displayGoals();

    updateDashboard();

    alert("Goal added successfully!");

});


// DISPLAY GOALS

function displayGoals() {

    const container = document.getElementById("goalList");

    if (goals.length === 0) {

        container.innerHTML = "<p>You haven't added any goals yet.</p>";

        return;
    }

    container.innerHTML = goals.map(goal => `

        <div>

            <h3>${escapeHTML(goal.name)}</h3>

            <p>Deadline: ${escapeHTML(goal.deadline || "Not set")}</p>

            <p>Status: ${goal.completed ? "Completed ✅" : "In Progress ⏳"}</p>

            ${!goal.completed ? `

                <button onclick="completeGoal(${goal.id})">
                    Mark Completed
                </button>

            ` : ""}

            <button class="delete-btn" onclick="deleteGoal(${goal.id})">
                Delete Goal
            </button>

        </div>

    `).join("");

}


// COMPLETE GOAL

function completeGoal(id) {

    const goal = goals.find(g => g.id === id);

    if (goal) {

        goal.completed = true;

        saveData();

        displayGoals();

        updateDashboard();

    }

}


// DELETE GOAL

function deleteGoal(id) {

    if (!confirm("Delete this goal?")) return;

    goals = goals.filter(goal => goal.id !== id);

    saveData();

    displayGoals();

    updateDashboard();

}


// ==================================
// DASHBOARD
// ==================================

function updateDashboard() {

    document.getElementById("totalRecords").textContent = records.length;

    document.getElementById("totalAchievements").textContent =
        records.filter(r => r.achievement).length;

    document.getElementById("completedGoals").textContent =
        goals.filter(g => g.completed).length;

    const activeDays = new Set(records.map(r => r.date));

    document.getElementById("activeDays").textContent = activeDays.size;

    const recent = document.getElementById("recentActivities");

    const latest = [...records]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5);

    if (latest.length === 0) {

        recent.innerHTML = "<p>Your recent activities will appear here.</p>";

    } else {

        recent.innerHTML = latest.map(record => `

            <div>

                <p class="record-date">${escapeHTML(record.date)}</p>

                <h3>${escapeHTML(record.category)}</h3>

                <p>${escapeHTML(record.achievement || record.learning || record.mistake)}</p>

            </div>

        `).join("");

    }

}


// ==================================
// DATE ANALYSIS
// ==================================

function getWeekStart(date) {

    const d = new Date(date);

    d.setHours(0, 0, 0, 0);

    const day = d.getDay();

    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));

    return d;
}


function countRecords(start, end) {

    return records.filter(record => {

        const date = new Date(record.date + "T12:00:00");

        return date >= start && date <= end;

    }).length;

}


// WEEKLY, MONTHLY AND YEARLY ANALYSIS

function updateAnalytics() {

    const now = new Date();

    const weekStart = getWeekStart(now);

    const weekEnd = new Date(weekStart);

    weekEnd.setDate(weekEnd.getDate() + 6);

    weekEnd.setHours(23, 59, 59, 999);

    const weekCount = countRecords(weekStart, weekEnd);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthCount = countRecords(monthStart, monthEnd);

    const yearStart = new Date(now.getFullYear(), 0, 1);

    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const yearCount = countRecords(yearStart, yearEnd);


    document.getElementById("weeklyProgress").textContent = weekCount;

    document.getElementById("monthlyProgress").textContent = monthCount;

    document.getElementById("yearlyProgress").textContent = yearCount;


    // COMPARE THIS WEEK WITH LAST WEEK

    const previousWeekStart = new Date(weekStart);

    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const previousWeekEnd = new Date(weekStart);

    previousWeekEnd.setMilliseconds(-1);

    const previousCount = countRecords(previousWeekStart, previousWeekEnd);


    let comparison = "";

    if (weekCount > previousCount) {

        comparison = "🟢 You're moving forward! Your recorded activity increased compared with last week.";

    } else if (weekCount < previousCount) {

        comparison = "🔴 Your recorded activity decreased compared with last week. Identify what needs improvement.";

    } else {

        comparison = "🟡 Your recorded activity is unchanged compared with last week.";

    }


    document.getElementById("analysisText").innerHTML = `

        <p><strong>This week's activities:</strong> ${weekCount}</p>

        <p><strong>Last week's activities:</strong> ${previousCount}</p>

        <p>${comparison}</p>

        <p><strong>Monthly activities:</strong> ${monthCount}</p>

        <p><strong>Yearly activities:</strong> ${yearCount}</p>

        <p>Remember: progress is about consistent improvement, not just the number of records.</p>

    `;


    drawChart();

}


// ==================================
// PROGRESS CHART
// ==================================

function drawChart() {

    const canvas = document.getElementById("progressChart");

    if (!canvas) return;

    const labels = [];

    const values = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(date.getDate() - i);

        const dateString = localDate(date);

        labels.push(date.toLocaleDateString("en", {
            weekday: "short"
        }));

        values.push(records.filter(r => r.date === dateString).length);

    }


    // LOAD CHART.JS AUTOMATICALLY

    if (typeof Chart === "undefined") {

        if (!window.chartLoading) {

            window.chartLoading = true;

            const script = document.createElement("script");

            script.src = "https://cdn.jsdelivr.net/npm/chart.js";

            script.onload = function() {

                window.chartLoading = false;

                drawChart();

            };

            script.onerror = function() {

                window.chartLoading = false;

                document.getElementById("analysisText").innerHTML +=
                    "<p>Chart library could not load. Check your internet connection.</p>";

            };

            document.head.appendChild(script);

        }

        return;

    }


    if (progressChart) {

        progressChart.destroy();

    }


    progressChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{

                label: "Daily Activities",

                data: values,

                backgroundColor: "#8968f5",

                borderRadius: 6

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: true,

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0,

                        color: "#ffffff"

                    }

                },

                x: {

                    ticks: {

                        color: "#ffffff"

                    }

                }

            },

            plugins: {

                legend: {

                    labels: {

                        color: "#ffffff"

                    }

                }

            }

        }

    });

}


// ==================================
// START WEBSITE
// ==================================

function initializeWebsite() {

    displayRecords();

    displayGoals();

    updateDashboard();

    updateAnalytics();

}


// RUN

initializeWebsite();
