import { addManualEntry } from './dataService';
import simulationData from '../data/simulationData.json';

let simulationInterval = null;
let currentIndex = 0;

export const startSimulation = (userId) => {
    if (simulationInterval) {
        console.log("Simulation already running.");
        return;
    }

    console.log("Starting Real-time Data Simulation...");

    const pushNextData = async () => {
        if (currentIndex >= simulationData.length) {
            currentIndex = 0; // Loop back to start
        }

        const dataPoint = simulationData[currentIndex];
        console.log(`Simulating data point ${dataPoint.id}...`);

        try {
            // Map JSON keys to Firestore Metric IDs
            const metrics = [
                { id: 'heart_rate', value: dataPoint.HeartRate_bpm },
                { id: 'spo2', value: dataPoint.SpO2_percent },
                { id: 'sleep', value: dataPoint.Sleep_hrs },
                { id: 'sugar', value: dataPoint['Glucose_mg/dL'] },
                { id: 'steps', value: dataPoint.Steps_steps },
                { id: 'calories', value: dataPoint.Burn_kcal },
                { id: 'stress', value: dataPoint.Stress_score },
                { id: 'bp', value: dataPoint.BP_sys }
            ];

            // Push all metrics for this data point
            // We use Promise.all to push them "simultaneously"
            await Promise.all(metrics.map(metric =>
                addManualEntry(userId, metric.id, metric.value)
            ));

            console.log("Data point pushed successfully.");
            currentIndex++;

        } catch (error) {
            console.error("Error pushing simulation data:", error);
        }
    };

    // Initial push
    pushNextData();

    // Set interval to push every 60-120 seconds (randomized)
    // For smoother demo, let's stick to 60 seconds as requested "1 to 2 minutes"
    // Actually, let's make it 60 seconds fixed for consistency, or maybe 90s.
    // User said "1 to 2 minutes". Let's do 75 seconds.
    simulationInterval = setInterval(pushNextData, 75000);
};

export const stopSimulation = () => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
        console.log("Simulation stopped.");
    }
};
