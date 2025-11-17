import React, { useState } from "react";
import { formatDistanceToNow, isValid } from "date-fns";
import { commentService } from "@/services/api/commentService";
import { awardService } from "@/services/api/awardService";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import AwardDisplay from "@/components/molecules/AwardDisplay";
import VoteButtons from "@/components/molecules/VoteButtons";
import AwardModal from "@/components/molecules/AwardModal";
import CommentForm from "@/components/molecules/CommentForm";

const CommentThread = ({ 
  comment, 
  onCommentAdded, 
  onCommentVoted, 
  depth = 0 
}) => {
const [currentComment, setCurrentComment] = useState(comment);
const [showReplyForm, setShowReplyForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [commentAwards, setCommentAwards] = useState(comment.awards || []);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [isSaved, setIsSaved] = useState(commentService.isCommentSaved(comment.Id));
  // Calculate total reply count recursively
  const getTotalReplyCount = (comment) => {
    if (!comment.children || comment.children.length === 0) return 0;
    
    let count = comment.children.length;
    comment.children.forEach(child => {
      count += getTotalReplyCount(child);
    });
    return count;
  };

  const totalReplyCount = getTotalReplyCount(currentComment);

const handleVote = async (voteType) => {
    try {
      const updatedComment = await commentService.vote(currentComment.Id, voteType);
      setCurrentComment(updatedComment);
      onCommentVoted(currentComment.Id, updatedComment);
      
      if (voteType === "up" && updatedComment.userVote === "up") {
        toast.success("Comment upvoted!");
      } else if (voteType === "down" && updatedComment.userVote === "down") {
        toast.success("Comment downvoted!");
      } else {
        toast.success("Vote removed");
      }
    } catch (error) {
      toast.error("Failed to vote. Please try again.");
    }
  };

  const handleLike = async () => {
    try {
      const updatedComment = await commentService.like(currentComment.Id);
      setCurrentComment(updatedComment);
      onCommentVoted(currentComment.Id, updatedComment);
      
      if (updatedComment.isLiked) {
        toast.success("Comment liked!");
      } else {
        toast.success("Like removed");
      }
    } catch (error) {
      toast.error("Failed to like comment. Please try again.");
    }
};
  
  const handleSave = async () => {
    try {
      if (isSaved) {
        await commentService.unsaveComment(comment.Id);
        setIsSaved(false);
        toast.success("Comment removed from saved");
      } else {
        await commentService.saveComment(comment.Id);
        setIsSaved(true);
        toast.success("Comment saved successfully");
      }
    } catch (error) {
      toast.error("Failed to update save status");
    }
  };

const handleReplyAdded = (newReply) => {
    // Update local state to include the new reply
    setCurrentComment(prev => ({
      ...prev,
      children: [...(prev.children || []), newReply]
    }));
    
    // Notify parent component
    onCommentAdded(newReply);
    setShowReplyForm(false);
  };

  const maxDepth = 2;
  const shouldShowReplyButton = depth < maxDepth;

  return (
    <div className={cn(
      "comment-thread",
      depth === 0 ? "depth-0" : ""
    )}>
      <div className="bg-white rounded-lg p-4 border border-gray-100">
<div className="flex gap-3">
          {/* Vote Buttons */}
          <div className="flex-shrink-0">
            <div className="flex gap-2">
              <VoteButtons 
                upvotes={currentComment.upvotes}
                downvotes={currentComment.downvotes}
                userVote={currentComment.userVote}
                onVote={handleVote}
                size="sm"
              />
              <VoteButtons 
                mode="like"
                likes={currentComment.likes || 0}
                isLiked={currentComment.isLiked || false}
                onLike={handleLike}
                size="sm"
              />
            </div>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
{/* Header */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="font-semibold text-gray-900">
                u/{currentComment.authorUsername}
              </span>
              <span>•</span>
              <span className="text-xs text-gray-500">
                {currentComment?.timestamp && isValid(new Date(currentComment.timestamp)) 
                  ? `${formatDistanceToNow(new Date(currentComment.timestamp))} ago`
                  : 'Date unavailable'}
              </span>
              {totalReplyCount > 0 && (
                <>
                  <span>•</span>
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-1 text-primary hover:text-indigo-600 font-medium"
                  >
                    <ApperIcon 
                      name={isCollapsed ? "Plus" : "Minus"} 
                      className="w-3 h-3" 
                    />
                    {isCollapsed ? "Expand" : "Collapse"}
                  </button>
                  {isCollapsed && totalReplyCount > 0 && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({totalReplyCount} {totalReplyCount === 1 ? 'reply' : 'replies'})
                    </span>
                  )}
                </>
              )}
</div>

            {/* Awards Display */}
            {commentAwards.length > 0 && (
              <div className="mt-2">
                <AwardDisplay awards={commentAwards} />
              </div>
)}
            {/* Content */}
            {!isCollapsed && (
              <>
                <div className="text-gray-900 mb-3">
                  {currentComment.content}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  {shouldShowReplyButton && (
                    <button
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary font-medium"
                    >
                      <ApperIcon name="MessageSquare" className="w-4 h-4" />
                      Reply
                    </button>
                  )}
                  {/* Give Award Button */}
                  <button
                    onClick={() => setShowAwardModal(true)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors hover:bg-gray-100 px-2 py-1 rounded group"
                    title="Give Award"
                  >
                    <ApperIcon name="Gift" size={14} />
                    <span className="opacity-0 group-hover:opacity-100">Award</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave();
                    }}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${isSaved ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
                  >
                    <ApperIcon name={isSaved ? "BookmarkCheck" : "Bookmark"} className="w-4 h-4" />
                    {isSaved ? "Saved" : "Save"}
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary font-medium"
                  >
                    <ApperIcon name="Share" className="w-4 h-4" />
                    Share
                  </button>
                </div>

                {/* Reply Form */}
                {showReplyForm && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <CommentForm 
                      postId={currentComment.postId}
                      parentId={currentComment.Id}
                      onCommentAdded={handleReplyAdded}
                      placeholder={`Reply to u/${currentComment.authorUsername}...`}
                      compact
                    />
                  </div>
                )}
              </>
            )}
          </div>
</div>
      </div>

      {/* Child Comments */}
      {!isCollapsed && currentComment.children && currentComment.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {currentComment.children.map((childComment) => (
            <CommentThread
              key={childComment.Id}
              comment={childComment}
              onCommentAdded={onCommentAdded}
              onCommentVoted={onCommentVoted}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
{/* Award Modal */}
      <AwardModal
        isOpen={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        onAwardGiven={() => {
          const awards = awardService.getCommentAwards(currentComment.Id);
          setCommentAwards(awards);
        }}
        contentId={currentComment.Id}
      />
    </div>
  );
};

export default CommentThread;