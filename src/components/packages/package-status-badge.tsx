import { Badge } from "@/components/ui/badge";
import type { PackageStatus } from "@/lib/types/package";
import { getStatusColor, getStatusLabel } from "@/lib/utils/status";

export function PackageStatusBadge({ status }: { status: PackageStatus }) {
  return (
    <Badge variant="secondary" className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
