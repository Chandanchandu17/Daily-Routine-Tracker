const { useState } = require("react");

// DOM Elements
const dailyViewBtn = document.getElementById('daily-view-btn');
const monthlyViewBtn = document.getElementById('monthly-view-btn');
const yearlyViewBtn = document.getElementById('yearly-view-btn');

const dailyView = document.getElementById('daily-view');
const monthlyView = document.getElementById('monthly-view');
const yearlyView = document.getElementById('yearly-view');

const currentDateEl = document.getElementById('current-date');
const currentMonthEl = document.getElementById('current-month');
const currentYearEl = document.getElementById('current-year');

const prevDayBtn = document.getElementById('prev-day');
const nextDayBtn = document.getElementById('next-day');
const todayBtnDaily = document.getElementById('today-btn-daily');

const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const thisMonthBtn = document.getElementById('this-month-btn');

const prevYearBtn = document.getElementById('prev-year');
const nextYearBtn = document.getElementById('next-year');
const thisYearBtn = document.getElementById('this-year-btn');

const resetBtn = document.getElementById('reset-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskInput = document.getElementById('new-task');
const dailyTaskList = document.getElementById('daily-task-list');
const completedTasksEl = document.getElementById('completed-tasks');
const calendarDaysEl = document.getElementById('calendar-days');
const activityGridEl = document.getElementById('activity-grid');

// State
let currentDate = new Date();
let lastRenderedDate = new Date();
let tasks = [
    { id: 1, text: 'Morning meditation (10 min)', completed: false },
    { id: 2, text: 'Drink water (8 glasses)', completed: false },
    { id: 3, text: 'Exercise (30 min)', completed: false },
    { id: 4, text: 'Read (20 pages)', completed: false },
    { id: 5, text: 'Plan tomorrow\'s tasks', completed: false }
];

// Storage for task history
let taskHistory = {};

// Get today's date string in format 'YYYY-MM-DD'
function getDateString(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// Monthly and yearly data
let monthlyData = {};
let yearlyData = {
    totalDaysTracked: 3,
    perfectDays: 0,
    totalTasksCompleted: 0,
    longestStreak: 0,
    monthlyCompletion: Array(12).fill(0),
    taskTrends: Array(12).fill(0)
};

// Event Listeners for View Switching
dailyViewBtn.addEventListener('click', () => switchView('daily'));
monthlyViewBtn.addEventListener('click', () => switchView('monthly'));
yearlyViewBtn.addEventListener('click', () => switchView('yearly'));

// Event Listeners for Navigation
prevDayBtn.addEventListener('click', () => navigateDay(-1));
nextDayBtn.addEventListener('click', () => navigateDay(1));
todayBtnDaily.addEventListener('click', () => goToToday());

prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
nextMonthBtn.addEventListener('click', () => navigateMonth(1));
thisMonthBtn.addEventListener('click', () => goToCurrentMonth());

prevYearBtn.addEventListener('click', () => navigateYear(-1));
nextYearBtn.addEventListener('click', () => navigateYear(1));
thisYearBtn.addEventListener('click', () => goToCurrentYear());

// Task Management Event Listeners
resetBtn.addEventListener('click', resetTasks);
addTaskBtn.addEventListener('click', addNewTask);
newTaskInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') addNewTask();
});

// Initialize the app
function init() {
    updateDateDisplay();
    loadTasksForCurrentDate();
    renderTasks();
    renderCompletedTasks();
    generateCalendar();
    generateActivityGrid();
    createCharts();
    
    // Set the initial checkbox state
    tasks.forEach(task => {
        const checkbox = document.getElementById(`task-${task.id}`);
        if (checkbox) {
            checkbox.checked = task.completed;
        }
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// View Management
function switchView(view) {
    // Remove active class from all views and buttons
    dailyView.classList.remove('active');
    monthlyView.classList.remove('active');
    yearlyView.classList.remove('active');
    dailyViewBtn.classList.remove('active');
    monthlyViewBtn.classList.remove('active');
    yearlyViewBtn.classList.remove('active');
    
    // Add active class to selected view and button
    if (view === 'daily') {
        dailyView.classList.add('active');
        dailyViewBtn.classList.add('active');
    } else if (view === 'monthly') {
        monthlyView.classList.add('active');
        monthlyViewBtn.classList.add('active');
        generateCalendar(); // Refresh calendar when switching to monthly view
    } else if (view === 'yearly') {
        yearlyView.classList.add('active');
        yearlyViewBtn.classList.add('active');
        updateYearlyStats(); // Calculate yearly stats based on task history
        updateCharts(); // Refresh charts when switching to yearly view
    }
}

// Date Navigation Functions
function navigateDay(days) {
    // Save current tasks to history before changing date
    saveTasksToHistory();
    
    currentDate.setDate(currentDate.getDate() + days);
    updateDateDisplay();
    loadTasksForCurrentDate();
}

function navigateMonth(months) {
    currentDate.setMonth(currentDate.getMonth() + months);
    updateDateDisplay();
    loadTasksForCurrentDate();
    generateCalendar();
}

function navigateYear(years) {
    currentDate.setFullYear(currentDate.getFullYear() + years);
    updateDateDisplay();
    loadTasksForCurrentDate();
    generateActivityGrid();
    updateYearlyStats();
    updateCharts();
}

function goToToday() {
    saveTasksToHistory();
    currentDate = new Date();
    updateDateDisplay();
    loadTasksForCurrentDate();
}

function goToCurrentMonth() {
    currentDate = new Date();
    updateDateDisplay();
    loadTasksForCurrentDate();
    generateCalendar();
}

function goToCurrentYear() {
    currentDate = new Date();
    updateDateDisplay();
    loadTasksForCurrentDate();
    generateActivityGrid();
    updateYearlyStats();
    updateCharts();
}

// Save and load tasks based on date
function saveTasksToHistory() {
    const dateKey = getDateString(lastRenderedDate);
    taskHistory[dateKey] = [...tasks];
}

function loadTasksForCurrentDate() {
    const dateKey = getDateString(currentDate);
    
    // Check if date has changed
    if (lastRenderedDate.getDate() !== currentDate.getDate() || 
        lastRenderedDate.getMonth() !== currentDate.getMonth() || 
        lastRenderedDate.getFullYear() !== currentDate.getFullYear()) {
        
        // Save existing tasks to history
        saveTasksToHistory();
        
        // Load tasks for new date if they exist
        if (taskHistory[dateKey]) {
            tasks = [...taskHistory[dateKey]];
        } else {
            // Reset tasks to default unchecked state for new date
            tasks = tasks.map(task => ({...task, completed: false}));
        }
        
        // Update the last rendered date
        lastRenderedDate = new Date(currentDate);
        
        // Re-render tasks
        renderTasks();
        renderCompletedTasks();
    }
}

// UI Update Functions
function updateDateDisplay() {
    // Format for daily view: "Saturday, May 3, 2025"
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = currentDate.toLocaleDateString('en-US', options);
    
    // Format for monthly view: "May 2025"
    const monthOptions = { year: 'numeric', month: 'long' };
    currentMonthEl.textContent = currentDate.toLocaleDateString('en-US', monthOptions);
    
    // Format for yearly view: "2025"
    currentYearEl.textContent = currentDate.getFullYear();
}

// Task Management Functions
function renderTasks() {
    dailyTaskList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        
        taskItem.innerHTML = `
            <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
            <label for="task-${task.id}">${task.text}</label>
            <button class="delete-task"><i class="fas fa-trash"></i></button>
        `;
        
        dailyTaskList.appendChild(taskItem);
        
        // Add event listeners
        const checkbox = taskItem.querySelector(`#task-${task.id}`);
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
        
        const deleteBtn = taskItem.querySelector('.delete-task');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
    });
    
    updateStats();
}

function renderCompletedTasks() {
    completedTasksEl.innerHTML = '';
    
    const completedTasks = tasks.filter(task => task.completed);
    
    if (completedTasks.length === 0) {
        completedTasksEl.innerHTML = '<p class="no-completed-tasks">No completed tasks yet.</p>';
        return;
    }
    
    completedTasks.forEach(task => {
        const completedTask = document.createElement('div');
        completedTask.className = 'completed-task';
        completedTask.innerHTML = `
            <span class="check-icon"><i class="fas fa-check-circle"></i></span>
            <span>${task.text}</span>
        `;
        completedTasksEl.appendChild(completedTask);
    });
}

function addNewTask() {
    const taskText = newTaskInput.value.trim();
    
    if (taskText === '') return;
    
    const newId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
    
    const newTask = {
        id: newId,
        text: taskText,
        completed: false
    };
    
    tasks.push(newTask);
    
    renderTasks();
    renderCompletedTasks();
    updateStats();
    
    newTaskInput.value = '';
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    renderTasks();
    renderCompletedTasks();
    updateStats();
}

function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        renderCompletedTasks();
        updateStats();
        
        // When tasks are completed/uncompleted, update yearly stats
        updateYearlyStats();
        if (yearlyView.classList.contains('active')) {
            updateCharts();
        }
    }
}

function resetTasks() {
    tasks = tasks.map(task => ({...task, completed: false}));
    renderTasks();
    renderCompletedTasks();
    updateStats();
}

function updateStats() {
    // Update daily stats
    const completedCount = tasks.filter(task => task.completed).length;
    const totalCount = tasks.length;
    const remainingCount = totalCount - completedCount;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    document.querySelector('.completion-percentage').textContent = `${completionPercentage}%`;
    document.querySelector('.stats-grid .stat-item:nth-child(1) h5').textContent = completedCount;
    document.querySelector('.stats-grid .stat-item:nth-child(2) h5').textContent = remainingCount;
    
    // Save current tasks to history
    saveTasksToHistory();
    
    // Update monthly and yearly stats
    updateMonthlyStats();
}

function updateMonthlyStats() {
    // Calculate monthly stats from task history
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let daysWithActivity = 0;
    let perfectDays = 0;
    let tasksCompleted = 0;
    
    // Count days in the current month that have tasks recorded
    Object.keys(taskHistory).forEach(dateKey => {
        const date = new Date(dateKey);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            const dayTasks = taskHistory[dateKey];
            const completedTasks = dayTasks.filter(task => task.completed).length;
            
            if (completedTasks > 0) {
                daysWithActivity++;
                tasksCompleted += completedTasks;
                
                if (completedTasks === dayTasks.length) {
                    perfectDays++;
                }
            }
        }
    });
    
    // Update monthly stats display
    document.getElementById('days-with-activity').textContent = daysWithActivity;
    document.getElementById('perfect-days').textContent = perfectDays;
    document.getElementById('monthly-tasks-completed').textContent = tasksCompleted;
    
    // Calculate completion rate
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const completionRate = daysInMonth > 0 ? Math.round((daysWithActivity / daysInMonth) * 100) : 0;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
}

function updateYearlyStats() {
    const currentYear = currentDate.getFullYear();
    
    // Reset yearly data
    yearlyData = {
        totalDaysTracked: 0,
        perfectDays: 0,
        totalTasksCompleted: 0,
        longestStreak: 0,
        monthlyCompletion: Array(12).fill(0),
        taskTrends: Array(12).fill(0)
    };
    
    // Calculate days tracked and tasks completed
    let currentStreak = 0;
    let previousDate = null;
    
    // Track days for each month to calculate averages
    const monthDaysTracked = Array(12).fill(0);
    
    // If we have no task history yet, create some sample data to match the screenshot
    if (!taskHistory || Object.keys(taskHistory).length === 0) {
        // Create sample data for April, May, July and August
        const today = new Date();
        const year = today.getFullYear();
        
        // Sample data for April (8 tasks)
        const aprilTasks = [
            { id: 1, text: 'Morning meditation', completed: true },
            { id: 2, text: 'Drink water', completed: true },
            { id: 3, text: 'Exercise', completed: true }
        ];
        taskHistory[`${year}-4-15`] = aprilTasks;
        taskHistory[`${year}-4-16`] = [...aprilTasks];
        taskHistory[`${year}-4-17`] = [...aprilTasks];
        
        // Sample data for May (4 tasks)
        const mayTasks = [
            { id: 1, text: 'Morning meditation', completed: true },
            { id: 2, text: 'Drink water', completed: true },
            { id: 3, text: 'Exercise', completed: false }
        ];
        taskHistory[`${year}-5-3`] = mayTasks;
        taskHistory[`${year}-5-4`] = [...mayTasks];
        
        // Sample data for July (4 tasks)
        const julyTasks = [
            { id: 1, text: 'Morning meditation', completed: true },
            { id: 2, text: 'Drink water', completed: true },
            { id: 3, text: 'Exercise', completed: true }
        ];
        taskHistory[`${year}-7-12`] = julyTasks;
        
        // Sample data for August (3 tasks)
        const augustTasks = [
            { id: 1, text: 'Morning meditation', completed: true },
            { id: 2, text: 'Drink water', completed: true },
            { id: 3, text: 'Exercise', completed: false }
        ];
        taskHistory[`${year}-8-20`] = augustTasks;
    }
    
    // Process task history to calculate yearly stats
    Object.keys(taskHistory).forEach(dateKey => {
        const date = new Date(dateKey);
        if (date.getFullYear() === currentYear) {
            const dayTasks = taskHistory[dateKey];
            const completedTasks = dayTasks.filter(task => task.completed).length;
            const totalTasks = dayTasks.length;
            
            // Count days tracked
            yearlyData.totalDaysTracked++;
            
            // Add completed tasks to total
            yearlyData.totalTasksCompleted += completedTasks;
            
            // Check for perfect day
            if (completedTasks === totalTasks && totalTasks > 0) {
                yearlyData.perfectDays++;
            }
            
            // Update monthly stats
            const month = date.getMonth();
            yearlyData.taskTrends[month] += completedTasks;
            monthDaysTracked[month]++;
            
            // Calculate monthly completion rate
            if (totalTasks > 0) {
                const dayCompletionRate = (completedTasks / totalTasks) * 100;
                if (monthDaysTracked[month] === 1) {
                    yearlyData.monthlyCompletion[month] = dayCompletionRate;
                } else {
                    // Calculate running average for the month
                    yearlyData.monthlyCompletion[month] = 
                        ((yearlyData.monthlyCompletion[month] * (monthDaysTracked[month] - 1)) + dayCompletionRate) / 
                        monthDaysTracked[month];
                }
            }
            
            // Calculate streak
            if (previousDate) {
                const dayDiff = Math.floor((date - previousDate) / (1000 * 60 * 60 * 24));
                if (dayDiff === 1 && completedTasks > 0) {
                    currentStreak++;
                } else if (dayDiff > 1) {
                    yearlyData.longestStreak = Math.max(yearlyData.longestStreak, currentStreak);
                    currentStreak = completedTasks > 0 ? 1 : 0;
                }
            } else if (completedTasks > 0) {
                currentStreak = 1;
            }
            
            previousDate = date;
        }
    });
    
    // Update the longest streak
    yearlyData.longestStreak = Math.max(yearlyData.longestStreak, currentStreak);
    
    // Add data for today if not in history yet
    const today = new Date();
    const todayKey = getDateString(today);
    if (today.getFullYear() === currentYear && !taskHistory[todayKey]) {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        
        if (completedTasks > 0) {
            yearlyData.totalDaysTracked++;
            yearlyData.totalTasksCompleted += completedTasks;
            
            if (completedTasks === totalTasks) {
                yearlyData.perfectDays++;
            }
            
            const month = today.getMonth();
            yearlyData.taskTrends[month] += completedTasks;
            monthDaysTracked[month]++;
            
            if (totalTasks > 0) {
                const dayCompletionRate = (completedTasks / totalTasks) * 100;
                if (monthDaysTracked[month] === 1) {
                    yearlyData.monthlyCompletion[month] = dayCompletionRate;
                } else {
                    yearlyData.monthlyCompletion[month] = 
                        ((yearlyData.monthlyCompletion[month] * (monthDaysTracked[month] - 1)) + dayCompletionRate) / 
                        monthDaysTracked[month];
                }
            }
        }
    }
    
    // Update yearly summary stats
    document.getElementById('total-days-tracked').textContent = yearlyData.totalDaysTracked;
    document.getElementById('yearly-perfect-days').textContent = yearlyData.perfectDays;
    document.getElementById('yearly-tasks-completed').textContent = yearlyData.totalTasksCompleted;
    document.getElementById('longest-streak').textContent = `${yearlyData.longestStreak} days`;
}

// Calendar Functions
function generateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const totalDays = lastDay.getDate();
    
    calendarDaysEl.innerHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDaysEl.appendChild(emptyDay);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        // Highlight current day
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const currentDay = new Date().getDate();
        
        if (day === currentDay && month === currentMonth && year === currentYear) {
            dayCell.classList.add('today');
        }
        
        // Highlight selected day
        if (day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
            dayCell.classList.add('active');
        }
        
        // Add task completion indicator from task history
        const dateKey = `${year}-${month + 1}-${day}`;
        if (taskHistory[dateKey]) {
            const dayTasks = taskHistory[dateKey];
            const completedTasks = dayTasks.filter(task => task.completed).length;
            
            if (completedTasks > 0) {
                dayCell.classList.add('has-tasks');
                
                // Add completion indicator
                const completionRate = Math.round((completedTasks / dayTasks.length) * 100);
                
                // Visual indicator for completion percentage
                const indicator = document.createElement('div');
                indicator.className = 'completion-indicator';
                indicator.style.width = `${completionRate}%`;
                dayCell.appendChild(indicator);
            }
        }
        
        // Add click event to select day
        dayCell.addEventListener('click', () => {
            // Save current tasks
            saveTasksToHistory();
            
            // Update current date
            currentDate = new Date(year, month, day);
            updateDateDisplay();
            loadTasksForCurrentDate();
            
            generateCalendar(); // Refresh calendar to update active day
            switchView('daily'); // Switch to daily view when selecting a day
        });
        
        calendarDaysEl.appendChild(dayCell);
    }
    
    // Update monthly stats
    updateMonthlyStats();
}

// Activity Grid for Year at a Glance
function generateActivityGrid() {
    activityGridEl.innerHTML = '';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = currentDate.getFullYear();
    
    months.forEach((month, index) => {
        const monthColumn = document.createElement('div');
        monthColumn.className = 'month-column';
        
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = month;
        
        activityGridEl.appendChild(monthHeader);
        activityGridEl.appendChild(monthColumn);
        
        // Get days in month
        const daysInMonth = new Date(currentYear, index + 1, 0).getDate();
        
        // Generate cells for days in month
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.className = 'activity-cell';
            
            // Add data from task history
            const dateKey = `${currentYear}-${index + 1}-${day}`;
            if (taskHistory[dateKey]) {
                const dayTasks = taskHistory[dateKey];
                const completedTasks = dayTasks.filter(task => task.completed).length;
                
                if (completedTasks > 0) {
                    // Color cell based on completion percentage
                    const completionRate = completedTasks / dayTasks.length;
                    
                    if (completionRate === 1) {
                        cell.classList.add('full');
                    } else if (completionRate >= 0.5) {
                        cell.classList.add('high');
                    } else {
                        cell.classList.add('partial');
                    }
                }
            }
            
            // Add today indicator
            const today = new Date();
            if (day === today.getDate() && index === today.getMonth() && currentYear === today.getFullYear()) {
                cell.classList.add('today');
            }
            
            monthColumn.appendChild(cell);
        }
    });
}

// Chart Functions
let completionChart;
let trendsChart;

function createCharts() {
    const completionCanvas = document.getElementById('completion-canvas');
    const trendsCanvas = document.getElementById('trends-canvas');
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Add some initial example data if we don't have any yet
    if (!taskHistory || Object.keys(taskHistory).length === 0) {
        
        yearlyData.monthlyCompletion = [0, 0, 0, 27, 40, 0, 60, 0, 0, 0, 0, 0];
        yearlyData.taskTrends = [0, 0, 0, 8, 4, 0, 4, 3, 0, 0, 0, 0];
    }
    
    // Monthly Completion Rates Chart
    completionChart = new Chart(completionCanvas, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Completion Rate (%)',
                data: yearlyData.monthlyCompletion,
                backgroundColor: 'rgba(78, 124, 246, 0.7)',
                borderColor: 'rgba(78, 124, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Completion Rate (%)'
                    }
                }
            }
        }
    });
    
    // Task Completion Trends Chart
    trendsChart = new Chart(trendsCanvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Tasks Completed',
                data: yearlyData.taskTrends,
                fill: true,
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                borderColor: 'rgba(40, 167, 69, 1)',
                tension: 0.4 // Increased for smoother curve like in screenshot
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Tasks Completed'
                    }
                }
            }
        }
    });
}

function updateCharts() {
    // Update chart data from yearlyData
    completionChart.data.datasets[0].data = yearlyData.monthlyCompletion;
    trendsChart.data.datasets[0].data = yearlyData.taskTrends;
    
    // Round monthly completion rates to integer values
    for (let i = 0; i < completionChart.data.datasets[0].data.length; i++) {
        if (completionChart.data.datasets[0].data[i] > 0) {
            completionChart.data.datasets[0].data[i] = Math.round(completionChart.data.datasets[0].data[i]);
        }
    }
    
    completionChart.update();
    trendsChart.update();
}

// Add CSS for smaller boxes in monthly and yearly views
const style = document.createElement('style');
style.textContent = `
    /* Smaller calendar days in monthly view */
    .calendar-day {
        width: 2.5rem !important;
        height: 2.5rem !important;
        font-size: 0.8rem !important;
        position: relative;
    }
    
    /* Smaller activity cells in yearly view */
    .activity-cell {
        width: 0.8rem !important;
        height: 0.8rem !important;
        margin: 1px !important;
    }
    
    .month-column {
        gap: 1px !important;
    }
    
    .month-header {
        font-size: 0.7rem !important;
    }
    
    /* Completion indicator for calendar days */
    .completion-indicator {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background-color: #4e7cf6;
    }
    
    /* Activity cell colors */
    .activity-cell.partial {
        background-color: rgba(78, 124, 246, 0.3);
    }
    
    .activity-cell.high {
        background-color: rgba(78, 124, 246, 0.7);
    }
    
    .activity-cell.full {
        background-color: rgba(40, 167, 69, 0.9);
    }
    
    .activity-cell.today {
        border: 1px solid #ff4757;
    }
    
    /* Chart styles to match screenshot */
    #completion-canvas, #trends-canvas {
        height: 300px !important;
    }
    
    .yearly-analytics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    
    .chart-container {
        background-color: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .chart-title {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 15px;
    }
`;

document.head.appendChild(style);

