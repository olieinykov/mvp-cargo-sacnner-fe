import { BADGE, SEVERITY_CONFIG } from '../../lib/utils/constants';
import type { AuditIssue } from '../../lib/utils/useAuditStore';

type IssueCardProps = { issue: AuditIssue };

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const cfg = SEVERITY_CONFIG[issue.severity];
  return (
    <div className="flex overflow-hidden rounded-lg border border-border/50 bg-background shadow-sm">
      <div className={`w-1 shrink-0 ${cfg.bar}`} aria-hidden="true" />
      <div className="flex-1 px-4 py-3">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className={`${BADGE} ${cfg.bg} ${cfg.color} ${cfg.badgeRing}`}>
            {issue.severity}
          </span>
          <span className="text-sm font-semibold text-foreground">{issue.check}</span>
          {issue.cfr && (
            <span className="font-mono text-xs text-muted-foreground">{issue.cfr}</span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground/80">{issue.message}</p>
        {issue.fix && (
          <div className="mt-2 flex gap-1.5 rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
            <span className="shrink-0 font-semibold text-foreground">Fix:</span>
            <span className="text-muted-foreground">{issue.fix}</span>
          </div>
        )}
      </div>
    </div>
  );
};
