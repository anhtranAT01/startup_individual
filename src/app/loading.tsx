import { Skeleton } from "@/components/ui/feedback";

export default function GlobalLoading() {
  return (
    <div className="container py-10 space-y-6">
      <Skeleton className="h-36 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}
