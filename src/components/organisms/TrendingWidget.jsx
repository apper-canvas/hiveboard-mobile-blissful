import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, isValid } from 'date-fns';
import { communityService } from '@/services/api/communityService';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
const TrendingWidget = ({ showTitle = true, maxItems = 3, compact = false }) => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadTrending = async () => {
    try {
      const trendingData = await communityService.getTrending(maxItems);
      setTrending(trendingData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load trending communities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrending();
    
    // Update hourly
    const interval = setInterval(loadTrending, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [maxItems]);

  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatGrowthPercentage = (growth) => {
    return `+${growth.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl ${compact ? 'p-4' : 'p-6'} shadow-sm border border-gray-100`}>
        <Loading />
      </div>
    );
  }

  if (trending.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl ${compact ? 'p-4' : 'p-6'} shadow-sm border border-gray-100`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-gray-900 flex items-center gap-2`}>
            <ApperIcon name="TrendingUp" className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-orange-500`} />
            Trending Today
</h2>
          <span className="text-xs text-gray-500">
            Updated {isValid(lastUpdate) 
              ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Time unavailable'}
          </span>
        </div>
      )}

      <div className={`space-y-${compact ? '3' : '4'}`}>
        {trending.map((community, index) => (
          <Link
            key={community.name}
            to={`/r/${community.name}`}
            className="block group hover:bg-gray-50 rounded-lg p-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Trending Rank */}
              <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold ${compact ? 'text-xs' : 'text-sm'}`}>
                {index + 1}
              </div>

              {/* Community Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold text-gray-900 group-hover:text-primary transition-colors ${compact ? 'text-sm' : ''}`}>
                    r/{community.name}
                  </span>
                  <div className="flex items-center gap-1 text-green-600">
                    <ApperIcon name="TrendingUp" className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {formatGrowthPercentage(community.growthPercentage)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <span>{formatMemberCount(community.memberCount)} members</span>
                  <span>•</span>
                  <span>{community.todayActivity} active now</span>
                </div>

                {!compact && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {community.description}
                  </p>
                )}
              </div>

              {/* Growth Indicator */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-green-600">
                  <ApperIcon name="ArrowUp" className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {formatGrowthPercentage(community.growthPercentage)}
                  </span>
                </div>
                {!compact && (
                  <div className="text-xs text-gray-500">
                    {community.newMembersToday} new today
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {trending.length >= 3 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link 
            to="/r/all" 
            className="text-sm text-primary hover:text-primary-dark font-medium transition-colors flex items-center gap-1"
          >
            View all trending communities
            <ApperIcon name="ArrowRight" className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default TrendingWidget;