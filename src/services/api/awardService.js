import { deepClone } from "@/utils/deepClone";
import awards from "@/services/mockData/awards.json";

let awardData = deepClone(awards);
let postAwardData = [];
let commentAwardData = [];

export const awardService = {
// Get all award types
  getAllAwards() {
    return deepClone(awardData);
  },

// Get specific award
  getAward(id) {
    if (!Number.isInteger(id)) return null;
    return deepClone(awardData.find(award => award.Id === id)) || null;
  },

  // Get awards for a post
  getPostAwards(postId) {
    if (!Number.isInteger(postId)) return [];
    const postSpecificAwards = postAwardData.filter(award => award.postId === postId);
    return postSpecificAwards.map(award => ({
      ...award,
      awardType: awardData.find(a => a.Id === award.awardId)
    }));
  },

  // Get awards for a comment
  getCommentAwards(commentId) {
    if (!Number.isInteger(commentId)) return [];
    const commentSpecificAwards = commentAwardData.filter(award => award.commentId === commentId);
    return commentSpecificAwards.map(award => ({
      ...award,
      awardType: awardData.find(a => a.Id === award.awardId)
    }));
  },

  // Award a post
  awardPost(postId, awardId, givenBy = 'current_user') {
    if (!Number.isInteger(postId) || !Number.isInteger(awardId)) return null;
    
    const award = awardData.find(a => a.Id === awardId);
    if (!award) return null;

    const newAward = {
      Id: postAwardData.length > 0 ? Math.max(...postAwardData.map(a => a.Id)) + 1 : 1,
      postId,
      awardId,
      givenBy,
timestamp: Date.now()
    };
    postAwardData.push(newAward);
    return deepClone(newAward);
  },

  // Award a comment
  awardComment(commentId, awardId, givenBy = 'current_user') {
    if (!Number.isInteger(commentId) || !Number.isInteger(awardId)) return null;
    
    const award = awardData.find(a => a.Id === awardId);
    if (!award) return null;

    const newAward = {
      Id: commentAwardData.length > 0 ? Math.max(...commentAwardData.map(a => a.Id)) + 1 : 1,
      commentId,
      awardId,
      givenBy,
timestamp: Date.now()
    };
    commentAwardData.push(newAward);
    return deepClone(newAward);
  },

  // Get award count by type for post
  getPostAwardCount(postId, awardId) {
    if (!Number.isInteger(postId) || !Number.isInteger(awardId)) return 0;
    return postAwardData.filter(a => a.postId === postId && a.awardId === awardId).length;
  },

  // Get award count by type for comment
  getCommentAwardCount(commentId, awardId) {
    if (!Number.isInteger(commentId) || !Number.isInteger(awardId)) return 0;
    return commentAwardData.filter(a => a.commentId === commentId && a.awardId === awardId).length;
  },

  // Remove award (optional - for moderation)
  removePostAward(awardInstanceId) {
    if (!Number.isInteger(awardInstanceId)) return false;
    const index = postAwardData.findIndex(a => a.Id === awardInstanceId);
    if (index > -1) {
      postAwardData.splice(index, 1);
      return true;
    }
    return false;
  },

  removeCommentAward(awardInstanceId) {
    if (!Number.isInteger(awardInstanceId)) return false;
    const index = commentAwardData.findIndex(a => a.Id === awardInstanceId);
    if (index > -1) {
      commentAwardData.splice(index, 1);
      return true;
    }
    return false;
  }
};