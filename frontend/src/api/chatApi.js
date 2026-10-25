import axiosInstance from './axiosInstance';

export const getChatHistory = async () => {
  const { data } = await axiosInstance.get('/chat/history');
  return data;
};

export const sendChatMessage = async (message) => {
  const { data } = await axiosInstance.post('/chat', { message });
  return data;
};
