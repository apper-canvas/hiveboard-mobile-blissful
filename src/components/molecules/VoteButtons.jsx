import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const VoteButtons = ({ 
  upvotes = 0, 
  downvotes = 0, 
  userVote = null, 
  onVote,
  className,
  size = "md",
  mode = "vote", // "vote" or "like"
  likes = 0,
  isLiked = false,
  onLike
}) => {
  const [isLoading, setIsLoading] = useState(false);

const handleVote = async (voteType) => {
    if (isLoading || !onVote) return;
    
    setIsLoading(true);
    try {
      await onVote(voteType);
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLoading || !onLike) return;
    
    setIsLoading(true);
    try {
      await onLike();
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const score = upvotes - downvotes;
  const sizes = {
    sm: { arrow: "w-4 h-4", text: "text-xs", gap: "gap-1" },
    md: { arrow: "w-5 h-5", text: "text-sm", gap: "gap-1" },
    lg: { arrow: "w-6 h-6", text: "text-base", gap: "gap-2" }
  };

if (mode === "like") {
    return (
      <div className={cn("flex items-center", sizes[size].gap, className)}>
        <button
          onClick={handleLike}
          disabled={isLoading}
          className={cn(
            "vote-arrow p-1 rounded-md transition-all duration-150 hover:bg-red-50 disabled:opacity-50 flex items-center gap-1",
            isLiked ? "text-red-500 bg-red-50 active" : "text-gray-400 hover:text-red-500"
          )}
        >
          <ApperIcon 
            name={isLiked ? "Heart" : "Heart"} 
            className={cn(sizes[size].arrow, isLiked && "fill-current")}
          />
          <span className={cn(
            "font-medium tabular-nums",
            sizes[size].text,
            isLiked ? "text-red-500" : "text-gray-600"
          )}>
            {likes > 999 ? `${Math.floor(likes / 1000)}k` : likes}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", sizes[size].gap, className)}>
      <button
        onClick={() => handleVote("up")}
        disabled={isLoading}
        className={cn(
"vote-arrow p-1 rounded-md transition-all duration-150 hover:bg-indigo-50 disabled:opacity-50",
          userVote === "up" ? "text-primary bg-indigo-50 active" : "text-gray-400 hover:text-primary"
        )}
      >
        <ApperIcon 
          name="ChevronUp" 
          className={sizes[size].arrow}
        />
      </button>
      
      <span className={cn(
        "font-bold tabular-nums min-w-[2rem] text-center",
        sizes[size].text,
        score > 0 ? "text-primary" : score < 0 ? "text-secondary" : "text-gray-600"
      )}>
        {score > 999 ? `${Math.floor(score / 1000)}k` : score}
      </span>
      
      <button
        onClick={() => handleVote("down")}
        disabled={isLoading}
        className={cn(
          "vote-arrow p-1 rounded-md transition-all duration-150 hover:bg-blue-50 disabled:opacity-50",
          userVote === "down" ? "text-secondary bg-blue-50 active" : "text-gray-400 hover:text-secondary"
        )}
      >
        <ApperIcon 
          name="ChevronDown" 
          className={sizes[size].arrow}
        />
      </button>
    </div>
  );
};

export default VoteButtons;