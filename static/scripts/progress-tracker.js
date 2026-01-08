/**
 * ACE Learning Platform - Progress Tracking System
 * Tracks user performance across all modules and saves to localStorage
 */

// Initialize progress data structure
const initializeProgress = () => {
    const defaultProgress = {
        user: {
            name: "Student",
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            totalScore: 0,
            level: 1
        },
        modules: {
            math: {
                questionsAttempted: 0,
                questionsCorrect: 0,
                totalScore: 0,
                highScore: 0,
                timeSpent: 0,
                lastPlayed: null,
                streak: 0,
                difficulty: { easy: 0, medium: 0, hard: 0 }
            },
            language: {
                questionsAttempted: 0,
                questionsCorrect: 0,
                totalScore: 0,
                highScore: 0,
                timeSpent: 0,
                lastPlayed: null,
                streak: 0,
                wordsLearned: 0,
                categories: { synonyms: 0, grammar: 0, comprehension: 0, spelling: 0 }
            },
            puzzle: {
                puzzlesAttempted: 0,
                puzzlesSolved: 0,
                totalScore: 0,
                highScore: 0,
                timeSpent: 0,
                lastPlayed: null,
                streak: 0,
                types: { sequences: 0, logic: 0, patterns: 0, riddles: 0 }
            },
            quiz: {
                battlesPlayed: 0,
                battlesWon: 0,
                totalScore: 0,
                highScore: 0,
                timeSpent: 0,
                lastPlayed: null,
                questionsCorrect: 0,
                questionsTotal: 0
            },
            programming: {
                topicsCompleted: 0,
                quizzesCompleted: 0,
                quizzesCorrect: 0,
                totalScore: 0,
                timeSpent: 0,
                lastPlayed: null,
                topics: {}
            }
        },
        achievements: {
            mathMaster: { earned: false, progress: 0, target: 100 },
            wordWizard: { earned: false, progress: 0, target: 200 },
            puzzlePro: { earned: false, progress: 0, target: 50 },
            battleChampion: { earned: false, progress: 0, target: 20 },
            streakMaster: { earned: false, progress: 0, target: 7 },
            perfectionist: { earned: false, progress: 0, target: 1 },
            speedDemon: { earned: false, progress: 0, target: 10 },
            codeNinja: { earned: false, progress: 0, target: 9 }
        },
        dailyStats: [],
        weeklyStats: []
    };

    return defaultProgress;
};

// Helper to get storage key based on logged-in user
const getStorageKey = () => {
    try {
        if (window.ACEBackend && typeof window.ACEBackend.getCurrentUserId === 'function') {
            const userId = window.ACEBackend.getCurrentUserId();
            if (userId) {
                return `aceProgress_${userId}`;
            }
        }
    } catch (e) {
        console.warn('Could not determine user ID for storage key:', e);
    }
    return 'aceProgress'; // Fallback for guest/legacy
};

// Get current progress from localStorage with error handling
const getProgress = () => {
    try {
        const key = getStorageKey();
        const stored = localStorage.getItem(key);

        // If logged in but no specific data, check legacy 'aceProgress' and migrate ONCE?
        // For simplicity, we just start fresh or use what's there.
        // If we wanted to migrate guest progress to user progress, we could do it here.
        // But let's keep it simple: fresh user = fresh local progress (synced from DB later if needed).

        if (stored) {
            const progress = JSON.parse(stored);
            // Validate structure
            if (progress && progress.user && progress.modules) {
                return progress;
            }
        }
    } catch (error) {
        console.error('Error loading progress:', error);
        if (window.ErrorHandler) {
            ErrorHandler.showWarning('Could not load saved progress. Starting fresh.');
        }
    }
    return initializeProgress();
};

// Save progress to localStorage with quota checking
const saveProgress = (progress) => {
    try {
        // Update last active
        progress.user.lastActive = new Date().toISOString();

        // Check storage size
        const dataStr = JSON.stringify(progress);
        const dataSize = dataStr.length;
        const maxSize = 5 * 1024 * 1024; // 5MB

        // Warn if approaching limit
        if (dataSize > maxSize * 0.8) {
            console.warn('⚠️ Storage usage high:', (dataSize / (1024 * 1024)).toFixed(2), 'MB');

            // Cleanup old daily stats
            if (progress.dailyStats && progress.dailyStats.length > 30) {
                progress.dailyStats = progress.dailyStats.slice(-30);
                console.log('🧹 Cleaned up old daily stats');
            }
        }

        const key = getStorageKey();
        localStorage.setItem(key, dataStr);
        return true;
    } catch (error) {
        console.error('Error saving progress:', error);

        if (error.name === 'QuotaExceededError') {
            if (window.ErrorHandler) {
                ErrorHandler.showError('Storage full! Please reset progress or clear old data.');
            }
            // Try to cleanup and save again
            try {
                progress.dailyStats = [];
                progress.weeklyStats = [];
                const key = getStorageKey();
                localStorage.setItem(key, JSON.stringify(progress));
                if (window.ErrorHandler) {
                    ErrorHandler.showInfo('Cleaned up old data and saved progress.');
                }
                return true;
            } catch (retryError) {
                return false;
            }
        }
        return false;
    }
};

// Update math module progress
const updateMathProgress = (data) => {
    const progress = getProgress();
    const math = progress.modules.math;

    math.questionsAttempted += data.questionsAnswered || 0;
    math.questionsCorrect += data.correctAnswers || 0;
    math.totalScore += data.score || 0;
    math.highScore = Math.max(math.highScore, data.score || 0);
    math.timeSpent += data.timeSpent || 0;
    math.lastPlayed = new Date().toISOString();
    math.streak = data.streak || 0;

    if (data.difficulty) {
        math.difficulty[data.difficulty]++;
    }

    progress.user.totalScore += data.score || 0;

    // Update achievements
    progress.achievements.mathMaster.progress = math.questionsCorrect;
    if (math.questionsCorrect >= 100 && (math.questionsCorrect / math.questionsAttempted) >= 0.9) {
        progress.achievements.mathMaster.earned = true;
    }

    // SYNC WITH BACKEND
    if (window.ACEBackend && window.ACEBackend.saveProgress) {
        window.ACEBackend.saveProgress('math', 'question_answered', data.score || 0, null);
    }

    saveProgress(progress);
    return progress;
};

// Update language module progress
const updateLanguageProgress = (data) => {
    const progress = getProgress();
    const language = progress.modules.language;

    language.questionsAttempted += data.questionsAnswered || 0;
    language.questionsCorrect += data.correctAnswers || 0;
    language.totalScore += data.score || 0;
    language.highScore = Math.max(language.highScore, data.score || 0);
    language.timeSpent += data.timeSpent || 0;
    language.lastPlayed = new Date().toISOString();
    language.streak = data.streak || 0;
    language.wordsLearned += data.wordsLearned || 0;

    if (data.category) {
        language.categories[data.category]++;
    }

    progress.user.totalScore += data.score || 0;

    // Update achievements
    progress.achievements.wordWizard.progress = language.wordsLearned;
    if (language.wordsLearned >= 200) {
        progress.achievements.wordWizard.earned = true;
    }

    // SYNC WITH BACKEND
    if (window.ACEBackend && window.ACEBackend.saveProgress) {
        window.ACEBackend.saveProgress('language', 'question_answered', data.score || 0, null);
    }

    saveProgress(progress);
    return progress;
};

// Update puzzle module progress
const updatePuzzleProgress = (data) => {
    const progress = getProgress();
    const puzzle = progress.modules.puzzle;

    puzzle.puzzlesAttempted += data.puzzlesAnswered || 0;
    puzzle.puzzlesSolved += data.correctAnswers || 0;
    puzzle.totalScore += data.score || 0;
    puzzle.highScore = Math.max(puzzle.highScore, data.score || 0);
    puzzle.timeSpent += data.timeSpent || 0;
    puzzle.lastPlayed = new Date().toISOString();
    puzzle.streak = data.streak || 0;

    if (data.type) {
        puzzle.types[data.type]++;
    }

    progress.user.totalScore += data.score || 0;

    // Update achievements
    progress.achievements.puzzlePro.progress = puzzle.puzzlesSolved;
    if (puzzle.puzzlesSolved >= 50) {
        progress.achievements.puzzlePro.earned = true;
    }

    // SYNC WITH BACKEND
    if (window.ACEBackend && window.ACEBackend.saveProgress) {
        window.ACEBackend.saveProgress('puzzle', 'puzzle_solved', data.score || 0, null);
    }

    saveProgress(progress);
    return progress;
};

// Update quiz battle progress
const updateQuizProgress = (data) => {
    const progress = getProgress();
    const quiz = progress.modules.quiz;

    quiz.battlesPlayed += 1;
    if (data.won) quiz.battlesWon += 1;
    quiz.totalScore += data.score || 0;
    quiz.highScore = Math.max(quiz.highScore, data.score || 0);
    quiz.timeSpent += data.timeSpent || 0;
    quiz.lastPlayed = new Date().toISOString();
    quiz.questionsCorrect += data.correctAnswers || 0;
    quiz.questionsTotal += data.totalQuestions || 0;

    progress.user.totalScore += data.score || 0;

    // Update achievements
    progress.achievements.battleChampion.progress = quiz.battlesWon;
    if (quiz.battlesWon >= 20) {
        progress.achievements.battleChampion.earned = true;
    }

    // SYNC WITH BACKEND
    if (window.ACEBackend && window.ACEBackend.saveProgress) {
        window.ACEBackend.saveProgress('quiz', 'battle_finished', data.score || 0, null);
    }

    saveProgress(progress);
    return progress;
};

// Update programming module progress
const updateProgrammingProgress = (data) => {
    const progress = getProgress();
    const programming = progress.modules.programming;

    if (data.topicCompleted) {
        if (!programming.topics[data.topicCompleted]) {
            programming.topics[data.topicCompleted] = { completed: true, quizScore: 0 };
            programming.topicsCompleted++;
        }
    }

    if (data.quizCompleted) {
        programming.quizzesCompleted++;
        if (data.quizCorrect) programming.quizzesCorrect++;
    }

    programming.totalScore += data.score || 0;
    programming.timeSpent += data.timeSpent || 0;
    programming.lastPlayed = new Date().toISOString();

    progress.user.totalScore += data.score || 0;

    // Update achievements
    progress.achievements.codeNinja.progress = programming.topicsCompleted;
    if (programming.topicsCompleted >= 9) {
        progress.achievements.codeNinja.earned = true;
    }

    // SYNC WITH BACKEND
    if (window.ACEBackend && window.ACEBackend.saveProgress) {
        window.ACEBackend.saveProgress('programming', 'topic_completed', data.score || 0, null);
    }

    saveProgress(progress);
    return progress;
};

// Update daily streak
const updateStreak = () => {
    const progress = getProgress();
    const today = new Date().toDateString();
    const lastActive = new Date(progress.user.lastActive).toDateString();

    if (today !== lastActive) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActive === yesterday.toDateString()) {
            // Increment streak
            progress.achievements.streakMaster.progress++;
        } else {
            // Reset streak
            progress.achievements.streakMaster.progress = 1;
        }

        if (progress.achievements.streakMaster.progress >= 7) {
            progress.achievements.streakMaster.earned = true;
        }
    }

    saveProgress(progress);
    return progress;
};

// Check for perfectionist achievement
const checkPerfectionist = (correctAnswers, totalQuestions) => {
    if (totalQuestions > 0 && correctAnswers === totalQuestions && totalQuestions >= 10) {
        const progress = getProgress();
        progress.achievements.perfectionist.earned = true;
        progress.achievements.perfectionist.progress = 1;
        saveProgress(progress);
        return true;
    }
    return false;
};

// Calculate overall accuracy
const calculateOverallAccuracy = () => {
    const progress = getProgress();
    let totalCorrect = 0;
    let totalAttempted = 0;

    totalCorrect += progress.modules.math.questionsCorrect;
    totalAttempted += progress.modules.math.questionsAttempted;

    totalCorrect += progress.modules.language.questionsCorrect;
    totalAttempted += progress.modules.language.questionsAttempted;

    totalCorrect += progress.modules.puzzle.puzzlesSolved;
    totalAttempted += progress.modules.puzzle.puzzlesAttempted;

    if (totalAttempted === 0) return 0;
    return Math.round((totalCorrect / totalAttempted) * 100);
};

// Get module-specific stats
const getModuleStats = (moduleName) => {
    const progress = getProgress();
    return progress.modules[moduleName] || {};
};

// Get all achievements
const getAchievements = () => {
    const progress = getProgress();
    return progress.achievements;
};

// Reset progress (for testing or user request)
const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
        const key = getStorageKey();
        localStorage.removeItem(key);
        // Also remove legacy just in case
        localStorage.removeItem('aceProgress');

        // Also optional: Clear backend progress?
        // Usually "Reset Progress" button in UI implies local reset or full reset.
        // For now, we only originally had local storage. 
        // If we want to reset DB progress, we need an endpoint.
        // But user requirements didn't ask for "Reset Progress" functionality to be synced.

        location.reload();
    }
};

// Export level based on total score
const calculateLevel = () => {
    const progress = getProgress();
    const totalScore = progress.user.totalScore;
    const level = Math.floor(totalScore / 1000) + 1;
    progress.user.level = level;
    saveProgress(progress);
    return level;
};

// Get summary for dashboard
const getDashboardSummary = () => {
    const progress = getProgress();
    const accuracy = calculateOverallAccuracy();
    const level = calculateLevel();

    return {
        user: progress.user,
        totalScore: progress.user.totalScore,
        level: level,
        accuracy: accuracy,
        modules: progress.modules,
        achievements: progress.achievements,
        earnedAchievements: Object.values(progress.achievements).filter(a => a.earned).length,
        totalAchievements: Object.keys(progress.achievements).length
    };
};

// Make functions available globally
if (typeof window !== 'undefined') {
    window.ACEProgress = {
        getProgress,
        saveProgress,
        updateMathProgress,
        updateLanguageProgress,
        updatePuzzleProgress,
        updateQuizProgress,
        updateProgrammingProgress,
        updateStreak,
        checkPerfectionist,
        calculateOverallAccuracy,
        getModuleStats,
        getAchievements,
        resetProgress,
        calculateLevel,
        getDashboardSummary
    };
}
