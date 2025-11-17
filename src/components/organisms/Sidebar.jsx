import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { communityService } from "@/services/api/communityService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Saved from "@/components/pages/Saved";
import Hidden from "@/components/pages/Hidden";
import Home from "@/components/pages/Home";
import Community from "@/components/pages/Community";
import TrendingWidget from "@/components/organisms/TrendingWidget";
const Sidebar = ({ communityName = null, className }) => {
  const [communities, setCommunities] = useState([]);
  const [community, setCommunity] = useState(null);
  const [communityRules, setCommunityRules] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [relatedCommunities, setRelatedCommunities] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
const loadPopularCommunities = async () => {
    try {
      const popularCommunities = await communityService.getPopular(10);
      setCommunities(popularCommunities);
    } catch (error) {
      console.error("Failed to load communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommunityData = async (name) => {
    try {
      setLoading(true);
      const [communityData, rules, mods, related, stats] = await Promise.all([
        communityService.getById(name),
        communityService.getRules(name),
        communityService.getModerators(name),
        communityService.getRelated(name),
        communityService.getStats(name)
      ]);
      
      setCommunity(communityData);
      setCommunityRules(rules);
      setModerators(mods);
      setRelatedCommunities(related);
      setCommunityStats(stats);
    } catch (error) {
      console.error("Failed to load community data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (communityName) {
      loadCommunityData(communityName);
    } else {
      loadPopularCommunities();
    }
  }, [communityName]);

  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k";
    }
    return count.toString();
  };

if (communityName) {
    // Community-specific sidebar
    return (
      <aside className={cn("w-80 flex-shrink-0", className)}>
        <div className="sticky top-20 space-y-6">
          {loading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="h-6 bg-gray-200 rounded mb-4 skeleton-shimmer"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded skeleton-shimmer"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 skeleton-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Community Stats */}
              <div className="bg-gradient-to-br from-primary to-orange-500 rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ApperIcon name="BarChart" className="w-5 h-5" />
                  Community Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-100">Total Members</span>
                    <span className="font-bold">{formatMemberCount(communityStats?.totalMembers || community?.memberCount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-100">Online Now</span>
                    <span className="font-bold">{communityStats?.onlineUsers || Math.floor((community?.memberCount || 0) * 0.03)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-100">Posts Today</span>
                    <span className="font-bold">{communityStats?.postsToday || 12}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-100">Growth This Week</span>
                    <span className="font-bold">+{communityStats?.weeklyGrowth || 5.2}%</span>
                  </div>
                </div>
              </div>

              {/* Community Rules */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="Shield" className="w-5 h-5 text-primary" />
                  Community Rules
                </h3>
                
                <div className="space-y-3">
                  {communityRules.map((rule, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{rule.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{rule.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Moderators */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="Crown" className="w-5 h-5 text-accent" />
                  Moderators
                </h3>
                
                <div className="space-y-3">
                  {moderators.map((mod, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-green-600 flex items-center justify-center text-white font-bold text-sm">
                        {mod.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">u/{mod.username}</div>
                        <div className="text-xs text-gray-600">{mod.role}</div>
                      </div>
                      {mod.isActive && (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Communities */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="GitBranch" className="w-5 h-5 text-secondary" />
                  Related Communities
                </h3>
                
                <div className="space-y-2">
                  {relatedCommunities.map((relatedCommunity, index) => (
                    <Link
                      key={index}
                      to={`/r/${relatedCommunity.name}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {relatedCommunity.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          r/{relatedCommunity.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatMemberCount(relatedCommunity.memberCount)} members
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    );
  }

  // Default homepage sidebar
  return (
    <aside className={cn("w-80 flex-shrink-0", className)}>
      <div className="sticky top-20 space-y-6">
        {/* Popular Communities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ApperIcon name="TrendingUp" className="w-5 h-5 text-primary" />
            Popular Communities
          </h3>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full skeleton-shimmer"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-1 skeleton-shimmer"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 skeleton-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {communities.slice(0, 8).map((community, index) => (
                <Link
                  key={community.name}
                  to={`/r/${community.name}`}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors",
                    location.pathname === `/r/${community.name}` && "bg-primary bg-opacity-10 text-primary"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      r/{community.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatMemberCount(community.memberCount)} members
                    </div>
                  </div>
                </Link>
))}
            </div>
          )}
        </div>

        {/* Trending Today */}
        <TrendingWidget showTitle={true} maxItems={5} compact={true} />

        {/* Additional Sidebar Content */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ApperIcon name="Zap" className="w-5 h-5 text-accent" />
            Quick Actions
          </h3>
          
<div className="space-y-2">
<Link
              to="/create-community"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                <ApperIcon name="Plus" className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium group-hover:text-primary transition-colors">
                Create Community
              </span>
            </Link>
            
            <Link
              to="/messages"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <ApperIcon name="MessageSquare" className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium group-hover:text-primary transition-colors">
                Messages
              </span>
            </Link>
            
            <Link
              to="/saved"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-green-600 flex items-center justify-center">
                <ApperIcon name="Bookmark" className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium group-hover:text-primary transition-colors">
                Saved Posts
              </span>
            </Link>
            
            <Link
              to="/hidden"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                <ApperIcon name="EyeOff" className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium group-hover:text-primary transition-colors">
                Hidden Posts
              </span>
            </Link>
            
            <Link
              to="/communities"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-blue-600 flex items-center justify-center">
                <ApperIcon name="Search" className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium group-hover:text-primary transition-colors">
                Browse Communities
              </span>
            </Link>
            
            <Link
              to="/preferences"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <ApperIcon name="Settings" className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium group-hover:text-primary transition-colors">
                Notification Preferences
              </span>
            </Link>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-gradient-to-br from-primary to-orange-500 rounded-xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ApperIcon name="BarChart" className="w-5 h-5" />
            HiveBoard Today
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-orange-100">Active Users</span>
              <span className="font-bold">24.7k</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-100">New Posts</span>
              <span className="font-bold">1,284</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-100">New Comments</span>
              <span className="font-bold">8,926</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-100">Communities</span>
              <span className="font-bold">50k+</span>
            </div>
          </div>
        </div>
</div>
    </aside>
  );
};

export default Sidebar;