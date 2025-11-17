import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ErrorView = ({ 
  message = "Something went wrong", 
  onRetry, 
  className,
  showRetry = true 
}) => {
  return (
    <div className={cn(
      "min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 p-8",
      className
    )}>
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
        <ApperIcon 
          name="AlertTriangle" 
          className="w-12 h-12 text-red-500" 
        />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-gray-900">
          Oops! Something went wrong
        </h3>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          {message}
        </p>
        <p className="text-sm text-gray-500">
          Don't worry, these things happen. Please try again.
        </p>
      </div>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-red-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ApperIcon name="RotateCcw" className="w-5 h-5" />
          Try Again
        </button>
      )}

      <div className="text-xs text-gray-400 mt-8">
        If the problem persists, please check your internet connection.
      </div>
    </div>
  );
};

export default ErrorView;