import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnomalyBar, DispositionBadge, SourceBadge, VerificationBadge } from "@/components/status-badges";
import { formatRelative } from "@/lib/format";
import type { Scan } from "@/lib/types";
import { cn } from "@/lib/utils";

export function InspectionTable({
  scans,
  compact = false,
  className,
}: {
  scans: Scan[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[150px] text-[11.5px] uppercase tracking-wide">Scan ID</TableHead>
            <TableHead className="text-[11.5px] uppercase tracking-wide">Part / Batch</TableHead>
            <TableHead className="text-[11.5px] uppercase tracking-wide">Captured</TableHead>
            <TableHead className="text-[11.5px] uppercase tracking-wide">Source</TableHead>
            {!compact && (
              <TableHead className="text-[11.5px] uppercase tracking-wide">
                Expected → Predicted
              </TableHead>
            )}
            <TableHead className="text-right text-[11.5px] uppercase tracking-wide">Conf.</TableHead>
            {!compact && <TableHead className="text-[11.5px] uppercase tracking-wide">Anomaly</TableHead>}
            <TableHead className="text-[11.5px] uppercase tracking-wide">Disposition</TableHead>
            {!compact && <TableHead className="text-[11.5px] uppercase tracking-wide">Verification</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map((scan) => (
            <TableRow key={scan.id} className="group">
              <TableCell>
                <Link
                  to="/inspections/$scanId"
                  params={{ scanId: scan.id }}
                  className="font-mono text-[12.5px] font-medium text-primary underline-offset-2 hover:underline"
                >
                  {scan.id}
                </Link>
              </TableCell>
              <TableCell>
                <div className="text-[13px] font-medium text-foreground">{scan.partCode}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{scan.batchCode}</div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-[12.5px] text-muted-foreground">
                {formatRelative(scan.capturedAt)}
              </TableCell>
              <TableCell>
                <SourceBadge source={scan.source} label={compact ? undefined : scan.sourceLabel} size="sm" />
              </TableCell>
              {!compact && (
                <TableCell>
                  <div className="text-[12.5px]">
                    <span className="text-muted-foreground">{scan.expectedMaterialCode}</span>
                    <span className="mx-1.5 text-muted-foreground/60">→</span>
                    <span className={cn("font-medium", scan.predictedMaterialCode !== scan.expectedMaterialCode && "text-warning")}>
                      {scan.predictedMaterialCode}
                    </span>
                  </div>
                </TableCell>
              )}
              <TableCell className="numeric text-right text-[13px] font-medium text-foreground">
                {Math.round(scan.confidence * 100)}%
              </TableCell>
              {!compact && (
                <TableCell>
                  <AnomalyBar value={scan.anomalyScore} />
                </TableCell>
              )}
              <TableCell>
                <DispositionBadge disposition={scan.disposition} size="sm" />
              </TableCell>
              {!compact && <TableCell><VerificationBadge status={scan.verificationStatus} /></TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
