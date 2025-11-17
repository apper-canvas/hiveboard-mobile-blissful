import { Link } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 p-8">
      {/* Icon */}
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <ApperIcon 
          name="Search" 
          className="w-16 h-16 text-gray-400" 
        />
      </div>
      
      {/* Content */}
      <div className="space-y-4 max-w-md">
        <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600">
          The page you're looking for doesn't exist or has been moved. 
          Don't worry, it happens to the best of us!
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link to="/">
          <Button size="lg">
            <ApperIcon name="Home" className="w-5 h-5" />
            Go Home
          </Button>
        </Link>
        
        <Link to="/communities">
          <Button variant="secondary" size="lg">
            <ApperIcon name="Search" className="w-5 h-5" />
            Browse Communities
          </Button>
        </Link>
      </div>

      {/* Help Links */}
      <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <ApperIcon name="TrendingUp" className="w-4 h-4" />
          <span>Trending Posts</span>
        </div>
        <div className="flex items-center gap-2">
          <ApperIcon name="Users" className="w-4 h-4" />
          <span>Popular Communities</span>
        </div>
        <div className="flex items-center gap-2">
          <ApperIcon name="Plus" className="w-4 h-4" />
          <span>Create Content</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;