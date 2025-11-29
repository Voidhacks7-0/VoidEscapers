import { clsx } from 'clsx';

export default function MetricCard({ title, value, unit, icon: Icon, color, onClick, trend }) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "p-5 rounded-2xl border border-border bg-card cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] group",
                "flex flex-col justify-between h-full"
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-3 rounded-xl bg-opacity-10", color.bg, color.text)}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={clsx("text-xs font-medium px-2 py-1 rounded-full",
                        trend > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                        {trend > 0 ? "+" : ""}{trend}%
                    </span>
                )}
            </div>

            <div>
                <h4 className="text-muted-foreground font-medium text-sm mb-1">{title}</h4>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{value}</span>
                    <span className="text-sm text-muted-foreground">{unit}</span>
                </div>
            </div>
        </div>
    );
}
