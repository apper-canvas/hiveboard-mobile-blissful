import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow, isValid } from "date-fns";
import { postService } from "@/services/api/postService";
import { awardService } from "@/services/api/awardService";
import { savedService } from "@/services/api/savedService";
import { hiddenService } from "@/services/api/hiddenService";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import AwardDisplay from "@/components/molecules/AwardDisplay";
import VoteButtons from "@/components/molecules/VoteButtons";
import AwardModal from "@/components/molecules/AwardModal";
const PostCard = ({ post, className, onPostUpdate }) => {
  const [currentPost, setCurrentPost] = useState(post);
  const [isSaved, setIsSaved] = useState(postService.isPostSaved(post.Id));
  const [isHidden, setIsHidden] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userVoted, setUserVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [postAwards, setPostAwards] = useState(post.awards || []);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
    if (currentPost.contentType === 'poll' && currentPost.pollActive) {
      const checkVoted = postService.checkUserVoted(currentPost.Id);
      setUserVoted(checkVoted);
      
      const updateTime = () => {
        const time = postService.getTimeRemaining(currentPost.pollEndTime);
        setTimeRemaining(time);
        if (time === 'Ended') {
          setCurrentPost(prev => ({ ...prev, pollActive: false }));
        }
      };
      updateTime();
      const interval = setInterval(updateTime, 60000);
      
      // Load awards for this post
      const awards = awardService.getPostAwards(currentPost.Id);
      setPostAwards(awards);
      return () => clearInterval(interval);
    }
  }, [currentPost.Id, currentPost.contentType, currentPost.pollActive]);

  const handleVote = async (voteType) => {
    try {
      const updatedPost = await postService.vote(currentPost.Id, voteType);
      setCurrentPost(updatedPost);
      
      if (voteType === "up" && updatedPost.userVote === "up") {
        toast.success("Upvoted!");
      } else if (voteType === "down" && updatedPost.userVote === "down") {
        toast.success("Downvoted!");
      } else {
        toast.success("Vote removed");
      }
    } catch (error) {
      toast.error("Failed to vote. Please try again.");
    }
  };

  const handlePollVote = async (optionIndex) => {
    if (userVoted) {
      toast.error("You've already voted in this poll");
      return;
    }
    
    try {
      const updatedPost = await postService.votePoll(currentPost.Id, optionIndex);
      setCurrentPost(updatedPost);
      setUserVoted(true);
      setShowResults(true);
      toast.success("Vote recorded!");
    } catch (error) {
      toast.error(error.message || "Failed to vote. Please try again.");
    }
  };

  const handleEndPollEarly = async () => {
    try {
      const updatedPost = await postService.endPollEarly(currentPost.Id);
      setCurrentPost(updatedPost);
      toast.success("Poll ended successfully");
    } catch (error) {
      toast.error("Failed to end poll. Please try again.");
    }
  };

const handleLike = async () => {
    try {
      const updatedPost = await postService.like(currentPost.Id);
      setCurrentPost(updatedPost);
      
      if (updatedPost.isLiked) {
        toast.success("Post liked!");
      } else {
        toast.success("Like removed");
      }
    } catch (error) {
      toast.error("Failed to like post. Please try again.");
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await postService.unsavePost(currentPost.Id);
        setIsSaved(false);
        toast.success("Post removed from saved");
      } else {
        await postService.savePost(currentPost.Id);
        setIsSaved(true);
        toast.success("Post saved successfully");
      }
    } catch (error) {
      toast.error("Failed to update save status");
    }
  };

  const handleHide = async () => {
    try {
      await postService.hidePost(currentPost.Id);
      setIsHidden(true);
      toast.success("Post hidden from feed");
      if (onPostUpdate) {
        onPostUpdate();
      }
    } catch (error) {
      toast.error("Failed to hide post");
    }
  };

  const handlePostClick = (e) => {
    if (e.target.closest(".vote-buttons") || e.target.closest(".community-link")) {
      return;
    }
    navigate(`/post/${currentPost.Id}`);
  };

  useEffect(() => {
    if (post) {
      setCurrentPost(post);
    }
  }, [post]);

const getContentTypeIcon = () => {
    if (!currentPost.contentType) return "FileText";
    switch (currentPost.contentType) {
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

  const handleAwardGiven = (award) => {
    const updatedAwards = [...postAwards, award];
    setPostAwards(updatedAwards);
  };

  const getTotalVotes = () => {
    if (!currentPost.pollOptions) return 0;
    return currentPost.pollOptions.reduce((sum, opt) => sum + (opt.votes || 0), 0);
  };

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-100 card-hover cursor-pointer"
    )}>
      <div className="flex gap-4 p-4" onClick={handlePostClick}>
        {/* Vote Buttons */}
        <div
          className="vote-buttons flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-4">
            <VoteButtons 
              upvotes={currentPost.upvotes}
              downvotes={currentPost.downvotes}
              userVote={currentPost.userVote}
              onVote={handleVote}
            />
            <VoteButtons 
              mode="like"
              likes={currentPost.likes || 0}
              isLiked={currentPost.isLiked || false}
              onLike={handleLike}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Metadata */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link 
              to={`/r/${currentPost.communityName}`}
              className="community-link font-semibold text-gray-900 hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              r/{currentPost.communityName}
            </Link>
            <span>•</span>
            <span>u/{currentPost.authorUsername}</span>
            <span>•</span>
            <span>{currentPost?.timestamp && isValid(new Date(currentPost.timestamp)) 
              ? `${formatDistanceToNow(new Date(currentPost.timestamp))} ago`
              : 'Date unavailable'}</span>
            <ApperIcon
              name="MoreHorizontal"
              className="w-4 h-4 text-gray-400 ml-auto"
            />
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary transition-colors">
            {currentPost.title}
          </h2>

          {/* Content Preview */}
          {currentPost.content && (
            <p className="text-gray-700 mb-3 line-clamp-3">
              {currentPost.content.length > 200 
                ? `${currentPost.content.substring(0, 200)}...` 
                : currentPost.content}
            </p>
          )}

          {/* Actions */}
          {currentPost.contentType === 'poll' ? (
            <div className="space-y-4">
              {/* Poll Time Remaining */}
              {currentPost.pollActive && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <ApperIcon name="Clock" className="w-3 h-3" />
                  <span>{timeRemaining} remaining</span>
                </div>
              )}

              {/* Poll Status */}
              {!currentPost.pollActive && (
                <div className="text-xs text-gray-500 font-semibold">
                  Poll ended
                </div>
              )}

              {/* Show Results or Voting Interface */}
              {showResults || !currentPost.pollActive ? (
                <div className="space-y-2">
                  {currentPost.pollOptions?.map((opt, idx) => {
                    const totalVotes = getTotalVotes();
                    const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700">{opt.option}</span>
                          <span className="text-gray-600">{percentage}% ({opt.votes})</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {currentPost.pollOptions?.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePollVote(idx);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors text-left text-sm"
                      disabled={userVoted}
                    >
                      {opt.option}
                    </button>
                  ))}
                </div>
              )}

              {/* Results Button for Non-Voters */}
              {!showResults && currentPost.pollActive && !userVoted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowResults(true);
                  }}
                  className="w-full p-2 text-primary text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View Results
                </button>
              )}

              {/* End Poll Early for Creator */}
              {currentPost.pollActive && currentPost.authorUsername === 'currentUser' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEndPollEarly();
                  }}
                  className="w-full p-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  End Poll Early
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Awards Display */}
              {postAwards.length > 0 && (
                <div className="flex items-center gap-2 py-2 flex-wrap">
                  <AwardDisplay awards={postAwards} />
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <ApperIcon name="MessageSquare" className="w-4 h-4" />
                  <span>{currentPost.commentCount} comments</span>
                </div>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <ApperIcon name="Share" className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className={`flex items-center gap-1 transition-colors ${isSaved ? 'text-primary' : 'hover:text-primary'}`}
                >
                  <ApperIcon name={isSaved ? "BookmarkCheck" : "Bookmark"} className="w-4 h-4" />
                  <span>{isSaved ? "Saved" : "Save"}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHide();
                  }}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <ApperIcon name="EyeOff" className="w-4 h-4" />
                  <span>Hide</span>
                </button>
                <button
                  onClick={() => setShowAwardModal(true)}
                  className="flex items-center gap-2 hover:text-primary transition-colors group"
                  title="Give Award"
                >
                  <ApperIcon name="Gift" className="w-4 h-4" />
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Award</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Thumbnail */}
        {currentPost.thumbnailUrl && (
          <div className="flex-shrink-0">
            <img 
              src={currentPost.thumbnailUrl} 
              alt={currentPost.title}
              className="w-20 h-20 rounded-lg object-cover bg-gray-200"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
{/* Award Modal */}
      <AwardModal
        isOpen={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        onAwardGiven={handleAwardGiven}
        contentType="post"
        contentId={currentPost.Id}
/>
    </div>
  );
};

export default PostCard;