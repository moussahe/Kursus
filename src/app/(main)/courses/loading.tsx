import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-10 w-96 mx-auto mb-4 bg-white/20" />
          <Skeleton className="h-6 w-[500px] mx-auto bg-white/20" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters skeleton */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-lg" />
          ))}
        </div>

        {/* Course grid skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white shadow-sm overflow-hidden"
            >
              <Skeleton className="h-40 w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
