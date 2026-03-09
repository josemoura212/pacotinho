import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function PackageCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-28" />
      </CardContent>
    </Card>
  );
}

export default function AppLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-3">
        <PackageCardSkeleton />
        <PackageCardSkeleton />
        <PackageCardSkeleton />
        <PackageCardSkeleton />
      </div>
    </div>
  );
}
