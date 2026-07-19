import axios from 'axios';

const API_URL = '/api/wellness';

const getAuthHeader = () => {
};

const getDashboardData = async () => {
    const response = await axiosInstance.get(`${API_URL}/dashboard`, getAuthHeader());
    return response.data;
};

const getPrograms = async () => {
    const response = await axiosInstance.get(`${API_URL}/programs`, getAuthHeader());
    return response.data;
};

const addProgram = async (programData) => {
    const response = await axiosInstance.post(`${API_URL}/programs`, programData, getAuthHeader());
    return response.data;
};

const updateProgram = async (id, programData) => {
    const response = await axiosInstance.put(`${API_URL}/programs/${id}`, programData, getAuthHeader());
    return response.data;
};

const deleteProgram = async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/programs/${id}`, getAuthHeader());
    return response.data;
};

const getStaff = async () => {
    const response = await axiosInstance.get(`${API_URL}/staff`, getAuthHeader());
    return response.data;
};

const addStaff = async (staffData) => {
    const response = await axiosInstance.post(`${API_URL}/staff`, staffData, getAuthHeader());
    return response.data;
};

const updateStaff = async (id, staffData) => {
    const response = await axiosInstance.put(`${API_URL}/staff/${id}`, staffData, getAuthHeader());
    return response.data;
};

const deleteStaff = async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/staff/${id}`, getAuthHeader());
    return response.data;
};

const getSessions = async () => {
    const response = await axiosInstance.get(`${API_URL}/sessions`, getAuthHeader());
    return response.data;
};

const addSession = async (sessionData) => {
    const response = await axiosInstance.post(`${API_URL}/sessions`, sessionData, getAuthHeader());
    return response.data;
};

const deleteSession = async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/sessions/${id}`, getAuthHeader());
    return response.data;
};

const getIncentives = async () => {
    const response = await axiosInstance.get(`${API_URL}/incentives`, getAuthHeader());
    return response.data;
};

const addIncentive = async (incentiveData) => {
    const response = await axiosInstance.post(`${API_URL}/incentives`, incentiveData, getAuthHeader());
    return response.data;
};

const getProfile = async () => {
    const response = await axiosInstance.get(`${API_URL}/profile`, getAuthHeader());
    return response.data;
};

const updateProfile = async (profileData) => {
    const response = await axiosInstance.put(`${API_URL}/profile`, profileData, getAuthHeader());
    return response.data;
};

const getPendingActions = async () => {
    const response = await axiosInstance.get(`${API_URL}/pending-actions`, getAuthHeader());
    return response.data;
};

const uploadDocuments = async (formData) => {
    const response = await axiosInstance.post(`${API_URL}/documents`, formData, {
        headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const getCentreRegistration = async () => {
    const response = await axiosInstance.get(`${API_URL}/centre-registration`, getAuthHeader());
    return response.data;
};

const saveCentreRegistration = async (payload) => {
    const response = await axiosInstance.post(`${API_URL}/centre-registration`, payload, getAuthHeader());
    return response.data;
};

const wellnessService = {
    getDashboardData,
    getPrograms,
    addProgram,
    updateProgram,
    deleteProgram,
    getStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    getSessions,
    addSession,
    deleteSession,
    getIncentives,
    addIncentive,
    getProfile,
    updateProfile,
    getPendingActions,
    uploadDocuments,
    getPublicProfile,
    getCentreRegistration,
    saveCentreRegistration
};

export default wellnessService;
