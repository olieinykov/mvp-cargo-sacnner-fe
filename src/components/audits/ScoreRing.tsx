import { BADGE } from "../../lib/utils/constants";

export const ScoreRing = ({ score, passed }: { score: number; passed: boolean }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const trackColor = score >= 80 ? '#d1fae5' : score >= 50 ? '#fef3c7' : '#fee2e2';

  return (
    <div className="flex flex-col items-center gap-2.5">
      <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="48" cy="48" r={radius} fill="none" stroke={trackColor} strokeWidth="7" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)"
        />
        <text x="48" y="44" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="700" fill={color}>
          {score}
        </text>
        <text x="48" y="61" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#9ca3af">
          / 100
        </text>
      </svg>
      <span className={`${BADGE} ${passed ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {passed ? 'Passed' : 'Failed'}
      </span>
    </div>
  );
}