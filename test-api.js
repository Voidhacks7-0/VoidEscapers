import axios from 'axios';

const API_BASE_URL = 'https://api.hcgateway.shuchir.dev';
const API_KEY = '9LuxDxaCw8G4S3pEdu7ua29CGJkhAi16C9dhT6ZV7xo';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    }
});

async function testApi() {
    console.log(`Testing Health Endpoints on ${API_BASE_URL}...`);

    const endpoints = ['/', '/health', '/status', '/api/health', '/v1/health'];

    for (const endpoint of endpoints) {
        try {
            console.log(`GET ${endpoint} ...`);
            const res = await apiClient.get(endpoint);
            console.log(`SUCCESS ${endpoint}:`, res.status, res.data);
        } catch (e) {
            console.log(`FAILED ${endpoint}:`, e.response ? e.response.status : e.message);
        }
    }
}

testApi();
