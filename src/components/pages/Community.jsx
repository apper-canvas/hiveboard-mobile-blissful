import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDistanceToNow, isValid } from "date-fns";
import { toast } from "react-toastify";
import { communityService } from "@/services/api/communityService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import PostFeed from "@/components/organisms/PostFeed";
import Sidebar from "@/components/organisms/Sidebar";
import Button from "@/components/atoms/Button";

const Community = () => {
  const { communityName } = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const loadCommunity = async () => {
    try {
      setLoading(true);
      setError("");
const communityData = await communityService.getById(communityName);
      setCommunity(communityData);
      
      // In a real app, check if user is subscribed
      setIsJoined(Math.random() > 0.7); // Random subscription status for demo
    } catch (err) {
      setError(err.message || "Failed to load community");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (communityName) {
      loadCommunity();
    }
  }, [communityName]);

  const handleJoinToggle = () => {
    setIsJoined(!isJoined);
    // In a real app, this would call an API
  };

  const handleRetry = () => {
    loadCommunity();
  };

  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorView
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  if (!community) {
    return (
      <ErrorView
        message="Community not found"
        showRetry={false}
      />
    );
  }

  return (
<div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Community Header */}
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden community-card">
          {/* Custom Banner */}
          <div 
            className="h-40 relative"
            style={{ 
              background: community.theme?.banner || 'linear-gradient(135deg, #6366F1, #8B5CF6)' 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute bottom-4 left-6 text-white">
              <div className="flex items-center gap-2 text-sm opacity-90">
                <ApperIcon name="Users" className="w-4 h-4" />
                <span>{community.onlineUsers?.toLocaleString()} online now</span>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Community Avatar */}
                <div 
                  className="w-24 h-24 -mt-12 rounded-full border-4 border-white flex items-center justify-center shadow-lg relative z-10"
                  style={{ 
                    background: community.theme?.banner || 'linear-gradient(135deg, #6366F1, #8B5CF6)' 
                  }}
                >
                  <span className="text-3xl font-bold text-white">
                    {community.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="mt-2">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    r/{community.name}
                  </h1>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ApperIcon name="Users" className="w-4 h-4" />
                      <span>{formatMemberCount(community.memberCount)} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ApperIcon name="Circle" className="w-2 h-2 fill-green-500 text-green-500" />
                      <span>{community.onlineUsers?.toLocaleString()} online</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ApperIcon name="FileText" className="w-4 h-4" />
                      <span>{community.postCount?.toLocaleString()} posts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ApperIcon name="Calendar" className="w-4 h-4" />
<span className="text-sm text-gray-500 flex items-center gap-2">
                        Created {community?.createdAt && isValid(new Date(community.createdAt)) 
                          ? `${formatDistanceToNow(new Date(community.createdAt))} ago`
                          : 'Date unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3 mt-2">
                <Button
                  onClick={handleJoinToggle}
                  variant={isJoined ? "secondary" : "primary"}
                  className="min-w-[120px] relative"
                  style={!isJoined ? {
                    background: community.theme?.primary || '#6366F1',
                    borderColor: community.theme?.primary || '#6366F1'
                  } : undefined}
                >
                  <ApperIcon 
                    name={isJoined ? "Check" : "Plus"} 
                    className="w-4 h-4 mr-2" 
                  />
                  {isJoined ? "Joined" : "Join"}
                </Button>
                <Button variant="ghost" className="p-3">
                  <ApperIcon name="Bell" className="w-5 h-5" />
                </Button>
                <Button variant="ghost" className="p-3">
                  <ApperIcon name="Share" className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Description */}
            {community.description && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {community.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Posts Feed */}
        <PostFeed communityName={communityName} />
      </div>

{/* Community Sidebar */}
      <Sidebar communityName={communityName} community={community} />
    </div>
  );
};

export default Community;