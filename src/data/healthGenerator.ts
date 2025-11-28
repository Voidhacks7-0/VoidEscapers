export const generateHealthData = (userId: string) => {
    const data = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);


        const systolic = 110 + Math.floor(Math.random() * 30);
        const diastolic = 70 + Math.floor(Math.random() * 20);
        const pulse = 60 + Math.floor(Math.random() * 40);
        const steps = 3000 + Math.floor(Math.random() * 10000);
        const sleep = 5 + Math.random() * 4;

        data.push({
            date: date.toISOString().split('T')[0],
            bp: `${systolic}/${diastolic}`,
            pulseRate: pulse,
            sleepHours: parseFloat(sleep.toFixed(1)),
            stepsCount: steps,
            calorieIntake: 2000 + Math.floor(Math.random() * 500),
            waterIntake: parseFloat((1.5 + Math.random() * 2).toFixed(1)),
            weight: 70 + Math.random() * 2 - 1,
            sugarLevel: 90 + Math.floor(Math.random() * 40),
            userId: userId
        });
    }
    return data.reverse();
};
