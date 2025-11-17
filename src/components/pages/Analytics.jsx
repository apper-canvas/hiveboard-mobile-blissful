import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Chart from 'react-apexcharts';
import { analyticsService } from '@/services/api/analyticsService';
import { userService } from '@/services/api/userService';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Analytics data states
  const [karmaData, setKarmaData] = useState([]);
  const [postPerformance, setPostPerformance] = useState(null);
  const [commentPerformance, setCommentPerformance] = useState(null);
  const [bestTimes, setBestTimes] = useState(null);
  const [topSubreddits, setTopSubreddits] = useState([]);
  const [engagementRate, setEngagementRate] = useState([]);
  const [followerGrowth, setFollowerGrowth] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user first
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      // Load all analytics data in parallel
      const [
        karmaOverTime,
        postPerf,
        commentPerf,
        postingTimes,
        communities,
        engagement,
        followers,
        analyticsSummary
      ] = await Promise.all([
        analyticsService.getKarmaOverTime(user.username, timeRange),
        analyticsService.getPostPerformance(user.username, timeRange),
        analyticsService.getCommentPerformance(user.username, timeRange),
        analyticsService.getBestPostingTimes(user.username, timeRange),
        analyticsService.getTopSubreddits(user.username, timeRange),
        analyticsService.getEngagementRate(user.username, timeRange),
        analyticsService.getFollowerGrowth(user.username, timeRange),
        analyticsService.getAnalyticsSummary(user.username, timeRange)
      ]);

      setKarmaData(karmaOverTime);
      setPostPerformance(postPerf);
      setCommentPerformance(commentPerf);
      setBestTimes(postingTimes);
      setTopSubreddits(communities);
      setEngagementRate(engagement);
      setFollowerGrowth(followers);
      setSummary(analyticsSummary);
      
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadAnalytics();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={handleRetry} />;

  // Chart configurations
  const karmaChartOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#6366F1'],
    xaxis: {
      categories: karmaData.map(item => new Date(item.date).toLocaleDateString()),
      title: { text: 'Date' }
    },
    yaxis: {
      title: { text: 'Karma' }
    },
    grid: {
      borderColor: '#E5E7EB'
    },
    tooltip: {
      x: { format: 'dd MMM yyyy' }
    }
  };

  const karmaChartSeries = [{
    name: 'Karma',
    data: karmaData.map(item => item.karma)
  }];

  const engagementChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      }
    },
    colors: ['#10B981'],
    xaxis: {
      categories: engagementRate.map(item => new Date(item.date).toLocaleDateString()),
      title: { text: 'Date' }
    },
    yaxis: {
      title: { text: 'Engagement Rate (%)' },
      max: 100
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: '#E5E7EB'
    }
  };

  const engagementChartSeries = [{
    name: 'Engagement Rate',
    data: engagementRate.map(item => Math.round(item.rate * 100) / 100)
  }];

  const bestHoursChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    },
    colors: ['#8B5CF6'],
    xaxis: {
      categories: bestTimes?.hourlyData.map(item => `${item.hour}:00`) || [],
      title: { text: 'Hour of Day' }
    },
    yaxis: {
      title: { text: 'Average Score' }
    },
    grid: {
      borderColor: '#E5E7EB'
    },
    dataLabels: { enabled: false }
  };

  const bestHoursChartSeries = [{
    name: 'Average Score',
    data: bestTimes?.hourlyData.map(item => Math.round(item.averageScore * 100) / 100) || []
  }];

  const followerGrowthOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    colors: ['#F59E0B'],
    xaxis: {
      categories: followerGrowth.map(item => new Date(item.date).toLocaleDateString()),
      title: { text: 'Date' }
    },
    yaxis: {
      title: { text: 'Followers' }
    },
    grid: {
      borderColor: '#E5E7EB'
    }
  };

  const followerGrowthSeries = [{
    name: 'Followers',
    data: followerGrowth.map(item => item.followers)
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your performance and engagement metrics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            
            <Button
              onClick={loadAnalytics}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <ApperIcon name="RefreshCw" size={16} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Karma</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalKarma.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ApperIcon name="TrendingUp" size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Posts ({timeRange}d)</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalPosts}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ApperIcon name="FileText" size={24} className="text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Comments ({timeRange}d)</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalComments}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <ApperIcon name="MessageSquare" size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.averageEngagementRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <ApperIcon name="Activity" size={24} className="text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Karma Over Time */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <ApperIcon name="TrendingUp" size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Karma Over Time</h3>
            </div>
            {karmaData.length > 0 ? (
              <Chart
                options={karmaChartOptions}
                series={karmaChartSeries}
                type="line"
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ApperIcon name="BarChart3" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No karma data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Engagement Rate */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <ApperIcon name="Activity" size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Engagement Rate</h3>
            </div>
            {engagementRate.length > 0 ? (
              <Chart
                options={engagementChartOptions}
                series={engagementChartSeries}
                type="area"
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ApperIcon name="Activity" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No engagement data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Best Posting Hours */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <ApperIcon name="Clock" size={20} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Best Posting Hours</h3>
            </div>
            {bestTimes?.hourlyData.length > 0 ? (
              <Chart
                options={bestHoursChartOptions}
                series={bestHoursChartSeries}
                type="bar"
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ApperIcon name="Clock" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No posting time data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Follower Growth */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <ApperIcon name="Users" size={20} className="text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Follower Growth</h3>
            </div>
            {followerGrowth.length > 0 ? (
              <Chart
                options={followerGrowthOptions}
                series={followerGrowthSeries}
                type="line"
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ApperIcon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No follower data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Posts */}
          {postPerformance?.topPerformingPosts?.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <ApperIcon name="Trophy" size={20} className="text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Posts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-medium text-gray-600">Title</th>
                      <th className="text-left p-3 font-medium text-gray-600">Score</th>
                      <th className="text-left p-3 font-medium text-gray-600">Community</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postPerformance.topPerformingPosts.map((post, index) => (
                      <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                            <span className="truncate max-w-xs">{post.title}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-green-600">+{post.score}</span>
                        </td>
                        <td className="p-3 text-gray-600">r/{post.community}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Subreddits */}
          {topSubreddits.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <ApperIcon name="Hash" size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Top Communities</h3>
              </div>
              <div className="space-y-3">
                {topSubreddits.slice(0, 5).map((community, index) => (
                  <div key={community.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm bg-primary text-white px-2 py-1 rounded">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">r/{community.name}</p>
                        <p className="text-sm text-gray-600">{community.posts} posts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+{community.averageScore.toFixed(1)}</p>
                      <p className="text-sm text-gray-500">avg score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Best Posting Times Summary */}
        {bestTimes && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <ApperIcon name="Calendar" size={20} className="text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Optimal Posting Schedule</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ApperIcon name="Clock" size={32} className="mx-auto text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-900">Best Hour</h4>
                <p className="text-2xl font-bold text-blue-700">{bestTimes.bestHour.hour}:00</p>
                <p className="text-sm text-blue-600">Average score: +{bestTimes.bestHour.averageScore.toFixed(1)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <ApperIcon name="Calendar" size={32} className="mx-auto text-green-600 mb-2" />
                <h4 className="font-semibold text-green-900">Best Day</h4>
                <p className="text-2xl font-bold text-green-700">{bestTimes.bestDay.day}</p>
                <p className="text-sm text-green-600">Average score: +{bestTimes.bestDay.averageScore.toFixed(1)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}