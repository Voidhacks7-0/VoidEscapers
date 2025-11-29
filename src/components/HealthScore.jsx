import { clsx } from 'clsx';

export default function HealthScore({ score = 78 }) {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let color = "text-green-500";
    if (score < 50) color = "text-red-500";
    else if (score < 80) color = "text-orange-500";

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-card rounded-3xl shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-4 text-muted-foreground">Overall Health Score</h3>
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-muted/20"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={clsx("transition-all duration-1000 ease-out", color)}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={clsx("text-5xl font-bold", color)}>{score}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground max-w-xs">
                Based on your recent activity, sleep, and vitals.
            </p>
        </div>
    );
}
