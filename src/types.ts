export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    bloodGroup: string;
    avatar: string;
    theme: 'white-black' | 'white-blue' | 'white-aqua';
}

export interface HealthLog {
    date: string;
    bp: string;
    pulseRate: number;
    sleepHours: number;
    stepsCount: number;
    calorieIntake: number;
    waterIntake: number;
    weight: number;
    sugarLevel: number;
    userId: string;
}

export interface ThemeColors {
    background: string;
    card: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
}
