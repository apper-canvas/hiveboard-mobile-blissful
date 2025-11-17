import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow, isValid } from "date-fns";
import { toast } from "react-toastify";
import { userService } from "@/services/api/userService";
import { postService } from "@/services/api/postService";
import { commentService } from "@/services/api/commentService";
import { savedService } from "@/services/api/savedService";
import { hiddenService } from "@/services/api/hiddenService";
import { communityService } from "@/services/api/communityService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import Button from "@/components/atoms/Button";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [communities, setCommunities] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedComments, setSavedComments] = useState([]);
  const [hiddenPosts, setHiddenPosts] = useState([]);

  // Aliases for consistent naming
  const setUserPosts = setPosts;
  const setUserComments = setComments;
  const setUserCommunities = setCommunities;
  const setSavedContent = (content) => {
    const posts = content.filter(item => item.type === 'post');
    const comments = content.filter(item => item.type === 'comment');
    setSavedPosts(posts);
    setSavedComments(comments);
  };
  const setHiddenContent = setHiddenPosts;

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!username) {
        setError('Username is required');
        return;
      }
      
      // Check if viewing current user's profile - handle each call separately for better error control
      let userProfile = null;
      let current = null;
      
      try {
        userProfile = await userService.getById(username);
      } catch (userError) {
        // User not found is a specific error we want to handle gracefully
        if (userError.message === "User not found") {
          setError(`User "${username}" not found`);
          return;
        }
        throw userError; // Re-throw other unexpected errors
      }
      
      try {
        current = await userService.getCurrentUser();
      } catch (currentUserError) {
        console.error('Error loading current user:', currentUserError);
        // Continue without current user data - this shouldn't break the profile view
        current = { username: 'anonymous', following: [] };
      }
      
      setUser(userProfile);
      setCurrentUser(current);
      setIsOwnProfile(current.username.toLowerCase() === username.toLowerCase());
      
      // Load additional data with individual error handling
      try {
        await loadUserPosts(username);
      } catch (postsError) {
        console.error('Error loading user posts:', postsError);
        // Continue - posts will show as empty
      }
      
      try {
        await loadUserComments(username);
      } catch (commentsError) {
        console.error('Error loading user comments:', commentsError);
        // Continue - comments will show as empty
      }
      
      try {
        await loadUserCommunities(username);
      } catch (communitiesError) {
        console.error('Error loading user communities:', communitiesError);
        // Continue - communities will show as empty
      }
      
      // Only load private content if this is the current user's profile
      if (current.username.toLowerCase() === username.toLowerCase()) {
        try {
          await loadSavedContent();
        } catch (savedError) {
          console.error('Error loading saved content:', savedError);
          // Continue - saved will show as empty
        }
        
        try {
          await loadHiddenContent();
        } catch (hiddenError) {
          console.error('Error loading hidden content:', hiddenError);
          // Continue - hidden will show as empty
        }
      }
      
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };
  
  const loadUserPosts = async (username) => {
    try {
const posts = await postService.getByUser(username);
      setUserPosts(posts || []);
    } catch (err) {
      console.error('Error loading user posts:', err);
      setUserPosts([]);
    }
  };
  
  const loadUserComments = async (username) => {
    try {
      const comments = await commentService.getByUser(username);
      setUserComments(comments || []);
    } catch (err) {
      console.error('Error loading user comments:', err);
      setUserComments([]);
    }
  };
  
  const loadSavedContent = async () => {
    try {
const saved = await savedService.getAll();
      setSavedContent(saved || []);
    } catch (err) {
      console.error('Error loading saved content:', err);
      setSavedContent([]);
    }
  };
  
  const loadHiddenContent = async () => {
    try {
      const hidden = await hiddenService.getAll();
      setHiddenContent(hidden || []);
    } catch (err) {
      console.error('Error loading hidden content:', err);
      setHiddenContent([]);
    }
  };
  
  const loadUserCommunities = async (username) => {
    try {
const communities = await communityService.getUserCommunities(username);
      setUserCommunities(communities || []);
    } catch (err) {
      console.error('Error loading user communities:', err);
      setUserCommunities([]);
    }
  };
  
const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please log in to follow users');
      return;
    }

    if (!user) {
      toast.error('Cannot follow - user data not available');
      return;
    }

    try {
      setActionLoading(true);
      // Simulate follow/unfollow API call
      if (isFollowing) {
        toast.success(`Unfollowed ${user.username}`);
        setIsFollowing(false);
        setUser(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
      } else {
        toast.success(`Now following ${user.username}`);
        setIsFollowing(true);
        setUser(prev => ({ ...prev, followers: (prev.followers || 0) + 1 }));
      }
    } catch (err) {
      console.error('Error updating follow status:', err);
      toast.error('Failed to update follow status');
    } finally {
      setActionLoading(false);
    }
  };

  // Load data on component mount and username change
  useEffect(() => {
    if (username) {
      loadUserData();
    }
  }, [username]);

  // Check if user is following on user data load
  useEffect(() => {
    if (user && currentUser) {
      const following = currentUser.following || [];
      setIsFollowing(following.includes(user.username));
    }
  }, [user, currentUser]);

  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        const overviewContent = [
          ...posts.map(post => ({ ...post, type: 'post' })),
          ...comments.map(comment => ({ ...comment, type: 'comment' }))
        ].sort((a, b) => b.timestamp - a.timestamp);
        return renderContent(overviewContent, 'overview');

      case 'posts':
        return renderContent(posts.map(post => ({ ...post, type: 'post' })), 'posts');

      case 'comments':
        return renderContent(comments.map(comment => ({ ...comment, type: 'comment' })), 'comments');

      case 'saved':
        if (!isOwnProfile) return renderPrivateTab();
        const allSaved = [
          ...savedPosts.map(post => ({ ...post, type: 'post' })),
          ...savedComments.map(comment => ({ ...comment, type: 'comment' }))
        ].sort((a, b) => b.timestamp - a.timestamp);
        return renderContent(allSaved, 'saved');

      case 'hidden':
        if (!isOwnProfile) return renderPrivateTab();
        return renderContent(hiddenPosts.map(post => ({ ...post, type: 'post' })), 'hidden');

      case 'upvoted':
        if (!isOwnProfile) return renderPrivateTab();
        const upvotedContent = [
          ...posts.filter(post => post.userVote === 'up').map(post => ({ ...post, type: 'post' })),
          ...comments.filter(comment => comment.userVote === 'up').map(comment => ({ ...comment, type: 'comment' }))
        ].sort((a, b) => b.timestamp - a.timestamp);
        return renderContent(upvotedContent, 'upvoted');

      case 'downvoted':
        if (!isOwnProfile) return renderPrivateTab();
        const downvotedContent = [
          ...posts.filter(post => post.userVote === 'down').map(post => ({ ...post, type: 'post' })),
          ...comments.filter(comment => comment.userVote === 'down').map(comment => ({ ...comment, type: 'comment' }))
        ].sort((a, b) => b.timestamp - a.timestamp);
        return renderContent(downvotedContent, 'downvoted');

      case 'gilded':
        const gildedContent = [
          ...posts.filter(post => post.gilded).map(post => ({ ...post, type: 'post' })),
          ...comments.filter(comment => comment.gilded).map(comment => ({ ...comment, type: 'comment' }))
        ].sort((a, b) => b.timestamp - a.timestamp);
        return renderContent(gildedContent, 'gilded');

      default:
        return null;
    }
  };

  const renderPrivateTab = () => (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ApperIcon name="Lock" className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Private Content</h3>
      <p className="text-gray-600">This content is only visible to the profile owner.</p>
    </div>
  );

  const renderContent = (content, type) => {
    if (content.length === 0) {
      return (
        <Empty
          title={`No ${type} yet`}
          message={`${user.username} hasn't ${type === 'posts' ? 'posted' : type === 'comments' ? 'commented' : 'shared'} anything yet.`}
          icon={type === 'posts' ? 'FileText' : type === 'comments' ? 'MessageSquare' : 'Bookmark'}
        />
      );
    }

    return (
      <div className="space-y-4">
        {content.map(item => (
          <div key={`${item.type}-${item.Id}`} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <ApperIcon 
                  name={item.type === 'post' ? 'FileText' : 'MessageSquare'} 
                  className="w-4 h-4 text-white" 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                {item.type === 'post' ? (
                  <div>
                    <Link 
                      to={`/post/${item.Id}`}
                      className="font-semibold text-gray-900 hover:text-primary line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    {item.content && (
                      <p className="text-gray-600 mt-1 line-clamp-2">{item.content}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <Link to={`/r/${item.communityName}`} className="hover:text-primary">
                        r/{item.communityName}
                      </Link>
                      <span>•</span>
                      <span>{item.upvotes - item.downvotes} points</span>
                      <span>•</span>
                      <span>{item.commentCount} comments</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(item.timestamp))} ago</span>
                      {item.gilded && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-yellow-600">
                            <ApperIcon name="Award" className="w-3 h-3" />
                            Gilded
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-900">{item.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{item.upvotes - item.downvotes} points</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(item.timestamp))} ago</span>
                      {item.gilded && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-yellow-600">
                            <ApperIcon name="Award" className="w-3 h-3" />
                            Gilded
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const formatCakeDay = (joinedAt) => {
    const date = new Date(joinedAt);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAccountAge = (joinedAt) => {
    const now = new Date();
    const joined = new Date(joinedAt);
    const diffTime = Math.abs(now - joined);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return months > 0 ? `${years}y ${months}m` : `${years}y`;
    }
    return months > 0 ? `${months}m` : `${diffDays}d`;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Layout', count: posts.length + comments.length },
    { id: 'posts', label: 'Posts', icon: 'FileText', count: posts.length },
    { id: 'comments', label: 'Comments', icon: 'MessageSquare', count: comments.length },
    { id: 'upvoted', label: 'Upvoted', icon: 'ArrowUp', private: true },
    { id: 'downvoted', label: 'Downvoted', icon: 'ArrowDown', private: true },
    { id: 'saved', label: 'Saved', icon: 'Bookmark', count: isOwnProfile ? savedPosts.length + savedComments.length : null, private: true },
    { id: 'hidden', label: 'Hidden', icon: 'EyeOff', count: isOwnProfile ? hiddenPosts.length : null, private: true },
    { id: 'gilded', label: 'Gilded', icon: 'Award', count: [...posts, ...comments].filter(item => item.gilded).length }
  ];
if (loading) {
    return <Loading className="min-h-screen" />;
  }
  if (error) {
    return (
      <ErrorView 
        message={error} 
        onRetry={loadUserData}
        className="min-h-screen" 
      />
    );
  }
if (!user) {
    return <Loading className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Profile Banner */}
      <div className="relative">
        <div 
          className="h-48 bg-gradient-to-r from-primary via-purple-600 to-pink-500"
          style={{
            backgroundImage: user?.banner ? `url(${user.banner})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Profile Header */}
<div className="relative -mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-600 border-4 border-white shadow-lg"
                    style={{
                      backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!user?.avatar && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  {user?.isOnline && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user?.username || 'Unknown User'}</h1>
                  {user?.displayName && (
                    <p className="text-lg text-gray-600">{user.displayName}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ApperIcon name="Calendar" className="w-4 h-4" />
                      <span>Joined {user?.joinedAt ? formatCakeDay(user.joinedAt) : 'Unknown'}</span>
                    </div>
                    <span>•</span>
                    <span>{user?.joinedAt ? getAccountAge(user.joinedAt) : '0d'} old</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="lg:ml-auto">
                {!isOwnProfile && (
                  <Button
                    onClick={handleFollow}
                    disabled={actionLoading}
                    variant={isFollowing ? "secondary" : "primary"}
                    className="w-full lg:w-auto"
                  >
                    {actionLoading ? (
                      <>
                        <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : isFollowing ? (
                      <>
                        <ApperIcon name="UserMinus" className="w-4 h-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <ApperIcon name="UserPlus" className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
{/* Bio */}
            {user?.bio && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Social Links */}
            {user?.socialLinks && user.socialLinks.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                {user.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    <ApperIcon name={link.platform === 'twitter' ? 'Twitter' : 'Link'} className="w-4 h-4" />
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <div className="text-2xl font-bold text-primary">{user?.karma || 0}</div>
                <div className="text-sm text-gray-600">Karma</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <div className="text-2xl font-bold text-green-600">{posts?.length || 0}</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <div className="text-2xl font-bold text-blue-600">{comments?.length || 0}</div>
                <div className="text-sm text-gray-600">Comments</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <div className="text-2xl font-bold text-purple-600">{user?.followers || 0}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex overflow-x-auto">
                  {tabs.map(tab => {
                    if (tab.private && !isOwnProfile) return null;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                          activeTab === tab.id
                            ? "border-primary text-primary bg-blue-50"
                            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                        )}
                      >
                        <ApperIcon name={tab.icon} className="w-4 h-4" />
                        {tab.label}
                        {tab.count !== undefined && tab.count !== null && (
                          <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-6">
                {getTabContent()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
<div className="space-y-6">
            {/* Trophies */}
            {user?.achievements && user.achievements.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <ApperIcon name="Award" className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Trophies</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {user.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-2">
                        <ApperIcon name="Award" className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-center text-gray-700">
                        {achievement.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Communities */}
<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <ApperIcon name="Users" className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-900">Active Communities</h3>
              </div>
              <div className="space-y-3">
                {communities?.slice(0, 5).map(community => (
                  <Link
                    key={community.Id}
                    to={`/r/${community.name}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">r/{community.name}</div>
                      <div className="text-xs text-gray-600">{community.memberCount.toLocaleString()} members</div>
</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;