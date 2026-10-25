import axiosInstance from './axiosInstance';

/**
 * GET /api/kana
 * @param {string|number} lessonId - Optional lesson identifier
 */
export const getKana = async (lessonId, page, limit) => {
  const response = await axiosInstance.get('/kana', {
    params: { lessonId, page, limit }
  });
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
};

/**
 * GET /api/lessons
 * @param {object} params - { level, type }
 */
export const getLessons = async (params = {}) => {
  const response = await axiosInstance.get('/lessons', { params });
  return response.data;
};

/**
 * GET /api/kanji
 * @param {string|number} lessonId - Optional lesson identifier
 */
export const getKanji = async (lessonId, page, limit) => {
  const response = await axiosInstance.get('/kanji', {
    params: { lessonId, page, limit }
  });
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
};

/**
 * GET /api/vocab
 * @param {string|number} lessonId - Optional lesson identifier
 */
export const getVocab = async (lessonId, page, limit) => {
  const response = await axiosInstance.get('/vocab', {
    params: { lessonId, page, limit }
  });
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
};

/**
 * GET /api/questions/:quizId
 * Fetch randomized questions for a quiz
 */
export const getQuestions = async (quizId) => {
  const response = await axiosInstance.get(`/questions/${quizId}`);
  return response.data;
};

/**
 * GET /api/questions?lessonId=X
 * List available quizzes for a specific lesson
 */
export const getQuizzesByLesson = async (lessonId) => {
  const response = await axiosInstance.get('/questions', {
    params: { lessonId }
  });
  return response.data;
};

/**
 * POST /api/sessions/create
 */
export const createTrainingSession = async (userId, lessonId) => {
  const response = await axiosInstance.post('/sessions/create', {
    userId,
    lessonId
  });
  return response.data;
};

// --- Simple in-memory cache for SPA performance ---
const apiCache = {
  history: {},
  achievements: null,
  userAchievements: {},
  progress: {}
};

const clearProgressCache = (userId) => {
  if (userId) {
    apiCache.history[userId] = null;
    apiCache.userAchievements[userId] = null;
    apiCache.progress[userId] = null;
  } else {
    apiCache.history = {};
    apiCache.userAchievements = {};
    apiCache.progress = {};
  }
};
// ------------------------------------------------

/**
 * POST /api/sessions/save-statistic
 */
export const saveTrainingStats = async (statsData) => {
  const response = await axiosInstance.post('/sessions/save-statistic', statsData);
  // Clear cache for all users just to be safe, or we can just clear globally
  clearProgressCache(); 
  return response.data;
};

/**
 * GET /api/progress/user/:userId
 */
export const getUserProgress = async (userId) => {
  if (apiCache.progress[userId]) return apiCache.progress[userId];
  const response = await axiosInstance.get(`/progress/user/${userId}`);
  apiCache.progress[userId] = response.data;
  return response.data;
};

/**
 * GET /api/progress/history/:userId
 */
export const getUserHistory = async (userId) => {
  if (apiCache.history[userId]) return apiCache.history[userId];
  const response = await axiosInstance.get(`/progress/history/${userId}`);
  apiCache.history[userId] = response.data;
  return response.data;
};

/**
 * GET /api/progress/login-history/:userId
 */
export const getUserLoginHistory = async (userId) => {
  const response = await axiosInstance.get(`/progress/login-history/${userId}`);
  return response.data;
};

/**
 * GET /api/progress/achievements
 */
export const getAllAchievements = async () => {
  if (apiCache.achievements) return apiCache.achievements;
  const response = await axiosInstance.get('/progress/achievements');
  apiCache.achievements = response.data;
  return response.data;
};

/**
 * GET /api/progress/achievements/user/:userId
 */
export const getUserAchievements = async (userId) => {
  if (apiCache.userAchievements[userId]) return apiCache.userAchievements[userId];
  const response = await axiosInstance.get(`/progress/achievements/user/${userId}`);
  apiCache.userAchievements[userId] = response.data;
  return response.data;
};

/**
 * POST /api/progress/achievements/unlock
 */
export const unlockAchievement = async (userId, achievementId) => {
  const response = await axiosInstance.post('/progress/achievements/unlock', { userId, achievementId });
  // Invalidate cache for this user
  clearProgressCache(userId);
  return response.data;
};
