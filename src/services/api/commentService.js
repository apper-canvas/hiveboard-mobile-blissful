import commentsData from "@/services/mockData/comments.json";

let comments = [...commentsData];
let savedComments = JSON.parse(localStorage.getItem('savedComments') || '[]');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const commentService = {
  async getByPostId(postId) {
    await delay(250);
    const postComments = comments.filter(c => c.postId === postId.toString());
    
    // Sort by timestamp (oldest first for threaded display)
    return postComments.sort((a, b) => a.timestamp - b.timestamp);
  },

  async getAll() {
    await delay(300);
    return [...comments];
  },

  async getById(id) {
    await delay(200);
    const comment = comments.find(c => c.Id === parseInt(id));
    if (!comment) {
      throw new Error("Comment not found");
    }
    return { ...comment };
  },

  async create(commentData) {
    await delay(400);
    const parentComment = commentData.parentId ? 
      comments.find(c => c.Id === parseInt(commentData.parentId)) : null;
    
const newComment = {
      Id: Math.max(...comments.map(c => c.Id)) + 1,
      postId: commentData.postId.toString(),
      content: commentData.content,
      authorUsername: commentData.authorUsername,
upvotes: 1,
      downvotes: 0,
      likes: 0,
      isLiked: false,
      timestamp: Date.now(),
      parentId: commentData.parentId || null,
      depth: parentComment ? parentComment.depth + 1 : 0,
      userVote: "up",
      awards: []
    };
    
    // Limit depth to 3 levels
    if (newComment.depth > 2) {
      newComment.depth = 2;
    }
    
    comments.push(newComment);
    return { ...newComment };
  },

async vote(id, voteType) {
    await delay(200);
    const commentIndex = comments.findIndex(c => c.Id === parseInt(id));
    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }
    
    const comment = { ...comments[commentIndex] };
    const previousVote = comment.userVote;
    
    // Remove previous vote if exists
    if (previousVote === "up") {
      comment.upvotes--;
    } else if (previousVote === "down") {
      comment.downvotes--;
    }
    
    // Apply new vote or remove if same
    if (voteType === previousVote) {
      comment.userVote = null;
    } else {
      comment.userVote = voteType;
      if (voteType === "up") {
        comment.upvotes++;
      } else if (voteType === "down") {
        comment.downvotes++;
      }
    }
    
    comments[commentIndex] = comment;
    return { ...comment };
  },

  async like(id) {
    await delay(200);
    const commentIndex = comments.findIndex(c => c.Id === parseInt(id));
    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }
    
    const comment = { ...comments[commentIndex] };
    
    // Toggle like status
    if (comment.isLiked) {
      comment.likes = Math.max(0, comment.likes - 1);
      comment.isLiked = false;
    } else {
      comment.likes = (comment.likes || 0) + 1;
      comment.isLiked = true;
    }
    
    comments[commentIndex] = comment;
    return { ...comment };
  },

  async update(id, data) {
    await delay(300);
    const commentIndex = comments.findIndex(c => c.Id === parseInt(id));
    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }
    
    comments[commentIndex] = { ...comments[commentIndex], ...data };
    return { ...comments[commentIndex] };
  },

  async delete(id) {
    await delay(300);
    const commentIndex = comments.findIndex(c => c.Id === parseInt(id));
    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }
    
    comments.splice(commentIndex, 1);
    return true;
},
  
  // Save/Unsave functionality for comments
  async saveComment(commentId) {
    await delay(200);
    if (!savedComments.includes(commentId)) {
      savedComments.push(commentId);
      localStorage.setItem('savedComments', JSON.stringify(savedComments));
    }
    return true;
  },
  
  async unsaveComment(commentId) {
    await delay(200);
    savedComments = savedComments.filter(id => id !== commentId);
    localStorage.setItem('savedComments', JSON.stringify(savedComments));
    return true;
  },
  
  // Get saved comments
  async getSavedComments() {
    await delay(300);
    const savedCommentIds = JSON.parse(localStorage.getItem('savedComments') || '[]');
    return comments.filter(comment => savedCommentIds.includes(comment.Id));
  },
  
  // Check if comment is saved
  isCommentSaved(commentId) {
    return savedComments.includes(commentId);
  }
};