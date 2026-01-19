const timerDisplay = document.getElementById('timer');
const statusText = document.getElementById('status-text');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const alarmSound = document.getElementById('alarm-sound');
const body = document.body;

// Progress Ring Elements
const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

// Setup circle stroke
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = 0;

function setProgress(percent) {
    // Correct logic: we want it to decrease. 
    // offset = 0 means full. offset = circumference means empty.
    // percent is "percent remaining". 
    // so if 100% remaining (start), offset should be 0.
    // if 0% remaining (end), offset should be circumference.
    // formula: offset = circumference - (percent / 100) * circumference
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

const WORK_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

let timeLeft = WORK_TIME;
let timerId = null;
let isWorkMode = true;

// Request notification permission
if (Notification.permission !== 'granted') {
    Notification.requestPermission();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update title
    document.title = `${timerDisplay.textContent} - ${isWorkMode ? '专注' : '休息'}`;

    // Update progress ring
    const totalTime = isWorkMode ? WORK_TIME : BREAK_TIME;
    const percent = (timeLeft / totalTime) * 100;
    setProgress(percent);
}

function switchMode() {
    isWorkMode = !isWorkMode;
    timeLeft = isWorkMode ? WORK_TIME : BREAK_TIME;
    
    if (isWorkMode) {
        statusText.textContent = "专注时间";
        body.classList.remove('break-mode');
        body.classList.add('work-mode');
        sendNotification("休息结束", "该开始专注工作了！加油！");
    } else {
        statusText.textContent = "站立休息";
        body.classList.remove('work-mode');
        body.classList.add('break-mode');
        sendNotification("专注结束", "请站起来活动一下，休息5分钟！", true);
    }
    updateDisplay();
}

function sendNotification(title, body, playSound = false) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/2928/2928956.png' // Generic tomato icon
        });
    }
    if (playSound) {
        try {
            alarmSound.currentTime = 0;
            alarmSound.play();
        } catch (e) {
            console.log("Audio play failed", e);
        }
    }
}

function startTimer() {
    if (timerId) return;
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft < 0) {
            clearInterval(timerId);
            timerId = null;
            switchMode();
            startTimer(); // Auto start next phase? Let's make it auto for now, or maybe manual? 
            // Usually Pomodoro is auto or manual. Let's keep it auto-running for the loop 25-5.
            // But maybe better to pause and let user confirm? 
            // Requirement says "remind me", so continuous loop might be better or just stop and alarm.
            // Let's stop and alarm, waiting for user to click start for next phase is often better UX to avoid missing it.
            // BUT, to force the "loop", I will stop the timer but show the alert.
            // Wait, actually, let's keep it running or just stop? 
            // Let's pause and wait for user to start the next session to be safe, 
            // BUT showing the notification is key.
            // Let's try auto-transition but maybe pause?
            // Let's implement auto-transition for "flow".
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetTimer() {
    pauseTimer();
    isWorkMode = true;
    timeLeft = WORK_TIME;
    statusText.textContent = "准备专注";
    body.classList.remove('break-mode');
    body.classList.remove('work-mode');
    updateDisplay();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initial display
updateDisplay();
