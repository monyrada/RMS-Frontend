import apiClient from "../apiClient.js";

export const changePassword = async (userId, { oldPassword, newPassword }) => {
    const response = await apiClient.put(`/users/${userId}/change-password`, {
        oldPassword,
        newPassword,
    });
    return response.data;
};


export const getCurrentUser = async () => {
    const response = await apiClient.get(`/users/me`);
    return response.data;
};

export const changeMyPassword = async ({ oldPassword, newPassword }) => {
    const response = await apiClient.put(`/users/me/change-password`, {
        oldPassword,
        newPassword,
    });
    return response.data;
};