// Main JavaScript for ACE Learning Platform

// Backend configuration with auto-detection
let ACE_OFFLINE = false; // Try backend first

// Supabase configuration
const SUPABASE_URL = 'https://psghvqbhwpuqicvujlus.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZ2h2cWJod3B1cWljdnVqbHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDA1ODksImV4cCI6MjA4MjMxNjU4OX0.n752Ncd_DjDe_-DBbt5SSl77p0wqPs7E_da-ugQ6H58';

let supabaseClient = null;

function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    if (!window.supabase || !window.supabase.createClient) {
        return null;
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
}

async function getSupabaseAccessToken() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data?.session?.access_token || null;
}

async function fetchWithAuth(url, options = {}) {
    const token = await getSupabaseAccessToken();
    const headers = {
        ...(options.headers || {}),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
}

// API Base URL - auto-detect environment
// Check if running locally (localhost, 127.0.0.1, or file://)
const isLocal = window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
    || window.location.hostname === ''
    || window.location.protocol === 'file:';

// ==================== API CONFIGURATION ====================
// IMPORTANT: Update production URL before deploying!
// 
// Deployment Steps:
// 1. Deploy backend to: Render, Railway, Heroku, or AWS
// 2. Get your backend URL (e.g., https://ace-backend-abc123.onrender.com)
// 3. Replace 'your-production-api.com' below with your actual backend URL
// 4. Deploy frontend to: Netlify, Vercel, or GitHub Pages
//
// Example production URLs:
// - Render: https://ace-backend.onrender.com/api
// - Railway: https://ace-backend.up.railway.app/api
// - Heroku: https://ace-backend.herokuapp.com/api
//
const API_BASE_URL = isLocal
    ? 'http://localhost:5000/api'
    : window.location.origin + '/api';

console.log('🌐 Environment detected:', isLocal ? 'Local' : 'Production');
console.log('📡 API Base URL:', API_BASE_URL);

// DOM Elements - will be set after DOM loads
let modal, modalContent, closeBtn, contactForm;

// Initialize DOM elements when ready
function initializeDOMElements() {
    modal = document.getElementById('gameModal');
    modalContent = document.getElementById('gameContent');
    closeBtn = document.querySelector('.close');
    contactForm = document.getElementById('contactForm');

    // Set up close button
    if (closeBtn) {
        closeBtn.onclick = function () {
            if (modal) modal.style.display = 'none';
        };
    }

    console.log('✅ DOM Elements initialized');
}

// Game modal functionality
function openGameModal() {
    const modal = document.getElementById('gameModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeGameModal() {
    const modal = document.getElementById('gameModal');
    if (modal) {
        // Clear any math game timers before closing
        if (window.mathGameState && window.mathGameState.timer) {
            clearInterval(window.mathGameState.timer);
            console.log('Cleared math game timer in closeGameModal');
        }

        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modal = document.getElementById('gameModal');
    if (event.target === modal) {
        closeGameModal();
    }
});

// Close modal with escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeGameModal();
    }
});

// Initialize the platform
document.addEventListener('DOMContentLoaded', function () {
    initializePlatform();
});

// Platform initialization
function initializePlatform() {
    // Add smooth scrolling to navigation links
    addSmoothScrolling();

    // Initialize contact form
    initializeContactForm();

    // Add scroll effects
    addScrollEffects();

    // Initialize floating shapes animation
    initializeFloatingShapes();

    // Initialize backend connection
    initializeBackend();
}

// Smooth scrolling for navigation
function addSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            // Skip if href is empty or just '#'
            if (!targetId || targetId === '#') return;

            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll to games section
function scrollToGames() {
    const gamesSection = document.getElementById('games');
    gamesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Scroll to about section
function scrollToAbout() {
    const aboutSection = document.getElementById('about');
    aboutSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Add scroll effects with theme support
function addScrollEffects() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Trigger once on load
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    }
}

// Backend Integration Functions
// const API_BASE_URL = 'http://localhost:5000/api';

// Initialize backend connection with smart fallback
async function initializeBackend() {
    if (ACE_OFFLINE) {
        console.log('🔌 Backend disabled: running in offline frontend-only mode');
        return;
    }

    console.log('🔄 Testing backend connection...');
    const isConnected = await testBackendConnection();

    if (isConnected) {
        console.log('✅ Backend connected successfully');
    } else {
        console.warn('⚠️ Backend unavailable - switching to offline mode');
        ACE_OFFLINE = true;
    }
}

// Test backend connection with timeout
async function testBackendConnection() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetchWithAuth(`${API_BASE_URL}/health`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            return true;
        } else {
            console.warn(`Backend returned status ${response.status}`);
            return false;
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('Backend connection timeout');
        } else {
            console.warn('Backend connection error:', error.message);
        }
        return false;
    }
}

// Save progress to backend with offline backup
async function saveProgress(module, eventType, scoreDelta, userId = null) {
    // Auto-fill user ID if not provided
    if (!userId) {
        userId = getCurrentUserId();
    }

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/progress/event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                module: module,
                event_type: eventType,
                score_delta: scoreDelta,
                user_id: userId
            })
        });

        if (response.ok) {
            console.log('✅ Progress saved successfully');
            return true;
        } else {
            console.log('⚠️ Failed to save progress - saving locally');
            saveProgressLocally(module, eventType, scoreDelta, userId);
            return false;
        }
    } catch (error) {
        console.error('❌ Error saving progress - saving locally:', error);
        saveProgressLocally(module, eventType, scoreDelta, userId);
        return false;
    }
}

// Save detailed question progress
async function submitDetailedProgress(module, questionData, userAnswer, isCorrect, scoreEarned, userId = null) {
    if (!userId) {
        userId = getCurrentUserId();
    }

    const payload = {
        module,
        question_data: questionData,
        user_answer: userAnswer,
        is_correct: isCorrect,
        score_earned: scoreEarned,
        user_id: userId
    };

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/progress/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.debug('✅ Detailed progress saved successfully');
            return true;
        } else {
            console.warn('⚠️ Failed to save detailed progress');
            return false;
        }
    } catch (error) {
        console.error('❌ Error saving detailed progress:', error);
        return false;
    }
}

// Save progress locally as backup
function saveProgressLocally(module, eventType, scoreDelta, userId) {
    try {
        const offlineProgress = JSON.parse(localStorage.getItem('ace_offline_progress') || '[]');
        offlineProgress.push({
            module,
            event_type: eventType,
            score_delta: scoreDelta,
            user_id: userId,
            timestamp: Date.now()
        });
        localStorage.setItem('ace_offline_progress', JSON.stringify(offlineProgress));
        console.log('💾 Progress saved locally');
    } catch (error) {
        console.error('Failed to save locally:', error);
    }
}

// Get progress summary from backend
async function getProgressSummary(userId = null) {
    try {
        const url = userId ? `${API_BASE_URL}/progress/summary?user_id=${userId}` : `${API_BASE_URL}/progress/summary`;
        const response = await fetchWithAuth(url);

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to get progress summary');
            return null;
        }
    } catch (error) {
        console.error('Error getting progress summary:', error);
        return null;
    }
}

// Get leaderboard from backend
async function getLeaderboard() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/leaderboard/top`);

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to get leaderboard');
            return null;
        }
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return null;
    }
}

// Get language question from backend
async function getLanguageQuestion(category = 'synonyms', level = 1) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/language/next?category=${category}&level=${level}`);

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to get language question');
            return null;
        }
    } catch (error) {
        console.error('Error getting language question:', error);
        return null;
    }
}

// Get puzzle question from backend
async function getPuzzleQuestion(puzzleType = 'sequence', level = 1) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/puzzle/next?type=${puzzleType}&level=${level}`);

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to get puzzle question');
            return null;
        }
    } catch (error) {
        console.error('Error getting puzzle question:', error);
        return null;
    }
}

// User authentication functions
async function registerUser(email, password, name = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                name: name
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User registered successfully');
            return data;
        } else {
            const error = await response.json();
            console.error('Registration failed:', error.error);
            return null;
        }
    } catch (error) {
        console.error('Error registering user:', error);
        return null;
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User logged in successfully');
            return data;
        } else {
            const error = await response.json();
            console.error('Login failed:', error.error);
            return null;
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        return null;
    }
}

// Get current user ID from localStorage
function getCurrentUserId() {
    return localStorage.getItem('ace_user_id');
}

// Set current user ID in localStorage
function setCurrentUserId(userId) {
    localStorage.setItem('ace_user_id', userId);
}

// Clear current user ID from localStorage
function clearCurrentUserId() {
    localStorage.removeItem('ace_user_id');
}

// Export functions for use in other modules
window.ACEBackend = {
    saveProgress,
    submitDetailedProgress,
    getProgressSummary,
    getLeaderboard,
    getLanguageQuestion,
    getPuzzleQuestion,
    registerUser,
    loginUser,
    getCurrentUserId,
    setCurrentUserId,
    clearCurrentUserId,
    updateAuthUI
};

// Initialize floating shapes
function initializeFloatingShapes() {
    const shapes = document.querySelectorAll('.shape');

    shapes.forEach((shape, index) => {
        // Add random movement variations
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDelay = Math.random() * 2;

        shape.style.setProperty('--random-x', randomX);
        shape.style.setProperty('--random-y', randomY);
        shape.style.animationDelay = `${randomDelay}s`;
    });
}

function openGame(gameType) {
    // Show loading state
    LoadingManager.show('Loading game...');

    // Small delay to show loading (simulates content loading)
    setTimeout(() => {
        const gameContent = getGameContent(gameType);
        modalContent.innerHTML = gameContent;
        modal.style.display = 'block';

        // Initialize the specific game
        initializeGame(gameType);

        // Hide loading
        LoadingManager.hide();
    }, 300);
}

// Get game content based on type
function getGameContent(gameType) {
    const gameTitles = {
        'math': 'Math Practice',
        'language': 'Language Learning',
        'puzzle': 'Puzzle Solver',
        'battle': 'Quiz Battle',
        'progress': 'Progress Tracker'
    };

    return `
        <div class="game-header">
            <h2>${gameTitles[gameType]}</h2>
            <p>Enhance your cognitive skills with this interactive module</p>
        </div>
        <div id="gameContainer" class="game-container">
            <!-- Game content will be loaded here -->
        </div>
    `;
}

// Initialize specific games
function initializeGame(gameType) {
    const gameContainer = document.getElementById('gameContainer');

    switch (gameType) {
        case 'math':
            initializeMathGame(gameContainer);
            break;
        case 'language':
            initializeLanguageGame(gameContainer);
            break;
        case 'puzzle':
            initializePuzzleGame(gameContainer);
            break;
        case 'battle':
            initializeBattleGame(gameContainer);
            break;
        case 'progress':
            initializeProgressGame(gameContainer);
            break;
    }
}

// Math Game
function initializeMathGame(container) {
    container.innerHTML = `
        <div class="math-game">
            <div class="level-selector">
                <h3>Select Difficulty</h3>
                <div class="level-buttons">
                    <button class="level-btn active" data-level="1" onclick="selectMathLevel(1)">Beginner</button>
                    <button class="level-btn" data-level="2" onclick="selectMathLevel(2)">Intermediate</button>
                    <button class="level-btn" data-level="3" onclick="selectMathLevel(3)">Advanced</button>
                    <button class="level-btn" data-level="4" onclick="selectMathLevel(4)">Expert</button>
                </div>
            </div>
            
            <div class="game-stats">
                <div class="stat">
                    <span class="stat-label">Score:</span>
                    <span id="mathScore" class="stat-value">0</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Level:</span>
                    <span id="mathLevel" class="stat-value">1</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Time:</span>
                    <span id="mathTime" class="stat-value">30</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Streak:</span>
                    <span id="mathStreak" class="stat-value">0</span>
                </div>
            </div>
            
            <div class="question-container">
                <div class="level-indicator">
                    <span class="level-badge" id="levelBadge">Level 1</span>
                </div>
                <div id="mathQuestion" class="question">What is 5 + 3?</div>
                <div class="options">
                    <button class="option-btn" onclick="checkMathAnswer(7)">7</button>
                    <button class="option-btn" onclick="checkMathAnswer(8)">8</button>
                    <button class="option-btn" onclick="checkMathAnswer(9)">9</button>
                    <button class="option-btn" onclick="checkMathAnswer(6)">6</button>
                </div>
            </div>
            
            <div class="game-controls">
                <button id="startMathBtn" class="control-btn" onclick="startMathGame()">Start Game</button>
                <button class="control-btn" onclick="resetMathGame()">Reset</button>
                <button class="control-btn" onclick="showMathHint()">Hint</button>
            </div>
            
            <div id="mathFeedback" class="feedback"></div>
            
            <div class="progress-bar">
                <div class="progress-fill" id="mathProgress"></div>
            </div>
        </div>
    `;

    // Initialize with level 1
    selectMathLevel(1);
}

// Language Game
function initializeLanguageGame(container) {
    container.innerHTML = `
        <div class="language-game">
            <div class="level-selector">
                <h3>Select Category & Difficulty</h3>
                <div class="category-buttons">
                    <button class="category-btn active" data-category="synonyms" onclick="selectLangCategory('synonyms')">Synonyms</button>
                    <button class="category-btn" data-category="antonyms" onclick="selectLangCategory('antonyms')">Antonyms</button>
                    <button class="category-btn" data-category="definitions" onclick="selectLangCategory('definitions')">Definitions</button>
                    <button class="category-btn" data-category="word-pairs" onclick="selectLangCategory('word-pairs')">Word Pairs</button>
                </div>
                <div class="level-buttons">
                    <button class="level-btn active" data-level="1" onclick="selectLangLevel(1)">Easy</button>
                    <button class="level-btn" data-level="2" onclick="selectLangLevel(2)">Medium</button>
                    <button class="level-btn" data-level="3" onclick="selectLangLevel(3)">Hard</button>
                </div>
            </div>
            
            <div class="game-stats">
                <div class="stat">
                    <span class="stat-label">Score:</span>
                    <span id="langScore" class="stat-value">0</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Category:</span>
                    <span id="langCategory" class="stat-value">Synonyms</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Level:</span>
                    <span id="langLevel" class="stat-value">1</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Combo:</span>
                    <span id="langCombo" class="stat-value">0</span>
                </div>
            </div>
            
            <div class="question-container">
                <div class="category-indicator">
                    <span class="category-badge" id="categoryBadge">Synonyms</span>
                    <span class="level-badge" id="langLevelBadge">Level 1</span>
                </div>
                <div id="langQuestion" class="question">Find the synonym for "Happy"</div>
                <div class="options">
                    <button class="option-btn" onclick="checkLangAnswer('Joyful')">Joyful</button>
                    <button class="option-btn" onclick="checkLangAnswer('Sad')">Sad</button>
                    <button class="option-btn" onclick="checkLangAnswer('Angry')">Angry</button>
                    <button class="option-btn" onclick="checkLangAnswer('Tired')">Tired</button>
                </div>
            </div>
            
            <div class="game-controls">
                <button class="control-btn" onclick="nextLangQuestion()">Next Question</button>
                <button class="control-btn" onclick="showLangHint()">Hint</button>
                <button class="control-btn" onclick="resetLangGame()">Reset</button>
            </div>
            
            <div id="langFeedback" class="feedback"></div>
            
            <div class="progress-bar">
                <div class="progress-fill" id="langProgress"></div>
            </div>
        </div>
    `;

    // Initialize with default category and level
    selectLangCategory('synonyms');
    selectLangLevel(1);
}

// Puzzle Game
function initializePuzzleGame(container) {
    container.innerHTML = `
        <div class="puzzle-game">
            <div class="level-selector">
                <h3>Select Puzzle Type & Difficulty</h3>
                <div class="puzzle-type-buttons">
                    <button class="puzzle-type-btn active" data-type="sequence" onclick="selectPuzzleType('sequence')">Sequences</button>
                    <button class="puzzle-type-btn" data-type="logic" onclick="selectPuzzleType('logic')">Logic</button>
                    <button class="puzzle-type-btn" data-type="pattern" onclick="selectPuzzleType('pattern')">Patterns</button>
                    <button class="puzzle-type-btn" data-type="riddle" onclick="selectPuzzleType('riddle')">Riddles</button>
                </div>
                <div class="level-buttons">
                    <button class="level-btn active" data-level="1" onclick="selectPuzzleLevel(1)">Easy</button>
                    <button class="level-btn" data-level="2" onclick="selectPuzzleLevel(2)">Medium</button>
                    <button class="level-btn" data-level="3" onclick="selectPuzzleLevel(3)">Hard</button>
                </div>
            </div>
            
            <div class="game-stats">
                <div class="stat">
                    <span class="stat-label">Score:</span>
                    <span id="puzzleScore" class="stat-value">0</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Type:</span>
                    <span id="puzzleType" class="stat-value">Sequences</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Level:</span>
                    <span id="puzzleLevel" class="stat-value">1</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Solved:</span>
                    <span id="puzzlesSolved" class="stat-value">0</span>
                </div>
            </div>
            
            <div class="puzzle-container">
                <div class="puzzle-header">
                    <span class="puzzle-type-badge" id="puzzleTypeBadge">Sequences</span>
                    <span class="level-badge" id="puzzleLevelBadge">Level 1</span>
                </div>
                <div id="puzzleQuestion" class="question">Complete the sequence: 2, 4, 6, 8, ?</div>
                <div class="puzzle-input">
                    <input type="text" id="puzzleAnswer" placeholder="Enter your answer">
                    <button class="control-btn" onclick="checkPuzzleAnswer()">Submit</button>
                </div>
            </div>
            
            <div class="game-controls">
                <button class="control-btn" onclick="nextPuzzle()">Next Puzzle</button>
                <button class="control-btn" onclick="getPuzzleHint()">Get Hint</button>
                <button class="control-btn" onclick="resetPuzzleGame()">Reset</button>
            </div>
            
            <div id="puzzleFeedback" class="feedback"></div>
            
            <div class="progress-bar">
                <div class="progress-fill" id="puzzleProgress"></div>
            </div>
        </div>
    `;

    // Initialize with default type and level
    selectPuzzleType('sequence');
    selectPuzzleLevel(1);
}


// Battle Game
function initializeBattleGame(container) {
    // Redirect to the dedicated quiz battle page
    window.location.href = 'quiz_battle.html';
}

// Progress Game
function initializeProgressGame(container) {
    // Redirect to the dedicated progress dashboard page
    window.location.href = 'progress_dashboard.html';
}

// Game logic functions
function checkMathAnswer(answer) {
    const question = document.getElementById('mathQuestion');
    const feedback = document.getElementById('mathFeedback');
    const score = document.getElementById('mathScore');
    const streak = document.getElementById('mathStreak');

    // Extract numbers and operation from question
    const questionText = question.textContent;
    const numbers = questionText.match(/\d+/g);
    const operation = questionText.match(/[\+\-×]/);

    if (numbers && operation && numbers.length >= 2) {
        const num1 = parseInt(numbers[0]);
        const num2 = parseInt(numbers[1]);
        let correctAnswer = 0;

        switch (operation[0]) {
            case '+': correctAnswer = num1 + num2; break;
            case '-': correctAnswer = num1 - num2; break;
            case '×': correctAnswer = num1 * num2; break;
        }

        if (answer === correctAnswer) {
            feedback.textContent = '🎉 Correct! Excellent work!';
            feedback.className = 'feedback correct';

            // Calculate score based on level and streak
            const baseScore = currentMathLevel * 10;
            const streakBonus = Math.floor(mathStreak / 3) * 5;
            const totalScore = baseScore + streakBonus;

            score.textContent = parseInt(score.textContent) + totalScore;
            mathStreak++;
            streak.textContent = mathStreak;

            // Animate score increase
            animateScoreIncrease(score, totalScore);

            // Update progress bar
            updateMathProgress();

            // SYNC WITH PROGRESS TRACKER
            if (window.ACEProgress) {
                window.ACEProgress.updateMathProgress({
                    questionsAnswered: 1,
                    correctAnswers: 1,
                    score: totalScore,
                    streak: mathStreak,
                    difficulty: currentMathLevel === 1 ? 'easy' : (currentMathLevel === 2 ? 'medium' : 'hard')
                });
            }

            // Save to backend
            saveProgress('math', 'completion', totalScore);

            // Generate new question after delay
            setTimeout(generateNewMathQuestion, 1500);
        } else {
            feedback.textContent = `❌ Incorrect. The answer is ${correctAnswer}`;
            feedback.className = 'feedback incorrect';
            mathStreak = 0;
            streak.textContent = '0';
        }
    }
}

function updateMathProgress() {
    const progress = document.getElementById('mathProgress');
    if (progress) {
        const currentScore = parseInt(document.getElementById('mathScore').textContent);
        const progressPercent = Math.min((currentScore / 100) * 100, 100);
        progress.style.width = `${progressPercent}%`;
    }
}

function startMathGame() {
    const startBtn = document.getElementById('startMathBtn');
    const timeDisplay = document.getElementById('mathTime');

    startBtn.disabled = true;
    startBtn.textContent = 'Game Running...';

    let timeLeft = 30;
    const timer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            startBtn.disabled = false;
            startBtn.textContent = 'Start Game';
            timeDisplay.textContent = '30';
        }
    }, 1000);

    generateNewMathQuestion();
}

function generateNewMathQuestion() {
    const question = document.getElementById('mathQuestion');
    const operations = ['+', '-', '×'];
    const op = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2, answer;

    switch (op) {
        case '+':
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 20) + 10;
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            break;
        case '×':
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            answer = num1 * num2;
            break;
    }

    question.textContent = `What is ${num1} ${op} ${num2}?`;

    // Update options with new answers
    const options = document.querySelectorAll('.option-btn');
    const correctIndex = Math.floor(Math.random() * 4);

    options.forEach((option, index) => {
        if (index === correctIndex) {
            option.textContent = answer;
            option.onclick = () => checkMathAnswer(answer);
        } else {
            let wrongAnswer;
            do {
                wrongAnswer = answer + Math.floor(Math.random() * 10) - 5;
            } while (wrongAnswer === answer || wrongAnswer < 0);

            option.textContent = wrongAnswer;
            option.onclick = () => checkMathAnswer(wrongAnswer);
        }
    });
}

// Modal close handlers moved to initializeDOMElements()

// Window click handler for modal
window.onclick = function (event) {
    const modal = document.getElementById('gameModal');
    if (modal && event.target === modal) {
        modal.style.display = 'none';
    }
}

// Contact form handling with Formspree
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Check if we just came back from a successful submission
    if (window.location.hash === '#contact' && document.referrer.includes('formspree')) {
        if (window.ErrorHandler) {
            ErrorHandler.showSuccess('✓ Thank you! Your message has been sent successfully!');
        }
        // Clear the hash
        history.replaceState(null, null, ' ');
    }

    form.addEventListener('submit', function (e) {
        const submitBtn = form.querySelector('.submit-btn');

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Store submission time to show success message on return
        sessionStorage.setItem('formSubmitted', Date.now());

        // Let the form submit normally to Formspree
        // Formspree will handle the redirect and confirmation
    });

    // Check if we just submitted (within last 5 seconds)
    const submitted = sessionStorage.getItem('formSubmitted');
    if (submitted && (Date.now() - parseInt(submitted)) < 5000) {
        sessionStorage.removeItem('formSubmitted');
        if (window.ErrorHandler) {
            ErrorHandler.showSuccess('✓ Thank you! Your message has been sent successfully!');
        }
        // Reset the form
        form.reset();
    }
}

// Additional game functions
// Additional game functions
function checkLangAnswer(selectedAnswer, correctAnswer) {
    const feedback = document.getElementById('langFeedback');
    const score = document.getElementById('langScore');
    const combo = document.getElementById('langCombo');

    // Check if arguments are provided, otherwise fallback to parsing DOM or old logic?
    // The calling code passes (option, randomQuestion.answer)
    // But 'option' might be the string value based on line 1374: options[index].textContent = option;

    if (selectedAnswer === correctAnswer) {
        feedback.textContent = `🎉 Correct! "${selectedAnswer}" is the right answer!`;
        feedback.className = 'feedback correct';

        const points = 10 + (langCombo * 2);
        score.textContent = parseInt(score.textContent) + points;
        langCombo++;
        combo.textContent = langCombo;

        // Animate score increase
        animateScoreIncrease(score, points);

        // Update progress UI
        updateLangProgress();

        // SYNC WITH PROGRESS TRACKER
        if (window.ACEProgress) {
            window.ACEProgress.updateLanguageProgress({
                questionsAnswered: 1,
                correctAnswers: 1,
                score: points,
                streak: langCombo,
                wordsLearned: 1,
                category: currentLangCategory || 'vocabulary'
            });
        }

        // Save to backend
        saveProgress('language', 'completion', points);

        // Generate new question after delay
        setTimeout(generateNewLangQuestion, 1500);
    } else {
        feedback.textContent = `❌ Incorrect. The correct answer was "${correctAnswer}"`;
        feedback.className = 'feedback incorrect';
        langCombo = 0;
        combo.textContent = '0';
    }
}

function updateLangProgress() {
    const progress = document.getElementById('langProgress');
    if (progress) {
        const currentScore = parseInt(document.getElementById('langScore').textContent);
        const progressPercent = Math.min((currentScore / 100) * 100, 100);
        progress.style.width = `${progressPercent}%`;
    }
}

function nextLangQuestion() {
    const feedback = document.getElementById('langFeedback');
    feedback.textContent = '';
    feedback.className = 'feedback';

    // Generate new question (simplified)
    const questions = [
        'Find the antonym for "Big"',
        'Find the synonym for "Fast"',
        'Find the antonym for "Hot"'
    ];

    const currentQuestion = document.getElementById('langQuestion');
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    currentQuestion.textContent = randomQuestion;
}

function checkPuzzleAnswer() {
    const answer = document.getElementById('puzzleAnswer').value.trim().toLowerCase();
    const feedback = document.getElementById('puzzleFeedback');
    const score = document.getElementById('puzzleScore');
    const solved = document.getElementById('puzzlesSolved');

    // Check if we have a current puzzle
    if (window.currentPuzzle) {
        if (answer === window.currentPuzzle.answer.toLowerCase()) {
            feedback.textContent = '🎉 Correct! Excellent thinking!';
            feedback.className = 'feedback correct';

            // Calculate score based on level
            const baseScore = currentPuzzleLevel * 15;
            score.textContent = parseInt(score.textContent) + baseScore;
            puzzlesSolved++;
            solved.textContent = puzzlesSolved;

            // Animate score increase
            animateScoreIncrease(score, baseScore);

            // Update progress
            updatePuzzleProgress();

            // SYNC WITH PROGRESS TRACKER
            if (window.ACEProgress) {
                window.ACEProgress.updatePuzzleProgress({
                    puzzlesAttempted: 1,
                    puzzlesSolved: 1,
                    score: baseScore,
                    streak: 0,
                    type: currentPuzzleType || 'logic'
                });
            }

            // Save to backend
            saveProgress('puzzle', 'completion', baseScore);

            // Generate new puzzle after delay
            setTimeout(generateNewPuzzle, 1500);
        } else {
            feedback.textContent = `❌ Incorrect. Try again!`;
            feedback.className = 'feedback incorrect';
        }
    } else {
        // Fallback for old questions
        if (answer === '10') {
            feedback.textContent = '🎉 Correct! The pattern adds 2 each time';
            feedback.className = 'feedback correct';
            score.textContent = parseInt(score.textContent) + 15;
            puzzlesSolved++;
            solved.textContent = puzzlesSolved;

            // Animate score increase
            animateScoreIncrease(score, 15);

            // Update progress
            updatePuzzleProgress();

            // Generate new puzzle after delay
            setTimeout(generateNewPuzzle, 1500);
        } else {
            feedback.textContent = '❌ Incorrect. Look for the pattern in the sequence';
            feedback.className = 'feedback incorrect';
        }
    }
}

function updatePuzzleProgress() {
    const progress = document.getElementById('puzzleProgress');
    if (progress) {
        const currentScore = parseInt(document.getElementById('puzzleScore').textContent);
        const progressPercent = Math.min((currentScore / 100) * 100, 100);
        progress.style.width = `${progressPercent}%`;
    }
}


function findOpponent() {
    const lobbyStatus = document.querySelector('.lobby-status p');
    lobbyStatus.textContent = 'Searching for opponents...';

    setTimeout(() => {
        lobbyStatus.textContent = 'Opponent found! Starting battle...';
        setTimeout(() => {
            lobbyStatus.textContent = 'Battle in progress...';
        }, 2000);
    }, 3000);
}

// Utility functions
function learnMore(objectName) {
    alert(`Learning more about ${objectName}... This would open detailed information in a real AR app.`);
}

function changeLangCategory() {
    const category = document.getElementById('langCategory');
    const categories = ['Animals', 'Colors', 'Food', 'Emotions', 'Nature'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    category.textContent = randomCategory;
}

function nextPuzzle() {
    const puzzleNumber = document.getElementById('puzzleNumber');
    const currentPuzzle = parseInt(puzzleNumber.textContent.split('/')[0]);
    const totalPuzzles = 5;

    if (currentPuzzle < totalPuzzles) {
        puzzleNumber.textContent = `${currentPuzzle + 1}/${totalPuzzles}`;
        document.getElementById('puzzleQuestion').textContent = 'Complete the sequence: 1, 3, 6, 10, ?';
        document.getElementById('puzzleAnswer').value = '';
        document.getElementById('puzzleFeedback').textContent = '';
    }
}

function getPuzzleHint() {
    alert('Hint: Look at the difference between consecutive numbers. Each difference increases by 1!');
}


function createPrivateRoom() {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    alert(`Private room created! Room code: ${roomCode}\nShare this code with friends to join.`);
}

function joinRoom() {
    const roomCode = prompt('Enter room code:');
    if (roomCode) {
        alert(`Joining room: ${roomCode.toUpperCase()}`);
    }
}

// Add missing reset function for math game
function resetMathGame() {
    const score = document.getElementById('mathScore');
    const level = document.getElementById('mathLevel');
    const time = document.getElementById('mathTime');
    const feedback = document.getElementById('mathFeedback');
    const startBtn = document.getElementById('startMathBtn');

    if (score && level && time && feedback && startBtn) {
        score.textContent = '0';
        level.textContent = '1';
        time.textContent = '30';
        feedback.textContent = '';
        feedback.className = 'feedback';
        startBtn.disabled = false;
        startBtn.textContent = 'Start Game';

        // Reset question to default
        const question = document.getElementById('mathQuestion');
        if (question) {
            question.textContent = 'What is 5 + 3?';
        }
    }
}

// Math Game Level Management
let currentMathLevel = 1;
let mathStreak = 0;
let mathQuestionsAnswered = 0;

function selectMathLevel(level) {
    currentMathLevel = level;

    // Update active button
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-level="${level}"]`).classList.add('active');

    // Update level display
    document.getElementById('mathLevel').textContent = level;
    document.getElementById('levelBadge').textContent = `Level ${level}`;

    // Generate appropriate question for level
    generateNewMathQuestion();
}

function showMathHint() {
    const question = document.getElementById('mathQuestion').textContent;
    let hint = '';

    if (question.includes('+')) {
        hint = 'Think about counting forward!';
    } else if (question.includes('-')) {
        hint = 'Think about counting backward!';
    } else if (question.includes('×')) {
        hint = 'Think about repeated addition!';
    }

    if (hint) {
        const feedback = document.getElementById('mathFeedback');
        feedback.textContent = `💡 Hint: ${hint}`;
        feedback.className = 'feedback hint';
    }
}

// Language Game Level Management
let currentLangCategory = 'synonyms';
let currentLangLevel = 1;
let langCombo = 0;

function selectLangCategory(category) {
    currentLangCategory = category;

    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');

    // Update category display
    document.getElementById('langCategory').textContent = category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById('categoryBadge').textContent = category.charAt(0).toUpperCase() + category.slice(1);

    // Generate new question for category
    generateNewLangQuestion();
}

function selectLangLevel(level) {
    currentLangLevel = level;

    // Update active button
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-level="${level}"]`).classList.add('active');

    // Update level display
    document.getElementById('langLevel').textContent = level;
    document.getElementById('langLevelBadge').textContent = `Level ${level}`;

    // Generate new question for level
    generateNewLangQuestion();
}

function showLangHint() {
    const question = document.getElementById('langQuestion').textContent;
    let hint = '';

    if (currentLangCategory === 'synonyms') {
        hint = 'Look for words with similar meanings!';
    } else if (currentLangCategory === 'antonyms') {
        hint = 'Look for words with opposite meanings!';
    } else if (currentLangCategory === 'definitions') {
        hint = 'Think about what the word means!';
    }

    if (hint) {
        const feedback = document.getElementById('langFeedback');
        feedback.textContent = `💡 Hint: ${hint}`;
        feedback.className = 'feedback hint';
    }
}

function resetLangGame() {
    document.getElementById('langScore').textContent = '0';
    document.getElementById('langCombo').textContent = '0';
    langCombo = 0;
    document.getElementById('langFeedback').textContent = '';
    document.getElementById('langFeedback').className = 'feedback';
    generateNewLangQuestion();
}

// Puzzle Game Level Management
let currentPuzzleType = 'sequence';
let currentPuzzleLevel = 1;
let puzzlesSolved = 0;

function selectPuzzleType(type) {
    currentPuzzleType = type;

    // Update active button
    document.querySelectorAll('.puzzle-type-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    // Update type display
    document.getElementById('puzzleType').textContent = type.charAt(0).toUpperCase() + type.slice(1);
    document.getElementById('puzzleTypeBadge').textContent = type.charAt(0).toUpperCase() + type.slice(1);

    // Generate new puzzle for type
    generateNewPuzzle();
}

function selectPuzzleLevel(level) {
    currentPuzzleLevel = level;

    // Update active button
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-level="${level}"]`).classList.add('active');

    // Update level display
    document.getElementById('puzzleLevel').textContent = level;
    document.getElementById('puzzleLevelBadge').textContent = `Level ${level}`;

    // Generate new puzzle for level
    generateNewPuzzle();
}

function resetPuzzleGame() {
    document.getElementById('puzzleScore').textContent = '0';
    document.getElementById('puzzlesSolved').textContent = '0';
    puzzlesSolved = 0;
    document.getElementById('puzzleFeedback').textContent = '';
    document.getElementById('puzzleFeedback').className = 'feedback';
    generateNewPuzzle();
}

// Enhanced question generation functions
function generateNewLangQuestion() {
    const questions = {
        synonyms: {
            1: [
                { question: 'Find the synonym for "Happy"', answer: 'Joyful', options: ['Joyful', 'Sad', 'Angry', 'Tired'] },
                { question: 'Find the synonym for "Big"', answer: 'Large', options: ['Large', 'Small', 'Tiny', 'Little'] },
                { question: 'Find the synonym for "Fast"', answer: 'Quick', options: ['Quick', 'Slow', 'Lazy', 'Calm'] }
            ],
            2: [
                { question: 'Find the synonym for "Beautiful"', answer: 'Gorgeous', options: ['Gorgeous', 'Ugly', 'Plain', 'Simple'] },
                { question: 'Find the synonym for "Smart"', answer: 'Intelligent', options: ['Intelligent', 'Dumb', 'Foolish', 'Silly'] },
                { question: 'Find the synonym for "Brave"', answer: 'Courageous', options: ['Courageous', 'Scared', 'Afraid', 'Timid'] }
            ],
            3: [
                { question: 'Find the synonym for "Magnificent"', answer: 'Splendid', options: ['Splendid', 'Ordinary', 'Common', 'Regular'] },
                { question: 'Find the synonym for "Persistent"', answer: 'Determined', options: ['Determined', 'Lazy', 'Weak', 'Soft'] },
                { question: 'Find the synonym for "Eloquent"', answer: 'Articulate', options: ['Articulate', 'Quiet', 'Silent', 'Mute'] }
            ]
        },
        antonyms: {
            1: [
                { question: 'Find the antonym for "Hot"', answer: 'Cold', options: ['Cold', 'Warm', 'Boiling', 'Steaming'] },
                { question: 'Find the antonym for "Up"', answer: 'Down', options: ['Down', 'High', 'Above', 'Over'] },
                { question: 'Find the antonym for "Light"', answer: 'Dark', options: ['Dark', 'Bright', 'Clear', 'Visible'] }
            ],
            2: [
                { question: 'Find the antonym for "Generous"', answer: 'Selfish', options: ['Selfish', 'Kind', 'Nice', 'Friendly'] },
                { question: 'Find the antonym for "Honest"', answer: 'Dishonest', options: ['Dishonest', 'Truthful', 'Sincere', 'Genuine'] },
                { question: 'Find the antonym for "Patient"', answer: 'Impatient', options: ['Impatient', 'Calm', 'Quiet', 'Peaceful'] }
            ],
            3: [
                { question: 'Find the antonym for "Optimistic"', answer: 'Pessimistic', options: ['Pessimistic', 'Hopeful', 'Cheerful', 'Positive'] },
                { question: 'Find the antonym for "Diligent"', answer: 'Lazy', options: ['Lazy', 'Hardworking', 'Active', 'Energetic'] },
                { question: 'Find the antonym for "Authentic"', answer: 'Fake', options: ['Fake', 'Real', 'Genuine', 'Original'] }
            ]
        },
        definitions: {
            1: [
                { question: 'What does "Serene" mean?', answer: 'Peaceful', options: ['Peaceful', 'Loud', 'Angry', 'Happy'] },
                { question: 'What does "Vast" mean?', answer: 'Huge', options: ['Huge', 'Small', 'Medium', 'Tiny'] },
                { question: 'What does "Swift" mean?', answer: 'Fast', options: ['Fast', 'Slow', 'Steady', 'Careful'] }
            ],
            2: [
                { question: 'What does "Eloquent" mean?', answer: 'Well-spoken', options: ['Well-spoken', 'Quiet', 'Loud', 'Shy'] },
                { question: 'What does "Persistent" mean?', answer: 'Determined', options: ['Determined', 'Lazy', 'Weak', 'Soft'] },
                { question: 'What does "Authentic" mean?', answer: 'Genuine', options: ['Genuine', 'Fake', 'Copy', 'Imitation'] }
            ],
            3: [
                { question: 'What does "Magnificent" mean?', answer: 'Splendid', options: ['Splendid', 'Ordinary', 'Plain', 'Simple'] },
                { question: 'What does "Diligent" mean?', answer: 'Hardworking', options: ['Hardworking', 'Lazy', 'Slow', 'Careless'] },
                { question: 'What does "Eloquent" mean?', answer: 'Articulate', options: ['Articulate', 'Quiet', 'Mute', 'Silent'] }
            ]
        },
        'word-pairs': {
            1: [
                { question: 'Complete the pair: "Hot and..."', answer: 'Cold', options: ['Cold', 'Warm', 'Boiling', 'Steaming'] },
                { question: 'Complete the pair: "Up and..."', answer: 'Down', options: ['Down', 'High', 'Above', 'Over'] },
                { question: 'Complete the pair: "Light and..."', answer: 'Dark', options: ['Dark', 'Bright', 'Clear', 'Visible'] }
            ],
            2: [
                { question: 'Complete the pair: "Give and..."', answer: 'Take', options: ['Take', 'Receive', 'Accept', 'Get'] },
                { question: 'Complete the pair: "Left and..."', answer: 'Right', options: ['Right', 'Correct', 'Proper', 'Good'] },
                { question: 'Complete the pair: "Win and..."', answer: 'Lose', options: ['Lose', 'Fail', 'Miss', 'Drop'] }
            ],
            3: [
                { question: 'Complete the pair: "Cause and..."', answer: 'Effect', options: ['Effect', 'Result', 'Outcome', 'Consequence'] },
                { question: 'Complete the pair: "Question and..."', answer: 'Answer', options: ['Answer', 'Reply', 'Response', 'Solution'] },
                { question: 'Complete the pair: "Problem and..."', answer: 'Solution', options: ['Solution', 'Answer', 'Fix', 'Cure'] }
            ]
        }
    };

    const categoryQuestions = questions[currentLangCategory] || questions.synonyms;
    const levelQuestions = categoryQuestions[currentLangLevel] || categoryQuestions[1];
    const randomQuestion = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];

    document.getElementById('langQuestion').textContent = randomQuestion.question;

    // Update options
    const options = document.querySelectorAll('.option-btn');
    randomQuestion.options.forEach((option, index) => {
        options[index].textContent = option;
        options[index].onclick = () => checkLangAnswer(option, randomQuestion.answer);
    });
}

function generateNewPuzzle() {
    const puzzles = {
        sequence: {
            1: [
                { question: 'Complete the sequence: 2, 4, 6, 8, ?', answer: '10', hint: 'Add 2 each time' },
                { question: 'Complete the sequence: 1, 3, 5, 7, ?', answer: '9', hint: 'Add 2 each time' },
                { question: 'Complete the sequence: 5, 10, 15, 20, ?', answer: '25', hint: 'Add 5 each time' }
            ],
            2: [
                { question: 'Complete the sequence: 1, 2, 4, 7, ?', answer: '11', hint: 'Add 1, then 2, then 3, then 4' },
                { question: 'Complete the sequence: 2, 6, 12, 20, ?', answer: '30', hint: 'Add 4, then 6, then 8, then 10' },
                { question: 'Complete the sequence: 1, 4, 9, 16, ?', answer: '25', hint: 'Square numbers: 1², 2², 3², 4², 5²' }
            ],
            3: [
                { question: 'Complete the sequence: 1, 1, 2, 3, 5, ?', answer: '8', hint: 'Fibonacci sequence: each number is the sum of the two before it' },
                { question: 'Complete the sequence: 2, 6, 18, 54, ?', answer: '162', hint: 'Multiply by 3 each time' },
                { question: 'Complete the sequence: 1, 3, 6, 10, ?', answer: '15', hint: 'Add 2, then 3, then 4, then 5' }
            ]
        },
        logic: {
            1: [
                { question: 'If all roses are flowers and some flowers are red, then:', answer: 'Some roses might be red', hint: 'Think about logical relationships' },
                { question: 'A clock shows 3:15. What angle is between the hands?', answer: '7.5 degrees', hint: 'Hour hand moves 0.5° per minute' },
                { question: 'If 5 machines take 5 minutes to make 5 widgets, how long for 100 machines to make 100 widgets?', answer: '5 minutes', hint: 'Each machine makes 1 widget in 5 minutes' }
            ],
            2: [
                { question: 'A train leaves at 2:30 PM and arrives at 5:45 PM. How long was the journey?', answer: '3 hours 15 minutes', hint: 'Calculate the time difference' },
                { question: 'If you have 3 red balls and 4 blue balls, what\'s the probability of picking a red ball?', answer: '3/7', hint: 'Total balls = 7, red balls = 3' },
                { question: 'A rectangle has perimeter 20 and area 24. What are its dimensions?', answer: '6 and 4', hint: 'Use the formulas P=2(l+w) and A=l×w' }
            ],
            3: [
                { question: 'In a group of 100 people, 70 speak English, 45 speak French, and 25 speak both. How many speak neither?', answer: '10', hint: 'Use the principle of inclusion-exclusion' },
                { question: 'A cube is painted and cut into 27 smaller cubes. How many have exactly 2 painted faces?', answer: '12', hint: 'These are the edge cubes (not corners or centers)' },
                { question: 'If a clock loses 2 minutes every hour, how many hours until it shows the correct time again?', answer: '30 hours', hint: 'It needs to lose 12 hours (720 minutes)' }
            ]
        },
        pattern: {
            1: [
                { question: 'What comes next: Circle, Square, Triangle, Circle, Square, ?', answer: 'Triangle', hint: 'Look for the repeating pattern' },
                { question: 'What comes next: Red, Blue, Green, Red, Blue, ?', answer: 'Green', hint: 'Colors repeat in the same order' },
                { question: 'What comes next: Up, Down, Left, Right, Up, ?', answer: 'Down', hint: 'Directions cycle in a pattern' }
            ],
            2: [
                { question: 'What comes next: A, B, C, D, A, B, C, ?', answer: 'D', hint: 'Letters repeat in groups of 4' },
                { question: 'What comes next: 1, 2, 3, 1, 2, 3, 1, ?', answer: '2', hint: 'Numbers repeat in groups of 3' },
                { question: 'What comes next: Star, Moon, Sun, Star, Moon, ?', answer: 'Sun', hint: 'Celestial bodies repeat in order' }
            ],
            3: [
                { question: 'What comes next: North, East, South, West, North, East, ?', answer: 'South', hint: 'Compass directions in order' },
                { question: 'What comes next: Spring, Summer, Fall, Winter, Spring, ?', answer: 'Summer', hint: 'Seasons repeat in order' },
                { question: 'What comes next: Monday, Tuesday, Wednesday, Monday, Tuesday, ?', answer: 'Wednesday', hint: 'Weekdays repeat in order' }
            ]
        },
        riddle: {
            1: [
                { question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', answer: 'Echo', hint: 'Think about sound bouncing back' },
                { question: 'What has keys, but no locks; space, but no room; and you can enter, but not go in?', answer: 'Keyboard', hint: 'You use this to type' },
                { question: 'What gets wetter and wetter the more it dries?', answer: 'Towel', hint: 'You use this after bathing' }
            ],
            2: [
                { question: 'The more you take, the more you leave behind. What am I?', answer: 'Footsteps', hint: 'You make these when you walk' },
                { question: 'What has cities, but no houses; forests, but no trees; and rivers, but no water?', answer: 'Map', hint: 'This shows you where things are' },
                { question: 'What breaks when you say it?', answer: 'Silence', hint: 'Think about what happens when you speak' }
            ],
            3: [
                { question: 'What comes once in a minute, twice in a moment, but never in a thousand years?', answer: 'Letter M', hint: 'Look at the spelling of these words' },
                { question: 'What has legs, but cannot walk?', answer: 'Table', hint: 'This furniture has four legs' },
                { question: 'What can travel around the world while sitting in a corner?', answer: 'Stamp', hint: 'This goes on letters and envelopes' }
            ]
        }
    };

    const typePuzzles = puzzles[currentPuzzleType] || puzzles.sequence;
    const levelPuzzles = typePuzzles[currentPuzzleLevel] || typePuzzles[1];
    const randomPuzzle = levelPuzzles[Math.floor(Math.random() * levelPuzzles.length)];

    document.getElementById('puzzleQuestion').textContent = randomPuzzle.question;
    document.getElementById('puzzleAnswer').value = '';
    document.getElementById('puzzleFeedback').textContent = '';

    // Store current puzzle data
    window.currentPuzzle = randomPuzzle;
}

// Enhanced answer checking functions
function checkLangAnswer(selectedAnswer, correctAnswer) {
    const feedback = document.getElementById('langFeedback');
    const score = document.getElementById('langScore');
    const combo = document.getElementById('langCombo');

    if (selectedAnswer === correctAnswer) {
        feedback.textContent = '🎉 Correct! Well done!';
        feedback.className = 'feedback correct';

        // Calculate score based on level and combo
        const baseScore = currentLangLevel * 10;
        const comboBonus = Math.floor(langCombo / 3) * 5;
        const totalScore = baseScore + comboBonus;

        score.textContent = parseInt(score.textContent) + totalScore;
        langCombo++;
        combo.textContent = langCombo;

        // Animate score increase
        animateScoreIncrease(score, totalScore);

        // Generate new question after delay
        setTimeout(generateNewLangQuestion, 1500);
    } else {
        feedback.textContent = `❌ Incorrect. The answer is "${correctAnswer}"`;
        feedback.className = 'feedback incorrect';
        langCombo = 0;
        combo.textContent = '0';
    }
}

function checkPuzzleAnswer() {
    const answer = document.getElementById('puzzleAnswer').value.trim().toLowerCase();
    const feedback = document.getElementById('puzzleFeedback');
    const score = document.getElementById('puzzleScore');
    const solved = document.getElementById('puzzlesSolved');

    if (answer === window.currentPuzzle.answer.toLowerCase()) {
        feedback.textContent = '🎉 Correct! Excellent thinking!';
        feedback.className = 'feedback correct';

        // Calculate score based on level
        const baseScore = currentPuzzleLevel * 15;
        score.textContent = parseInt(score.textContent) + baseScore;
        puzzlesSolved++;
        solved.textContent = puzzlesSolved;

        // Animate score increase
        animateScoreIncrease(score, baseScore);

        // Generate new puzzle after delay
        setTimeout(generateNewPuzzle, 1500);
    } else {
        feedback.textContent = `❌ Incorrect. Try again!`;
        feedback.className = 'feedback incorrect';
    }
}

// Animation functions
function animateScoreIncrease(element, points) {
    element.style.transform = 'scale(1.2)';
    element.style.color = '#28a745';

    // Create floating points animation
    const pointsElement = document.createElement('div');
    pointsElement.textContent = `+${points}`;
    pointsElement.className = 'floating-points';
    element.parentNode.appendChild(pointsElement);

    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.color = '#667eea';
        pointsElement.remove();
    }, 1000);
}

// Enhanced math question generation
function generateNewMathQuestion() {
    const operations = ['+', '-', '×'];
    const op = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2, answer;

    switch (op) {
        case '+':
            if (currentMathLevel === 1) {
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
            } else if (currentMathLevel === 2) {
                num1 = Math.floor(Math.random() * 50) + 10;
                num2 = Math.floor(Math.random() * 50) + 10;
            } else if (currentMathLevel === 3) {
                num1 = Math.floor(Math.random() * 100) + 50;
                num2 = Math.floor(Math.random() * 100) + 50;
            } else {
                num1 = Math.floor(Math.random() * 200) + 100;
                num2 = Math.floor(Math.random() * 200) + 100;
            }
            answer = num1 + num2;
            break;
        case '-':
            if (currentMathLevel === 1) {
                num1 = Math.floor(Math.random() * 20) + 10;
                num2 = Math.floor(Math.random() * num1) + 1;
            } else if (currentMathLevel === 2) {
                num1 = Math.floor(Math.random() * 100) + 50;
                num2 = Math.floor(Math.random() * num1) + 10;
            } else if (currentMathLevel === 3) {
                num1 = Math.floor(Math.random() * 500) + 200;
                num2 = Math.floor(Math.random() * num1) + 50;
            } else {
                num1 = Math.floor(Math.random() * 1000) + 500;
                num2 = Math.floor(Math.random() * num1) + 100;
            }
            answer = num1 - num2;
            break;
        case '×':
            if (currentMathLevel === 1) {
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
            } else if (currentMathLevel === 2) {
                num1 = Math.floor(Math.random() * 25) + 10;
                num2 = Math.floor(Math.random() * 25) + 10;
            } else if (currentMathLevel === 3) {
                num1 = Math.floor(Math.random() * 50) + 25;
                num2 = Math.floor(Math.random() * 50) + 25;
            } else {
                num1 = Math.floor(Math.random() * 100) + 50;
                num2 = Math.floor(Math.random() * 100) + 50;
            }
            answer = num1 * num2;
            break;
    }

    document.getElementById('mathQuestion').textContent = `What is ${num1} ${op} ${num2}?`;

    // Update options with new answers
    const options = document.querySelectorAll('.option-btn');
    const correctIndex = Math.floor(Math.random() * 4);

    options.forEach((option, index) => {
        if (index === correctIndex) {
            option.textContent = answer;
            option.onclick = () => checkMathAnswer(answer);
        } else {
            let wrongAnswer;
            do {
                wrongAnswer = answer + Math.floor(Math.random() * 20) - 10;
            } while (wrongAnswer === answer || wrongAnswer < 0 || wrongAnswer > 1000);

            option.textContent = wrongAnswer;
            option.onclick = () => checkMathAnswer(wrongAnswer);
        }
    });
}

// ==================== AUTH UI FUNCTIONS ====================

// Open authentication modal
function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    showLogin();
}

// Close authentication modal
function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    clearAuthForms();
}

// Show login form
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

// Show registration form
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// Clear auth forms
function clearAuthForms() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('⚠️ Please enter both email and password');
        ErrorHandler.showError('⚠️ Please enter both email and password');
        return;
    }

    // Show loading
    try {
        if (LoadingManager && LoadingManager.show) {
            LoadingManager.show('Logging in...');
        }
    } catch (e) { }

    // Use Flask Backend (SQLite)
    const result = await ACEBackend.loginUser(email, password);

    // Hide loading
    try {
        if (LoadingManager && LoadingManager.hide) LoadingManager.hide();
    } catch (e) { }

    if (result) {
        // Login successful
        localStorage.setItem('ace_user_email', result.email);
        localStorage.setItem('ace_user_name', result.name);
        setCurrentUserId(result.user_id);

        closeAuthModal();
        updateAuthUI();
        ErrorHandler.showSuccess('✅ Login successful!');

        // Sync API progress if needed or reload
        setTimeout(() => location.reload(), 500);
    } else {
        alert('❌ Login failed. Please check your credentials.');
        ErrorHandler.showError('❌ Login failed. Please check your credentials.');
    }
}

// Handle registration
async function handleRegister() {
    console.log('🎯 Register button clicked!');

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!email || !password) {
        alert('⚠️ Please enter email and password');
        ErrorHandler.showError('⚠️ Please enter email and password');
        return;
    }

    if (password.length < 6) {
        alert('⚠️ Password must be at least 6 characters');
        ErrorHandler.showError('⚠️ Password must be at least 6 characters');
        return;
    }

    // Show loading
    try {
        if (LoadingManager && LoadingManager.show) {
            LoadingManager.show('Creating account...');
        }
    } catch (e) { }

    // Use Flask Backend (SQLite)
    const result = await ACEBackend.registerUser(email, password, name);

    // Hide loading
    try {
        if (LoadingManager && LoadingManager.hide) LoadingManager.hide();
    } catch (e) { }

    if (result) {
        // Registration successful
        alert('✅ Account created successfully! Logging you in...');
        ErrorHandler.showSuccess('✅ Account created successfully!');

        // Auto login
        localStorage.setItem('ace_user_email', result.email);
        localStorage.setItem('ace_user_name', result.name);
        setCurrentUserId(result.user_id);

        closeAuthModal();
        updateAuthUI();
        setTimeout(() => location.reload(), 500);
    } else {
        alert('❌ Registration failed. Email might already be taken.');
        ErrorHandler.showError('❌ Registration failed.');
    }
}

// Handle logout
function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) return;

    (async () => {
        try {
            const client = getSupabaseClient();
            if (client) {
                await client.auth.signOut();
            }
        } catch (e) {
            console.warn('Supabase signOut failed:', e);
        }

        clearCurrentUserId();
        localStorage.removeItem('ace_user_email');
        ErrorHandler.showSuccess('✅ Logged out successfully');
        updateAuthUI();
        setTimeout(() => location.reload(), 500);
    })();
}

// Update auth UI based on login status
function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');

    const applyState = (email) => {
        if (email) {
            authBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            userDisplay.style.display = 'inline-block';
            userDisplay.innerHTML = `<i class="fas fa-user-circle"></i> ${email}`;
            userDisplay.style.color = '#667eea';
            userDisplay.style.fontWeight = '600';
        } else {
            authBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            userDisplay.style.display = 'none';
        }
    };

    // Prefer Supabase session
    (async () => {
        try {
            const client = getSupabaseClient();
            if (client) {
                const { data } = await client.auth.getSession();
                const email = data?.session?.user?.email || null;
                if (email) {
                    localStorage.setItem('ace_user_email', email);
                    applyState(email);
                    return;
                }
            }
        } catch (e) {
            console.warn('Could not read Supabase session:', e);
        }

        // Fallback to legacy storage
        const legacyEmail = localStorage.getItem('ace_user_email');
        const legacyUserId = getCurrentUserId();
        applyState(legacyUserId && legacyEmail ? legacyEmail : null);
    })();
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM loaded, initializing...');

    // Initialize DOM elements
    initializeDOMElements();

    // Initialize backend connection
    initializeBackend();

    // Initialize contact form
    initializeContactForm();

    // Update auth UI
    updateAuthUI();

    // Auth modal click outside to close
    window.addEventListener('click', function (event) {
        const authModal = document.getElementById('authModal');
        if (event.target === authModal) {
            closeAuthModal();
        }
    });

    console.log('✅ All systems initialized!');
}); 