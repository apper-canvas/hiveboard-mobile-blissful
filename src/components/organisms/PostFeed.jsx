import { useState, useEffect, useCallback } from "react";
import PostCard from "@/components/organisms/PostCard";
import FilterTabs from "@/components/molecules/FilterTabs";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { postService } from "@/services/api/postService";
import { cn } from "@/utils/cn";

const PostFeed = ({ communityName = null, className }) => {
  const [posts, setPosts] = useState([]);
  const [postType, setPostType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("hot");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

const loadPosts = useCallback(async (filter = "hot", type = "all", reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError("");
      }

      const offset = reset ? 0 : posts.length;
      const limit = 10;

let newPosts;
      if (communityName) {
        newPosts = await postService.getByCommunity(communityName, filter, limit, offset, type);
      } else {
        newPosts = await postService.getAll(filter, limit, offset, type);
      }

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === limit);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load posts");
      if (reset) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [posts.length, communityName]);

useEffect(() => {
    loadPosts(activeFilter, postType, true);
  }, [activeFilter, postType, communityName]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleRetry = () => {
    loadPosts(activeFilter, true);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    await loadPosts(activeFilter, false);
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          !== document.documentElement.offsetHeight) return;
      
      if (hasMore && !loadingMore && !loading) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, loading]);

  if (loading) {
    return <Loading variant="feed" className={className} />;
  }

  if (error) {
    return (
      <ErrorView
        message={error}
        onRetry={handleRetry}
        className={className}
      />
    );
  }

  return (
<div className={cn("space-y-4", className)}>
      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <FilterTabs 
          activeFilter={activeFilter}
          postType={postType}
          onFilterChange={handleFilterChange}
          onTypeChange={setPostType}
        />
        
        {communityName && (
          <div className="text-sm text-gray-600">
            Showing posts from r/{communityName}
          </div>
        )}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <Empty
          title={communityName ? `No posts in r/${communityName}` : "No posts found"}
          message={
            communityName 
              ? "This community doesn't have any posts yet." 
              : "No posts match the current filter."
          }
          actionText="Create First Post"
          icon="FileText"
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.Id} post={post} />
          ))}
          
          {/* Load More Indicator */}
          {loadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-3 text-gray-600">
                <ApperIcon name="Loader2" className="w-5 h-5 animate-spin" />
                <span>Loading more posts...</span>
              </div>
            </div>
          )}
          
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <ApperIcon name="Check" className="w-6 h-6 mx-auto mb-2" />
              <p>You've reached the end! No more posts to load.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostFeed;