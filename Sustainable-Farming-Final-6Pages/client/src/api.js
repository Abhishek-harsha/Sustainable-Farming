import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// Farmer
export const getProfile = () => API.get('/farmer/profile');
export const updateProfile = (data) => API.put('/farmer/profile', data);
export const getAllFarmers = () => API.get('/farmer/all/list');
export const deleteFarmer = (id) => API.delete(`/farmer/${id}`);

// Activities
export const submitActivity = (data) => API.post('/activities', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
});
export const getMyActivities = () => API.get('/activities');
export const getAllActivities = () => API.get('/activities/all');
export const approveActivity = (id) => API.put(`/activities/${id}/approve`);

// Gamification
export const getGamificationStats = () => API.get('/gamification/stats');
export const recalculateStats = () => API.post('/gamification/recalculate');

// Challenges
export const getChallenges = () => API.get('/challenges');
export const createChallenge = (data) => API.post('/challenges', data);
export const joinChallenge = (id) => API.post(`/challenges/${id}/join`);
export const completeChallenge = (id) => API.post(`/challenges/${id}/complete`);
export const deleteChallenge = (id) => API.delete(`/challenges/${id}`);

// Leaderboard
export const getLeaderboard = () => API.get('/leaderboard');
export const getMyRank = () => API.get('/leaderboard/my-rank');

// AI
export const getAIRecommendation = (data) => API.post('/ai/recommend-crop', data);
export const getSustainabilityScore = (data) => API.post('/ai/sustainability-score', data);
export const generateDetailedReport = (data) => API.post('/ai/generate-report', data);

// Weather
export const getWeather = (location) => API.get(`/weather/${encodeURIComponent(location)}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markAllNotificationsRead = () => API.put('/notifications/read-all');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);

// Assessment
export const submitAssessment = (data) => API.post('/assessment', data);
export const getAssessmentHistory = () => API.get('/assessment/history');
export const getLatestAssessment = () => API.get('/assessment/latest');

export default API;
