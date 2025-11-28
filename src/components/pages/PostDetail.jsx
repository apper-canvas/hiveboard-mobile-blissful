import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow, isValid } from "date-fns";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { commentService } from "@/services/api/commentService";
import { postService } from "@/services/api/postService";
import { awardService } from "@/services/api/awardService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import CommentSection from "@/components/organisms/CommentSection";
import AwardDisplay from "@/components/molecules/AwardDisplay";
import VoteButtons from "@/components/molecules/VoteButtons";
import AwardModal from "@/components/molecules/AwardModal";
import { cn } from "@/utils/cn";
export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [postAwards, setPostAwards] = useState([]);
  const [canAward, setCanAward] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  // Wrap loadPost in useCallback to stabilize the reference
const loadPost = useCallback(async () => {
    // Early validation
    if (!postId) {
      setError('No post ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate postId before making request
      const numericPostId = parseInt(postId);
      if (isNaN(numericPostId)) {
        throw new Error('Invalid post ID format');
      }
      
      // Fetch post with validated ID
      const postData = await postService.getById(numericPostId);
      
      if (!postData) {
        setError('Post not found');
        setPost(null);
        return;
      }
      
      setPost(postData);
      
      // Fetch additional data in parallel to avoid blocking UI
      try {
        const [awards] = await Promise.allSettled([
          awardService.getPostAwards(postData.Id)
        ]);
        
        setPostAwards(awards.status === 'fulfilled' ? (awards.value || []) : []);
        
        // Check if user can award
        setCanAward(user?.Id !== postData.userId && !!user?.Id);
      } catch (additionalDataError) {
        // Don't fail the entire load for auxiliary data
        console.warn('Error loading additional post data:', additionalDataError);
      }
      
    } catch (err) {
      console.error('Error loading post:', err);
      setError(err?.message || 'Failed to load post');
      setPost(null);
    } finally {
      // Always clear loading state
      setLoading(false);
    }
  }, [postId, user?.Id]);

// Effect now depends only on postId and loadPost is stable
  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId, loadPost]);
const handleVote = async (voteType) => {
    if (!post) return;
    
    try {
      const updatedPost = await postService.vote(post.Id, voteType, user);
      setPost(updatedPost);
      
      if (voteType === "up" && updatedPost.userVote === "up") {
        toast.success("Upvoted!");
      } else if (voteType === "down" && updatedPost.userVote === "down") {
        toast.success("Downvoted!");
      } else {
        toast.success("Vote removed");
      }
    } catch (error) {
      console.error('Error voting on post:', error);
      toast.error("Failed to vote. Please try again.");
    }
  };

const handleLike = async () => {
    if (!post) return;
    
    try {
      const updatedPost = await postService.like(post.Id, user);
      setPost(updatedPost);
      
      if (updatedPost.isLiked) {
        toast.success("Post liked!");
      } else {
        toast.success("Like removed");
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error("Failed to like post. Please try again.");
    }
  };

const handleSave = async () => {
    if (!post) return;
    
    try {
      if (isSaved) {
        await postService.unsavePost(post.Id, user);
        setIsSaved(false);
        toast.success("Post removed from saved");
      } else {
        await postService.savePost(post.Id, user);
        setIsSaved(true);
        toast.success("Post saved successfully");
      }
    } catch (error) {
      console.error('Error updating save status:', error);
      toast.error("Failed to update save status");
    }
  };
  
const handleHide = async () => {
    if (!post) return;
    
    try {
      await postService.hidePost(post.Id, user);
      setIsHidden(true);
      toast.success("Post hidden from feed");
    } catch (error) {
      console.error('Error hiding post:', error);
      toast.error("Failed to hide post");
    }
  };
  const handleRetry = () => {
    loadPost();
  };

  if (loading) {
    return <Loading variant="post" />;
  }

  if (error) {
    return (
      <ErrorView
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  if (!post) {
    return (
      <ErrorView
        message="Post not found"
        showRetry={false}
      />
    );
  }

const getContentTypeIcon = () => {
    if (!post?.contentType) return "FileText";
    switch (post.contentType.toLowerCase()) {
      case "image":
        return "Image";
      case "video":
        return "Video";
      case "link":
        return "Link";
      case "poll":
        return "BarChart3";
      default:
        return "FileText";
    }
  };

return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Post Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex gap-6 p-6">
          {/* Vote Buttons */}
          <div className="flex-shrink-0">
            <div className="flex gap-4">
              <VoteButtons 
                upvotes={post.upvotes}
                downvotes={post.downvotes}
                userVote={post.userVote}
                onVote={handleVote}
                size="lg"
              />
              <VoteButtons 
                mode="like"
                likes={post.likes || 0}
                isLiked={post.isLiked || false}
                onLike={handleLike}
                size="lg"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Metadata */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link 
                to={`/r/${post.communityName}`}
                className="font-semibold text-gray-900 hover:text-primary transition-colors"
              >
                r/{post.communityName}
              </Link>
              <span>•</span>
              <span>Posted by u/{post.authorUsername}</span>
              <span>•</span>
              <span>{post?.timestamp && isValid(new Date(post.timestamp)) 
                ? `${formatDistanceToNow(new Date(post.timestamp))} ago`
                : 'Date unavailable'}</span>
              <ApperIcon
                name="MoreHorizontal"
                className="w-4 h-4 text-gray-400 ml-auto"
              />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            {/* Content */}
            {post.content && (
              <div className="prose prose-gray max-w-none mb-6">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            )}

            {/* Media Content */}
            {post.thumbnailUrl && post.contentType === "image" && (
              <div className="mb-6">
                <img 
                  src={post.thumbnailUrl} 
                  alt={post.title}
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <ApperIcon name="MessageSquare" className="w-4 h-4" />
                <span className="font-medium">{commentCount} comments</span>
              </div>
              <button className="flex items-center gap-2 hover:text-primary transition-colors">
                <ApperIcon name="Share" className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 hover:text-primary transition-colors ${isSaved ? 'text-primary' : ''}`}
              >
                <ApperIcon name={isSaved ? "BookmarkCheck" : "Bookmark"} className="w-4 h-4" />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
              <button 
                onClick={handleHide}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <ApperIcon name="EyeOff" className="w-4 h-4" />
                <span>Hide</span>
              </button>
              <button
                onClick={() => setShowAwardModal(true)}
                className="flex items-center gap-2 hover:text-primary transition-colors"
                title="Give Award"
              >
                <ApperIcon name="Gift" className="w-4 h-4" />
                <span>Award</span>
              </button>
<button className="flex items-center gap-2 hover:text-primary transition-colors">
                <ApperIcon name="Flag" className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection postId={postId} onCommentCountChange={setCommentCount} />
      {postAwards.length > 0 && (
        <div className="flex items-center gap-4 py-4 border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Awards:</span>
          <AwardDisplay awards={postAwards} />
        </div>
      )}

      {/* Award Modal */}
      {canAward && (
        <AwardModal
          postId={post.Id}
          isOpen={showAwardModal}
          onAwardGiven={async () => {
            const updatedAwards = await awardService.getPostAwards(post.Id);
            setPostAwards(updatedAwards || []);
            toast.success('Award given successfully!');
          }}
          onClose={() => setShowAwardModal(false)}
        />
      )}
    </div>
  );
}