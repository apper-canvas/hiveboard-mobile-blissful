import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Empty = ({ 
  title = "Nothing to see here", 
  message = "No content available at the moment",
  actionText = "Create Post",
  onAction,
  icon = "FileText",
  className 
}) => {
  return (
    <div className={cn(
      "min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 p-8",
      className
    )}>
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <ApperIcon 
          name={icon} 
          className="w-16 h-16 text-gray-400" 
        />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-gray-900">
          {title}
        </h3>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          {message}
        </p>
        <p className="text-sm text-gray-500">
          Be the first to share something interesting with the community!
        </p>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-orange-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          {actionText}
        </button>
      )}

      <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <ApperIcon name="Users" className="w-4 h-4" />
          <span>Join the conversation</span>
        </div>
        <div className="flex items-center gap-2">
          <ApperIcon name="TrendingUp" className="w-4 h-4" />
          <span>Share your thoughts</span>
        </div>
      </div>
    </div>
  );
};

export default Empty;