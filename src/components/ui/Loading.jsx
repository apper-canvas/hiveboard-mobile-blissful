import { cn } from "@/utils/cn";

const Loading = ({ className, variant = "feed" }) => {
  if (variant === "feed") {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 bg-gray-200 rounded skeleton-shimmer"></div>
                <div className="w-8 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                <div className="w-6 h-6 bg-gray-200 rounded skeleton-shimmer"></div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded skeleton-shimmer"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-16 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                </div>
              </div>
              {index % 3 === 0 && (
                <div className="w-20 h-20 bg-gray-200 rounded-lg skeleton-shimmer"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "post") {
    return (
      <div className={cn("bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse", className)}>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 bg-gray-200 rounded skeleton-shimmer"></div>
            <div className="w-8 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
            <div className="w-6 h-6 bg-gray-200 rounded skeleton-shimmer"></div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
              <div className="w-20 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
              <div className="w-12 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded skeleton-shimmer"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded skeleton-shimmer"></div>
              <div className="h-4 bg-gray-200 rounded skeleton-shimmer"></div>
              <div className="w-2/3 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "comments") {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-5 bg-gray-200 rounded skeleton-shimmer"></div>
                <div className="w-6 h-3 bg-gray-200 rounded skeleton-shimmer"></div>
                <div className="w-5 h-5 bg-gray-200 rounded skeleton-shimmer"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-3 bg-gray-200 rounded skeleton-shimmer"></div>
                  <div className="w-10 h-3 bg-gray-200 rounded skeleton-shimmer"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                <div className="w-12 h-3 bg-gray-200 rounded skeleton-shimmer"></div>
              </div>
            </div>
            {index < 2 && (
              <div className="ml-8 mt-3 pl-4 border-l-2 border-gray-100">
                <div className="flex gap-3 animate-pulse">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                    <div className="w-5 h-3 bg-gray-200 rounded skeleton-shimmer"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-3 bg-gray-200 rounded skeleton-shimmer"></div>
                      <div className="w-8 h-3 bg-gray-200 rounded skeleton-shimmer"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded skeleton-shimmer"></div>
                    <div className="w-2/3 h-3 bg-gray-200 rounded skeleton-shimmer"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100", className)}>
      <div className="text-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <div className="text-lg font-medium text-gray-700">Loading content...</div>
      </div>
    </div>
  );
};

export default Loading;