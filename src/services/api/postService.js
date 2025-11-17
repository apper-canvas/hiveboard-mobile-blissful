import postsData from "@/services/mockData/posts.json";

let posts = [...postsData];
let savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
let hiddenPosts = JSON.parse(localStorage.getItem('hiddenPosts') || '[]');
let pollVotes = JSON.parse(localStorage.getItem('pollVotes') || '{}');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const postService = {
async getAll(filter = "hot", limit = 10, offset = 0, postType = "all") {
    await delay(300);
    
    let filteredPosts = [...posts];
    
    // Filter out hidden posts
    filteredPosts = filteredPosts.filter(post => !hiddenPosts.includes(post.Id));
    
    // Apply type filtering
    if (postType !== "all") {
      filteredPosts = filteredPosts.filter(post => {
        switch (postType) {
          case "images":
            return post.type === "image" || post.content?.includes("imgur") || post.content?.includes(".jpg") || post.content?.includes(".png");
          case "videos":
            return post.type === "video" || post.content?.includes("youtube") || post.content?.includes(".mp4");
          case "discussions":
            return post.type === "text" || (!post.content?.includes("http") && post.content?.length > 100);
          case "links":
            return post.type === "link" || (post.content?.includes("http") && !post.content?.includes("imgur") && !post.content?.includes("youtube"));
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    let sortedPosts = this.applySorting(filteredPosts, filter);
    
    // Separate pinned posts
    const pinnedPosts = sortedPosts.filter(post => post.isPinned);
    const regularPosts = sortedPosts.filter(post => !post.isPinned);
    
    // Combine with pinned posts first
    const finalPosts = [...pinnedPosts, ...regularPosts];
    
    return finalPosts.slice(offset, offset + limit);
  },

  async getById(id) {
    await delay(200);
    const post = posts.find(p => p.Id === parseInt(id));
    if (!post) {
      throw new Error("Post not found");
    }
    return { ...post };
  },

async getByCommunity(communityName, filter = "hot", limit = 10, offset = 0, postType = "all") {
    await delay(300);
    let communityPosts = posts.filter(p => p.communityName.toLowerCase() === communityName.toLowerCase());
    
    // Filter out hidden posts
    communityPosts = communityPosts.filter(post => !hiddenPosts.includes(post.Id));
    
    // Apply type filtering
    if (postType !== "all") {
      communityPosts = communityPosts.filter(post => {
        switch (postType) {
          case "images":
            return post.type === "image" || post.content?.includes("imgur") || post.content?.includes(".jpg") || post.content?.includes(".png");
          case "videos":
            return post.type === "video" || post.content?.includes("youtube") || post.content?.includes(".mp4");
          case "discussions":
            return post.type === "text" || (!post.content?.includes("http") && post.content?.length > 100);
          case "links":
            return post.type === "link" || (post.content?.includes("http") && !post.content?.includes("imgur") && !post.content?.includes("youtube"));
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    let sortedPosts = this.applySorting(communityPosts, filter);
    
    // Separate pinned posts
    const pinnedPosts = sortedPosts.filter(post => post.isPinned);
    const regularPosts = sortedPosts.filter(post => !post.isPinned);
    
    // Combine with pinned posts first
    const finalPosts = [...pinnedPosts, ...regularPosts];
    
    return finalPosts.slice(offset, offset + limit);
  },

  applySorting(postsArray, filter) {
    let sortedPosts = [...postsArray];
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    switch (filter) {
      case "hot":
        sortedPosts.sort((a, b) => {
          const aScore = a.upvotes - a.downvotes + (a.commentCount * 0.5);
          const bScore = b.upvotes - b.downvotes + (b.commentCount * 0.5);
          return bScore - aScore;
        });
        break;
      case "new":
        sortedPosts.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case "topAllTime":
        sortedPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case "topWeek":
        sortedPosts = sortedPosts.filter(post => post.timestamp >= weekAgo);
        sortedPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case "controversial":
        sortedPosts.sort((a, b) => {
          const aRatio = a.upvotes / Math.max(a.downvotes, 1);
          const bRatio = b.upvotes / Math.max(b.downvotes, 1);
          const aControversy = Math.min(a.upvotes, a.downvotes);
          const bControversy = Math.min(b.upvotes, b.downvotes);
          return (bControversy - aControversy) || (Math.abs(1 - aRatio) - Math.abs(1 - bRatio));
        });
        break;
      case "rising":
        sortedPosts = sortedPosts.filter(post => now - post.timestamp < 24 * 60 * 60 * 1000);
        sortedPosts.sort((a, b) => {
          const aRise = (a.upvotes - a.downvotes) / Math.max((now - a.timestamp) / (60 * 60 * 1000), 1);
          const bRise = (b.upvotes - b.downvotes) / Math.max((now - b.timestamp) / (60 * 60 * 1000), 1);
          return bRise - aRise;
        });
        break;
    }
    
    return sortedPosts;
  },
async create(postData) {
    await delay(400);
    const newPost = {
      Id: Math.max(...posts.map(p => p.Id)) + 1,
      title: postData.title,
      content: postData.content,
      contentType: postData.contentType || "text",
      thumbnailUrl: postData.thumbnailUrl || null,
      authorUsername: postData.authorUsername,
      communityName: postData.communityName,
      flair: postData.flair || null,
      isNSFW: postData.isNSFW || false,
      isSpoiler: postData.isSpoiler || false,
      isOC: postData.isOC || false,
upvotes: 1,
      downvotes: 0,
      likes: 0,
      isLiked: false,
      commentCount: 0,
      timestamp: Date.now(),
      userVote: "up",
      pollDuration: postData.pollDuration || null,
      pollOptions: postData.pollOptions || null,
      pollEndTime: postData.pollDuration ? Date.now() + (postData.pollDuration * 24 * 60 * 60 * 1000) : null,
      pollActive: postData.pollDuration ? true : false,
      awards: []
    };
    
    posts.unshift(newPost);
    if (newPost.contentType === 'poll') {
      pollVotes[newPost.Id] = { voters: [], votes: {} };
      localStorage.setItem('pollVotes', JSON.stringify(pollVotes));
    }
    return { ...newPost };
  },

async vote(id, voteType) {
    await delay(200);
    const postIndex = posts.findIndex(p => p.Id === parseInt(id));
    if (postIndex === -1) {
      throw new Error("Post not found");
    }
    
    const post = { ...posts[postIndex] };
    const previousVote = post.userVote;
    
    // Remove previous vote if exists
    if (previousVote === "up") {
      post.upvotes--;
    } else if (previousVote === "down") {
      post.downvotes--;
    }
    
    // Apply new vote or remove if same
    if (voteType === previousVote) {
      post.userVote = null;
    } else {
      post.userVote = voteType;
      if (voteType === "up") {
        post.upvotes++;
      } else if (voteType === "down") {
        post.downvotes++;
      }
    }
    
    posts[postIndex] = post;
    return { ...post };
  },

  async votePoll(id, optionIndex) {
    await delay(200);
    const postIndex = posts.findIndex(p => p.Id === parseInt(id));
    if (postIndex === -1) {
      throw new Error("Post not found");
    }

    const post = { ...posts[postIndex] };
    if (!post.pollActive) {
      throw new Error("This poll has ended");
    }

    if (this.checkUserVoted(parseInt(id))) {
      throw new Error("You've already voted in this poll");
    }

    if (!post.pollOptions || !post.pollOptions[optionIndex]) {
      throw new Error("Invalid poll option");
    }

    post.pollOptions[optionIndex].votes = (post.pollOptions[optionIndex].votes || 0) + 1;
    post.pollOptions[optionIndex].voters = post.pollOptions[optionIndex].voters || [];
    post.pollOptions[optionIndex].voters.push('currentUser');

    posts[postIndex] = post;
    
    pollVotes[parseInt(id)] = pollVotes[parseInt(id)] || { voters: [] };
    pollVotes[parseInt(id)].voters.push('currentUser');
    localStorage.setItem('pollVotes', JSON.stringify(pollVotes));

    return { ...post };
  },

  checkUserVoted(postId) {
    const voted = pollVotes[postId]?.voters || [];
    return voted.includes('currentUser');
  },

  getTimeRemaining(pollEndTime) {
    if (!pollEndTime) return '';
    
    const now = Date.now();
    const remaining = pollEndTime - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },

  async endPollEarly(id) {
    await delay(200);
    const postIndex = posts.findIndex(p => p.Id === parseInt(id));
    if (postIndex === -1) {
      throw new Error("Post not found");
    }

    const post = { ...posts[postIndex] };
    post.pollActive = false;
    posts[postIndex] = post;
    return { ...post };
  },

  async like(id) {
    await delay(200);
    const postIndex = posts.findIndex(p => p.Id === parseInt(id));
    if (postIndex === -1) {
      throw new Error("Post not found");
    }
    
    const post = { ...posts[postIndex] };
    
    // Toggle like status
    if (post.isLiked) {
      post.likes = Math.max(0, post.likes - 1);
      post.isLiked = false;
    } else {
      post.likes = (post.likes || 0) + 1;
      post.isLiked = true;
    }
    
    posts[postIndex] = post;
    return { ...post };
  },

async update(id, data) {
    await delay(300);
    const postIndex = posts.findIndex(p => p.Id === parseInt(id));
    if (postIndex === -1) {
      throw new Error("Post not found");
    }
    
    posts[postIndex] = { ...posts[postIndex], ...data };
    return { ...posts[postIndex] };
  },

  async delete(id) {
    await delay(300);
    const postIndex = posts.findIndex(p => p.Id === parseInt(id));
    if (postIndex === -1) {
      throw new Error("Post not found");
    }
    
    posts.splice(postIndex, 1);
    return true;
},
  
  // Save/Unsave functionality
  async savePost(postId) {
    await delay(200);
    if (!savedPosts.includes(postId)) {
      savedPosts.push(postId);
      localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
    }
    return true;
  },
  
  async unsavePost(postId) {
    await delay(200);
    savedPosts = savedPosts.filter(id => id !== postId);
    localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
    return true;
  },
  
  // Hide/Unhide functionality
  async hidePost(postId) {
    await delay(200);
    if (!hiddenPosts.includes(postId)) {
      hiddenPosts.push(postId);
      localStorage.setItem('hiddenPosts', JSON.stringify(hiddenPosts));
    }
    return true;
  },
  
  async unhidePost(postId) {
    await delay(200);
    hiddenPosts = hiddenPosts.filter(id => id !== postId);
    localStorage.setItem('hiddenPosts', JSON.stringify(hiddenPosts));
    return true;
  },
  
  // Get saved posts
  async getSavedPosts() {
    await delay(300);
    const savedPostIds = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    return posts.filter(post => savedPostIds.includes(post.Id));
  },
  
  // Get hidden posts
  async getHiddenPosts() {
    await delay(300);
    const hiddenPostIds = JSON.parse(localStorage.getItem('hiddenPosts') || '[]');
    return posts.filter(post => hiddenPostIds.includes(post.Id));
  },
  
  // Check if post is saved
  isPostSaved(postId) {
    return savedPosts.includes(postId);
  },
  
  // Check if post is hidden
  isPostHidden(postId) {
    return hiddenPosts.includes(postId);
  }
};