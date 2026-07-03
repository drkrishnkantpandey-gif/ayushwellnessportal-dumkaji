// src/services/ayushHospitalService.js
import axios from 'axios';

const API_URL = '/api/ayush-hospital';

const getAuthHeader = () => {
};

const getDashboardData = async () => {
    const response = await axiosInstance.get(`${API_URL}/dashboard`, getAuthHeader());
    return response.data;
};

const ayushHospitalService = {
    getDashboardData
};

export default ayushHospitalService;
