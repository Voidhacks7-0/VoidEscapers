import React from 'react';

const PremiumAreaChart = ({ data, colorClass, gradientId }) => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value);
    const min = Math.min(...values) * 0.9;
    const max = Math.max(...values) * 1.1;
    const height = 120;
    const width = 300;

    // Generate points for the line
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - min) / (max - min)) * height;
        return `${x},${y}`;
    }).join(' ');

    // Generate points for the filled area (close the loop at the bottom)
    const fillPoints = `${points} ${width},${height} 0,${height}`;

    return (
        <div className={`w-full h-40 flex items-center justify-center ${colorClass}`}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id={`gradient-${gradientId}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0, 0.5, 1].map((offset, i) => (
                    <line
                        key={i}
                        x1="0"
                        y1={height * offset}
                        x2={width}
                        y2={height * offset}
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeDasharray="4 4"
                    />
                ))}

                {/* Filled Area */}
                <polygon
                    points={fillPoints}
                    fill={`url(#gradient-${gradientId})`}
                />

                {/* Stroke Line */}
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-md"
                />

                {/* Interactive Dots */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * width;
                    const y = height - ((d.value - min) / (max - min)) * height;
                    return (
                        <g key={i} className="group/point">
                            <circle cx={x} cy={y} r="3" fill="currentColor" />
                            <circle cx={x} cy={y} r="8" fill="currentColor" className="opacity-0 group-hover/point:opacity-20 transition-opacity" />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default PremiumAreaChart;
