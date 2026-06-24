function tierFor(score: number, signalCount?: number): { label: string; color: string } {
  if (signalCount === 0) return { label: "No data yet", color: "#9CA3AF" };
  if (score >= 75) return { label: "Well verified", color: "#16A34A" };
  if (score >= 40) return { label: "Mixed signals", color: "#D97706" };
  return { label: "Reports of issues", color: "#DC2626" };
}

interface Props {
  score: number;
  signalCount?: number;
  compact?: boolean;
}

export function TrustBadge({ score, signalCount, compact }: Props) {
  const tier = tierFor(score, signalCount);
  return (
    <span className="trust-badge" style={{ borderColor: tier.color, color: tier.color }}>
      <span className="trust-dot" style={{ backgroundColor: tier.color }} />
      {score}
      {!compact && (
        <span className="trust-label">
          {tier.label}
          {signalCount != null && signalCount > 0 ? ` · ${signalCount} signal${signalCount === 1 ? "" : "s"}` : ""}
        </span>
      )}
    </span>
  );
}
