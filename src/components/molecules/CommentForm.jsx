import { useState } from "react";
import Button from "@/components/atoms/Button";
import Textarea from "@/components/atoms/Textarea";
import FormField from "@/components/molecules/FormField";
import { commentService } from "@/services/api/commentService";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";

const CommentForm = ({ 
  postId, 
  parentId = null,
  onCommentAdded,
  placeholder = "What are your thoughts?",
  compact = false,
  className
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (content.length > 1000) {
      setError("Comment is too long (max 1000 characters)");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const newComment = await commentService.create({
        postId: postId,
        parentId: parentId,
        content: content.trim(),
        authorUsername: "current_user" // In a real app, this would come from auth
      });
      
      onCommentAdded(newComment);
      setContent("");
      toast.success("Comment added!");
    } catch (err) {
      setError(err.message || "Failed to add comment");
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <FormField error={error}>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={compact ? 3 : 4}
          error={!!error}
        />
      </FormField>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {content.length}/1000 characters
        </div>
        
        <div className="flex items-center gap-2">
          {parentId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setContent("")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            size={compact ? "sm" : "md"}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Posting..." : parentId ? "Reply" : "Comment"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;