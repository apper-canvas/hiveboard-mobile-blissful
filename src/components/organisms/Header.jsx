import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAuth } from "@/layouts/Root";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import PostCreator from "@/components/organisms/PostCreator";
import Button from "@/components/atoms/Button";
import { notificationService } from "@/services/api/notificationService";
import { messageService } from "@/services/api/messageService";
// Notification Button Component
const NotificationButton = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadUnreadCount = async () => {
    try {
      setLoading(true);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <button
      onClick={handleNotificationClick}
      disabled={loading}
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      title="View notifications"
    >
      <ApperIcon 
        name={loading ? "Loader2" : "Bell"} 
        className={cn(
          "w-5 h-5 text-gray-600",
          loading && "animate-spin"
        )} 
      />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </button>
  );
};

const MessageButton = () => {
const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(true);

  const loadUnreadCount = async () => {
    try {
      setLoading(true);
      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread message count:', err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadUnreadCount();
    
    // Poll for updates every 30 seconds when tab is active
    let interval;
    if (isPolling) {
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadUnreadCount();
        }
      }, 30000);
    }
    
    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPolling) {
        loadUnreadCount();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPolling]);

  const handleMessageClick = () => {
    navigate('/messages');
  };

  return (
    <button
      onClick={handleMessageClick}
      disabled={loading}
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      title="View messages"
    >
      <ApperIcon 
        name={loading ? "Loader2" : "MessageSquare"} 
        className={cn(
          "w-5 h-5 text-gray-600",
          loading && "animate-spin"
        )} 
      />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </button>
  );
};
const Header = ({ className }) => {
  const { isAuthenticated } = useSelector(state => state.user);
  const { logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const handleCreatePost = () => {
    setShowCreateModal(true);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2 group"
            >
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <ApperIcon name="Hexagon" className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black gradient-text hidden sm:block">
                HiveBoard
              </span>
            </button>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Actions */}
{/* Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Search */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ApperIcon name="Search" className="w-5 h-5 text-gray-600" />
            </button>

            {/* Messages */}
            <MessageButton />

            {/* Notifications */}
            <NotificationButton />
            {/* Create Post */}
            <Button 
              onClick={handleCreatePost}
              size="sm"
              className="hidden sm:flex"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              Create Post
            </Button>

            {/* Mobile Create Post */}
            <button 
              onClick={handleCreatePost}
              className="sm:hidden p-2 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all"
            >
              <ApperIcon name="Plus" className="w-5 h-5" />
            </button>
            {/* User Menu */}
<div className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-blue-600 flex items-center justify-center">
                      <ApperIcon name="User" className="w-4 h-4 text-white" />
                    </div>
                    <ApperIcon name="ChevronDown" className="w-4 h-4 text-gray-600 hidden sm:block" />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">current_user</div>
                        <div className="text-xs text-gray-500">1,337 karma</div>
                      </div>
                      <Link 
                        to="/profile/current_user"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ApperIcon name="User" className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link 
                        to="/saved"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ApperIcon name="Bookmark" className="w-4 h-4" />
                        Saved
                      </Link>
                      <Link 
                        to="/hidden"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ApperIcon name="EyeOff" className="w-4 h-4" />
                        Hidden
                      </Link>
                      <Link 
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ApperIcon name="Settings" className="w-4 h-4" />
                        Settings
                      </Link>
                      
                      <Link
                        to="/preferences"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <ApperIcon name="Settings" className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Preferences</span>
                      </Link>
                      <Link 
                        to="/create-community"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ApperIcon name="Users" className="w-4 h-4" />
                        Create Community
                      </Link>
                      <div className="border-t border-gray-100 mt-1">
                        <button 
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                            toast.info('Signed out successfully');
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ApperIcon name="LogOut" className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <ApperIcon name="LogIn" className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Create Post Modal Placeholder */}
<PostCreator 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </header>
  );
};

export default Header;