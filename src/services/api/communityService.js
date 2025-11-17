import communitiesData from "@/services/mockData/communities.json";

let communities = [...communitiesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const communityService = {
  async getAll() {
    await delay(250);
    return [...communities].sort((a, b) => b.memberCount - a.memberCount);
  },

  async getById(name) {
    await delay(200);
const community = communities.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!community) {
      throw new Error("Community not found");
    }
    
    // Add computed properties for enhanced display
    const enrichedCommunity = {
      ...community,
      onlineUsers: Math.floor(community.memberCount * (0.02 + Math.random() * 0.08)), // 2-10% online
      todayPosts: Math.floor(Math.random() * 50) + 5, // 5-55 posts today
      weeklyGrowth: Math.round((Math.random() * 20 + 1) * 10) / 10 // 0.1-20.0% growth
    };
    
    return enrichedCommunity;
  },

  async getPopular(limit = 10) {
    await delay(300);
    return [...communities]
      .sort((a, b) => b.memberCount - a.memberCount)
.slice(0, limit);
  },

  async getTrending(limit = 5) {
    await delay(350);
    
    // Enhanced trending algorithm considering multiple factors
    const enrichedCommunities = communities.map(community => {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const ageInDays = Math.max(1, (now - community.createdAt) / dayMs);
      
      // Base activity metrics
      const baseMemberCount = community.memberCount;
      const basePostActivity = Math.floor(Math.random() * 50) + 5; // Posts today
      const baseCommentActivity = Math.floor(Math.random() * 200) + 20; // Comments today
      const baseVoteActivity = Math.floor(Math.random() * 1000) + 100; // Votes today
      
      // Calculate growth velocity (simulated)
      const memberGrowthRate = Math.random() * 25 + 1; // 1-25% growth
      const newMembersToday = Math.floor((baseMemberCount * memberGrowthRate) / 100);
      
      // Activity velocity
      const postVelocity = basePostActivity / Math.max(1, ageInDays);
      const commentVelocity = baseCommentActivity / Math.max(1, ageInDays);
      const voteVelocity = baseVoteActivity / Math.max(1, ageInDays);
      
      // Engagement rate (comments per post, votes per post)
      const engagementRate = (baseCommentActivity + baseVoteActivity) / Math.max(1, basePostActivity);
      
      // Time decay factor (newer activity weighted more heavily)
      const timeDecay = Math.exp(-ageInDays / 30); // Decay over 30 days
      
      // Trending score algorithm
      const trendingScore = (
        (memberGrowthRate * 0.3) + // 30% weight on member growth
        (postVelocity * 0.25) + // 25% weight on post velocity
        (engagementRate * 0.25) + // 25% weight on engagement
        (voteVelocity * 0.1) + // 10% weight on vote velocity
        (commentVelocity * 0.1) // 10% weight on comment velocity
      ) * timeDecay; // Apply time decay
      
      return {
        ...community,
        trendingScore,
        growthPercentage: memberGrowthRate,
        newMembersToday,
        todayActivity: Math.floor(baseMemberCount * (0.01 + Math.random() * 0.05)), // 1-6% active
        postActivity: basePostActivity,
        commentActivity: baseCommentActivity,
        voteActivity: baseVoteActivity,
        engagementRate: Math.round(engagementRate * 10) / 10
      };
    });
    
    // Sort by trending score and return top results
    return enrichedCommunities
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit)
      .map(community => ({
        Id: community.Id,
        name: community.name,
        description: community.description,
        memberCount: community.memberCount,
        growthPercentage: community.growthPercentage,
        newMembersToday: community.newMembersToday,
        todayActivity: community.todayActivity,
        trendingScore: community.trendingScore,
        engagementRate: community.engagementRate
      }));
  },
  async getRules(communityName) {
    await delay(200);
    // Mock community rules
    return [
      {
        title: "Be respectful and civil",
        description: "Treat all members with respect. Personal attacks, harassment, and hate speech are not tolerated."
      },
      {
        title: "Stay on topic",
        description: "Posts should be relevant to the community's theme and purpose."
      },
      {
        title: "No spam or self-promotion",
        description: "Avoid excessive self-promotion and spam. Follow the 9:1 rule for sharing your own content."
      },
      {
        title: "Use proper formatting",
        description: "Use clear titles and proper formatting. Mark NSFW content appropriately."
      },
      {
        title: "No duplicate posts",
        description: "Search before posting to avoid duplicates. Reposts within 30 days will be removed."
      }
    ];
  },

  async getModerators(communityName) {
    await delay(200);
    // Mock moderators list
    return [
      {
        username: "alexmod",
        role: "Head Moderator",
        isActive: true
      },
      {
        username: "sarahadmin",
        role: "Moderator",
        isActive: true
      },
      {
        username: "mikejones",
        role: "Moderator",
        isActive: false
      },
      {
        username: "techguru99",
        role: "Community Manager",
        isActive: true
      }
    ];
  },

  async getRelated(communityName) {
    await delay(200);
    // Return other communities, excluding the current one
    const related = communities.filter(c => c.name.toLowerCase() !== communityName.toLowerCase());
    return related.slice(0, 5).map(c => ({
      name: c.name,
      memberCount: c.memberCount
    }));
  },

  async getStats(communityName) {
    await delay(200);
    const community = communities.find(c => c.name.toLowerCase() === communityName.toLowerCase());
    if (!community) {
      throw new Error("Community not found");
    }
return {
      totalMembers: community.memberCount,
      onlineUsers: Math.floor(community.memberCount * (0.02 + Math.random() * 0.08)),
      postsToday: Math.floor(Math.random() * 50) + 5,
      weeklyGrowth: Math.round((Math.random() * 20 + 1) * 10) / 10,
      totalPosts: community.postCount,
      avgDaily: Math.floor(community.postCount / ((Date.now() - community.createdAt) / (1000 * 60 * 60 * 24))),
      topContributors: Math.floor(community.memberCount * 0.15)
    };
  },

  // Get community rules
  getRules: async (name) => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    const community = communities.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!community) {
      throw new Error("Community not found");
    }
    
    return community.rules || [];
  },

  // Get community moderators
  getModerators: async (name) => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
    
    const community = communities.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!community) {
      throw new Error("Community not found");
    }
    
    return community.moderators || [];
  },

  async search(query) {
    await delay(200);
    const searchTerm = query.toLowerCase();
    return communities.filter(c => 
      c.name.toLowerCase().includes(searchTerm) || 
      c.description.toLowerCase().includes(searchTerm)
    );
  },

async create(communityData) {
    await delay(400);
    const newCommunity = {
      Id: communities.length + 1,
      name: communityData.name.toLowerCase(),
      description: communityData.description,
      memberCount: 1,
      postCount: 0,
      createdAt: communityData.createdAt || Date.now(),
      communityType: communityData.communityType || "Public",
      isNSFW: communityData.isNSFW || false,
      topics: communityData.topics || [],
      iconUrl: communityData.iconUrl || null,
      bannerUrl: communityData.bannerUrl || null,
      rules: communityData.rules || [],
      moderators: communityData.moderators || [],
      theme: communityData.theme || {
        primary: "#6366F1",
        secondary: "#8B5CF6",
        banner: "linear-gradient(135deg, #6366F1, #8B5CF6)",
        accent: "#4F46E5"
      },
      onlineUsers: communityData.onlineUsers || 1
    };
    
    communities.push(newCommunity);
    return { ...newCommunity };
  },

  async validateUniqueName(name) {
    await delay(200);
    const normalizedName = name.toLowerCase().trim();
    const exists = communities.some(community => 
      community.name.toLowerCase() === normalizedName
    );
    return !exists;
  },

  async update(name, data) {
    await delay(300);
    const communityIndex = communities.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    if (communityIndex === -1) {
      throw new Error("Community not found");
    }
    
    communities[communityIndex] = { ...communities[communityIndex], ...data };
    return { ...communities[communityIndex] };
  },

  async delete(name) {
    await delay(300);
    const communityIndex = communities.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    if (communityIndex === -1) {
      throw new Error("Community not found");
    }
    
    communities.splice(communityIndex, 1);
    return true;
  }
};