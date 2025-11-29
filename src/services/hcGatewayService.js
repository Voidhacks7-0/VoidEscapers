import axios from 'axios';

// TODO: Replace with your actual HCGateway API endpoint and key
const API_BASE_URL = 'https://api.hcgateway.shuchir.dev';
const API_KEY = '9LuxDxaCw8G4S3pEdu7ua29CGJkhAi16C9dhT6ZV7xo';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    }
});

export const fetchSteps = async (startDate, endDate) => {
    try {
        // Example payload, adjust based on actual HCGateway docs
        const response = await apiClient.post('/fetch/steps', {
            startDate,
            endDate
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching steps:", error);
        throw error;
    }
};

export const fetchCalories = async (startDate, endDate) => {
    try {
        const response = await apiClient.post('/fetch/calories', {
            startDate,
            endDate
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching calories:", error);
        throw error;
    }
};

export const fetchBloodPressure = async (startDate, endDate) => {
    try {
        const response = await apiClient.post('/fetch/blood_pressure', {
            startDate,
            endDate
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching blood pressure:", error);
        throw error;
    }
};
