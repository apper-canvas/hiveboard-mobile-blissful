import { useState, useEffect } from "react";
import CommentThread from "@/components/organisms/CommentThread";
import CommentForm from "@/components/molecules/CommentForm";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { commentService } from "@/services/api/commentService";
import { cn } from "@/utils/cn";

const CommentSection = ({ postId, className, onCommentCountChange }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComments = async () => {
    try {
      setLoading(true);
      setError("");
      const commentsData = await commentService.getByPostId(postId);
      setComments(commentsData);
    } catch (err) {
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  // Update parent with comment count whenever comments change
  useEffect(() => {
    if (onCommentCountChange) {
      onCommentCountChange(comments.length);
    }
  }, [comments.length, onCommentCountChange]);

const handleCommentAdded = (newComment) => {
    setComments(prev => {
      // Add the new comment/reply to the list
      const updated = [...prev, newComment];
      // Update parent with new count
      if (onCommentCountChange) {
        onCommentCountChange(updated.length);
      }
      return updated;
    });
  };

  const handleCommentVoted = (commentId, updatedComment) => {
    setComments(prev => 
      prev.map(comment => 
        comment.Id === commentId ? updatedComment : comment
      )
    );
  };

  const handleRetry = () => {
    loadComments();
  };

  // Group comments by thread
  const groupCommentsByThread = (comments) => {
    const commentMap = {};
    const rootComments = [];

    // Create a map of all comments
    comments.forEach(comment => {
      commentMap[comment.Id] = { ...comment, children: [] };
    });

    // Build the tree structure
    comments.forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].children.push(commentMap[comment.Id]);
      } else {
        rootComments.push(commentMap[comment.Id]);
      }
    });

    return rootComments;
  };

  if (loading) {
    return <Loading variant="comments" className={className} />;
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

  const threadedComments = groupCommentsByThread(comments);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Comment Form */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <CommentForm 
          postId={postId}
          onCommentAdded={handleCommentAdded}
        />
      </div>

      {/* Comments Header */}
      <div className="flex items-center justify-between">
<h3 className="text-lg font-bold text-gray-900">
          {comments.length} Comments
        </h3>
      </div>

      {/* Comments */}
      {threadedComments.length === 0 ? (
        <Empty
          title="No comments yet"
          message="Be the first to share your thoughts on this post!"
          actionText="Add Comment"
          icon="MessageSquare"
        />
      ) : (
        <div className="space-y-4">
          {threadedComments.map((comment) => (
            <CommentThread
              key={comment.Id}
              comment={comment}
              onCommentAdded={handleCommentAdded}
              onCommentVoted={handleCommentVoted}
            />
          ))}
</div>
      )}
    </div>
  );
};
export default CommentSection;