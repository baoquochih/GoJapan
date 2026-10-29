import axiosInstance from './axiosInstance';

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 * Response: { message, userId }
 */
export const registerUser = async ({ username, email, password }) => {
  const response = await axiosInstance.post('/auth/register', {
    username,
    email,
    password,
  });
  return response.data;
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { message, user, accessToken, refreshToken }
 */
export const loginUser = async ({ email, password }) => {
  const response = await axiosInstance.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * POST /api/auth/refresh
 * Body: { token } (the refresh token)
 * Response: { accessToken }
 */
export const refreshAccessToken = async (refreshToken) => {
  const response = await axiosInstance.post('/auth/refresh', {
    token: refreshToken,
  });
  return response.data;
};

/**
 * POST /api/auth/logout
 * Body: { token } (the refresh token)
 * Response: { message }
 */
export const logoutUser = async (refreshToken) => {
  const response = await axiosInstance.post('/auth/logout', {
    token: refreshToken,
  });
  return response.data;
};

/**
 * GET /api/auth/profile
 * Headers: Authorization: Bearer <accessToken>
 * Response: { UserID, Username, Email, CurrentStreak, LongestStreak, LastActivityDate, CreatedAt }
 */
export const getUserProfile = async () => {
  const response = await axiosInstance.get('/auth/profile');
  return response.data;
};


