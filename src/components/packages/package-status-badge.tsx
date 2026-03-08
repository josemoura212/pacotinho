import { Badge } from "@/components/ui/badge";
import { getStatusLabel, getStatusColor } from "@/lib/utils/status";
import type { PackageStatus } from "@/lib/types/package";

export function PackageStatusBadge({ status }: { status: PackageStatus }) {
  return (
    <Badge variant="secondary" className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
