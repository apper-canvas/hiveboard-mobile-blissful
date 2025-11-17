import { userService } from './userService';
import { postService } from './postService';
import { commentService } from './commentService';
import { communityService } from './communityService';

// Simulate delay for realistic API behavior
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const analyticsService = {
  // Get karma progression over time for a user
  async getKarmaOverTime(username, days = 30) {
    await delay(400);
    
    try {
      // Get user's posts and comments
      const allPosts = await postService.getAll("new", 1000, 0);
      const allComments = await commentService.getAll();
      
      const userPosts = allPosts.filter(p => p.authorUsername === username);
      const userComments = allComments.filter(c => c.authorUsername === username);
      
      // Create time-based karma data
      const now = Date.now();
      const timeRange = days * 24 * 60 * 60 * 1000;
      const startTime = now - timeRange;
      
      const karmaData = [];
      const daysInterval = Math.max(1, Math.floor(days / 20)); // Show max 20 data points
      
      for (let i = 0; i <= days; i += daysInterval) {
        const timePoint = startTime + (i * 24 * 60 * 60 * 1000);
        
        // Calculate cumulative karma up to this point
        let totalKarma = 0;
        
        // Add karma from posts created before this time
        userPosts.forEach(post => {
          if (post.timestamp <= timePoint) {
            totalKarma += (post.upvotes - post.downvotes);
          }
        });
        
        // Add karma from comments created before this time
        userComments.forEach(comment => {
          if (comment.timestamp <= timePoint) {
            totalKarma += (comment.upvotes - comment.downvotes);
          }
        });
        
        karmaData.push({
          date: new Date(timePoint).toISOString().split('T')[0],
          karma: Math.max(0, totalKarma)
        });
      }
      
      return karmaData;
    } catch (error) {
      console.error('Error getting karma over time:', error);
      return [];
    }
  },

  // Get post performance metrics
  async getPostPerformance(username, days = 30) {
    await delay(350);
    
    try {
      const allPosts = await postService.getAll("new", 1000, 0);
      const userPosts = allPosts.filter(p => p.authorUsername === username);
      
      const now = Date.now();
      const timeRange = days * 24 * 60 * 60 * 1000;
      const recentPosts = userPosts.filter(p => now - p.timestamp <= timeRange);
      
      if (recentPosts.length === 0) {
        return {
          totalPosts: 0,
          totalViews: 0,
          totalUpvotes: 0,
          totalComments: 0,
          averageEngagement: 0,
          topPerformingPosts: []
        };
      }
      
      const totalUpvotes = recentPosts.reduce((sum, post) => sum + post.upvotes, 0);
      const totalComments = recentPosts.reduce((sum, post) => sum + post.commentCount, 0);
      const totalViews = recentPosts.reduce((sum, post) => sum + (post.views || post.upvotes * 10), 0);
      
      const topPerformingPosts = recentPosts
        .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
        .slice(0, 5)
        .map(post => ({
          id: post.Id,
          title: post.title,
          upvotes: post.upvotes,
          downvotes: post.downvotes,
          comments: post.commentCount,
          community: post.communityName,
          score: post.upvotes - post.downvotes
        }));
      
      return {
        totalPosts: recentPosts.length,
        totalViews,
        totalUpvotes,
        totalComments,
        averageEngagement: recentPosts.length > 0 ? (totalUpvotes + totalComments) / recentPosts.length : 0,
        topPerformingPosts
      };
    } catch (error) {
      console.error('Error getting post performance:', error);
      return {
        totalPosts: 0,
        totalViews: 0,
        totalUpvotes: 0,
        totalComments: 0,
        averageEngagement: 0,
        topPerformingPosts: []
      };
    }
  },

  // Get comment performance metrics
  async getCommentPerformance(username, days = 30) {
    await delay(300);
    
    try {
      const allComments = await commentService.getAll();
      const userComments = allComments.filter(c => c.authorUsername === username);
      
      const now = Date.now();
      const timeRange = days * 24 * 60 * 60 * 1000;
      const recentComments = userComments.filter(c => now - c.timestamp <= timeRange);
      
      if (recentComments.length === 0) {
        return {
          totalComments: 0,
          totalUpvotes: 0,
          averageScore: 0,
          topComments: []
        };
      }
      
      const totalUpvotes = recentComments.reduce((sum, comment) => sum + comment.upvotes, 0);
      const averageScore = recentComments.reduce((sum, comment) => sum + (comment.upvotes - comment.downvotes), 0) / recentComments.length;
      
      const topComments = recentComments
        .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
        .slice(0, 5)
        .map(comment => ({
          id: comment.Id,
          content: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
          upvotes: comment.upvotes,
          downvotes: comment.downvotes,
          score: comment.upvotes - comment.downvotes,
          postId: comment.postId
        }));
      
      return {
        totalComments: recentComments.length,
        totalUpvotes,
        averageScore,
        topComments
      };
    } catch (error) {
      console.error('Error getting comment performance:', error);
      return {
        totalComments: 0,
        totalUpvotes: 0,
        averageScore: 0,
        topComments: []
      };
    }
  },

  // Get best posting times analysis
  async getBestPostingTimes(username, days = 30) {
    await delay(250);
    
    try {
      const allPosts = await postService.getAll("new", 1000, 0);
      const userPosts = allPosts.filter(p => p.authorUsername === username);
      
      const now = Date.now();
      const timeRange = days * 24 * 60 * 60 * 1000;
      const recentPosts = userPosts.filter(p => now - p.timestamp <= timeRange);
      
      // Group posts by hour of day
      const hourlyData = new Array(24).fill(0).map((_, hour) => ({
        hour,
        posts: 0,
        totalScore: 0,
        averageScore: 0
      }));
      
      recentPosts.forEach(post => {
        const postDate = new Date(post.timestamp);
        const hour = postDate.getHours();
        const score = post.upvotes - post.downvotes;
        
        hourlyData[hour].posts++;
        hourlyData[hour].totalScore += score;
      });
      
      // Calculate average scores
      hourlyData.forEach(data => {
        data.averageScore = data.posts > 0 ? data.totalScore / data.posts : 0;
      });
      
      // Group by day of week
      const weeklyData = new Array(7).fill(0).map((_, day) => ({
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
        posts: 0,
        totalScore: 0,
        averageScore: 0
      }));
      
      recentPosts.forEach(post => {
        const postDate = new Date(post.timestamp);
        const day = postDate.getDay();
        const score = post.upvotes - post.downvotes;
        
        weeklyData[day].posts++;
        weeklyData[day].totalScore += score;
      });
      
      weeklyData.forEach(data => {
        data.averageScore = data.posts > 0 ? data.totalScore / data.posts : 0;
      });
      
      return {
        hourlyData,
        weeklyData,
        bestHour: hourlyData.reduce((best, current) => 
          current.averageScore > best.averageScore ? current : best
        ),
        bestDay: weeklyData.reduce((best, current) => 
          current.averageScore > best.averageScore ? current : best
        )
      };
    } catch (error) {
      console.error('Error getting posting times:', error);
      return {
        hourlyData: [],
        weeklyData: [],
        bestHour: { hour: 12, averageScore: 0 },
        bestDay: { day: 'Monday', averageScore: 0 }
      };
    }
  },

  // Get top subreddits/communities performance
  async getTopSubreddits(username, days = 30) {
    await delay(300);
    
    try {
      const allPosts = await postService.getAll("new", 1000, 0);
      const userPosts = allPosts.filter(p => p.authorUsername === username);
      
      const now = Date.now();
      const timeRange = days * 24 * 60 * 60 * 1000;
      const recentPosts = userPosts.filter(p => now - p.timestamp <= timeRange);
      
      // Group by community
      const communityData = {};
      
      recentPosts.forEach(post => {
        const community = post.communityName;
        if (!communityData[community]) {
          communityData[community] = {
            name: community,
            posts: 0,
            totalScore: 0,
            totalUpvotes: 0,
            totalComments: 0,
            averageScore: 0
          };
        }
        
        communityData[community].posts++;
        communityData[community].totalScore += (post.upvotes - post.downvotes);
        communityData[community].totalUpvotes += post.upvotes;
        communityData[community].totalComments += post.commentCount;
      });
      
      // Calculate averages and sort
      const sortedCommunities = Object.values(communityData)
        .map(community => ({
          ...community,
          averageScore: community.posts > 0 ? community.totalScore / community.posts : 0
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 10);
      
      return sortedCommunities;
    } catch (error) {
      console.error('Error getting top subreddits:', error);
      return [];
    }
  },

  // Get engagement rate over time
  async getEngagementRate(username, days = 30) {
    await delay(400);
    
    try {
      const allPosts = await postService.getAll("new", 1000, 0);
      const userPosts = allPosts.filter(p => p.authorUsername === username);
      
      const now = Date.now();
      const timeRange = days * 24 * 60 * 60 * 1000;
      const startTime = now - timeRange;
      
      const engagementData = [];
      const daysInterval = Math.max(1, Math.floor(days / 15)); // Show max 15 data points
      
      for (let i = 0; i <= days; i += daysInterval) {
        const periodStart = startTime + (i * 24 * 60 * 60 * 1000);
        const periodEnd = periodStart + (daysInterval * 24 * 60 * 60 * 1000);
        
        const periodPosts = userPosts.filter(p => 
          p.timestamp >= periodStart && p.timestamp < periodEnd
        );
        
        if (periodPosts.length > 0) {
          const totalEngagement = periodPosts.reduce((sum, post) => 
            sum + post.upvotes + post.commentCount, 0
          );
          const totalViews = periodPosts.reduce((sum, post) => 
            sum + (post.views || post.upvotes * 10), 0
          );
          
          const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
          
          engagementData.push({
            date: new Date(periodStart).toISOString().split('T')[0],
            rate: Math.min(100, Math.max(0, engagementRate)),
            posts: periodPosts.length
          });
        }
      }
      
      return engagementData;
    } catch (error) {
      console.error('Error getting engagement rate:', error);
      return [];
    }
  },

  // Get follower growth simulation (based on karma growth)
  async getFollowerGrowth(username, days = 30) {
    await delay(300);
    
    try {
      const karmaData = await this.getKarmaOverTime(username, days);
      
      // Simulate follower count based on karma (roughly 1 follower per 10 karma)
      const followerData = karmaData.map(item => ({
        date: item.date,
        followers: Math.floor(item.karma / 10) + Math.floor(Math.random() * 5) // Add some variance
      }));
      
      return followerData;
    } catch (error) {
      console.error('Error getting follower growth:', error);
      return [];
    }
  },

  // Get overall analytics summary
  async getAnalyticsSummary(username, days = 30) {
    await delay(500);
    
    try {
      const [postPerf, commentPerf, engagement, communities] = await Promise.all([
        this.getPostPerformance(username, days),
        this.getCommentPerformance(username, days),
        this.getEngagementRate(username, days),
        this.getTopSubreddits(username, days)
      ]);
      
      const currentUser = await userService.getCurrentUser();
      const avgEngagement = engagement.length > 0 ? 
        engagement.reduce((sum, item) => sum + item.rate, 0) / engagement.length : 0;
      
      return {
        totalKarma: currentUser.karma,
        totalPosts: postPerf.totalPosts,
        totalComments: commentPerf.totalComments,
        averageEngagementRate: avgEngagement,
        topCommunity: communities.length > 0 ? communities[0].name : 'N/A',
        accountAge: Math.floor((Date.now() - currentUser.joinedAt) / (24 * 60 * 60 * 1000))
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return {
        totalKarma: 0,
        totalPosts: 0,
        totalComments: 0,
        averageEngagementRate: 0,
        topCommunity: 'N/A',
        accountAge: 0
      };
    }
  }
};