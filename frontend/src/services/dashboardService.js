import axios from 'axios';

const API_URL = '/api/dashboard';

// Helper to get token
const getAuthHeader = () => {
};

const getOverview = async () => {
    const response = await axiosInstance.get(`${API_URL}/overview`, getAuthHeader());
    return response.data;
};

const getNaacProgress = async () => {
    const response = await axiosInstance.get(`${API_URL}/naac-progress`, getAuthHeader());
    return response.data;
};

const getDepartments = async () => {
    const response = await axiosInstance.get(`${API_URL}/departments`, getAuthHeader());
    return response.data;
};

const getResearch = async () => {
    const response = await axiosInstance.get(`${API_URL}/research`, getAuthHeader());
    return response.data;
};

const getIncentives = async () => {
    const response = await axiosInstance.get(`${API_URL}/incentives`, getAuthHeader());
    return response.data;
};

const getNaacCriteria = async () => {
    const response = await axiosInstance.get(`${API_URL}/naac-criteria`, getAuthHeader());
    return response.data;
};

const dashboardService = {
    getOverview,
    getNaacProgress,
    getDepartments,
    getResearch,
    getIncentives,
    getNaacCriteria
};

export default dashboardService;
