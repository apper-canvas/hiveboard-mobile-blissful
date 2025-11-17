import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import notificationService from "@/services/api/notificationService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import Button from "@/components/atoms/Button";
const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [groupedNotifications, setGroupedNotifications] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const notificationTypes = [
    { id: 'all', label: 'All', icon: 'Bell' },
    { id: 'upvote_post', label: 'Post Upvotes', icon: 'ArrowUp' },
    { id: 'upvote_comment', label: 'Comment Upvotes', icon: 'ArrowUp' },
    { id: 'reply', label: 'Replies', icon: 'MessageCircle' },
    { id: 'mention', label: 'Mentions', icon: 'AtSign' },
    { id: 'new_follower', label: 'Followers', icon: 'UserPlus' },
    { id: 'award', label: 'Awards', icon: 'Award' },
    { id: 'content_removed', label: 'Removals', icon: 'Trash2' },
    { id: 'ban', label: 'Bans', icon: 'Shield' },
    { id: 'mod_invite', label: 'Mod Invites', icon: 'Crown' },
    { id: 'message', label: 'Messages', icon: 'Mail' },
    { id: 'unread', label: 'Unread', icon: 'Eye' }
  ];

const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    if (!Array.isArray(notifications)) {
      setFilteredNotifications([]);
      setGroupedNotifications([]);
      return;
    }

    let filtered = notifications;
    
    if (activeFilter === 'unread') {
      filtered = notifications.filter(n => !n.isRead);
    } else if (activeFilter !== 'all') {
      filtered = notifications.filter(n => n.type === activeFilter);
    }
    
    setFilteredNotifications(filtered);
    
    const grouped = notificationService.groupNotifications(filtered);
    setGroupedNotifications(grouped);
  };

  const toggleGroupExpansion = (groupKey) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const handleGroupMarkAsRead = async (group) => {
    const unreadNotifications = group.notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      setActionLoading(`group-${group.key}`);
      await Promise.all(unreadNotifications.map(n => notificationService.markAsRead(n.Id)));
      
      setNotifications(prev => 
        prev.map(n => 
          unreadNotifications.some(un => un.Id === n.Id) 
            ? { ...n, isRead: true } 
            : n
        )
      );
      
      toast.success(`Marked ${unreadNotifications.length} notifications as read`);
    } catch (err) {
      console.error('Error marking group as read:', err);
      toast.error('Failed to mark group as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      setActionLoading(id);
      await notificationService.markAsRead(id);
      
      setNotifications(prev => 
        prev.map(n => n.Id === id ? { ...n, isRead: true } : n)
      );
      
      toast.success('Marked as read');
    } catch (err) {
      console.error('Error marking as read:', err);
      toast.error('Failed to mark as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      setActionLoading(id);
      await notificationService.markAsUnread(id);
      
      setNotifications(prev => 
        prev.map(n => n.Id === id ? { ...n, isRead: false } : n)
      );
      
      toast.success('Marked as unread');
    } catch (err) {
      console.error('Error marking as unread:', err);
      toast.error('Failed to mark as unread');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading('mark-all');
      await notificationService.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      setActionLoading(id);
      await notificationService.delete(id);
      
      setNotifications(prev => prev.filter(n => n.Id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading('clear-all');
      await notificationService.clearAll();
      
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error('Failed to clear notifications');
    } finally {
      setActionLoading(null);
    }
  };

  const handleNotificationClick = (notification) => {
    // Navigate to the relevant content based on notification type
    switch (notification.targetType) {
      case 'post':
        navigate(`/post/${notification.targetId}`);
        break;
      case 'comment':
        // Navigate to post with comment highlight (simplified to post for now)
        navigate(`/post/${notification.targetId}`);
        break;
      case 'user':
        navigate(`/profile/${notification.userId}`);
        break;
      case 'community':
        navigate(`/r/${notification.targetTitle}`);
        break;
      case 'message':
        // Would navigate to messages page when implemented
        toast.info('Message feature coming soon');
        break;
      default:
        break;
    }

    // Mark as read if not already read
    if (!notification.isRead) {
      handleMarkAsRead(notification.Id);
    }
  };
const renderNotificationContent = (notification) => {
    const icon = notificationService.getNotificationIcon(notification.type);
    const color = notificationService.getNotificationColor(notification.type);
    
    return (
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          notification.isRead ? "bg-gray-100" : "bg-blue-50"
        )}>
          <ApperIcon
            name={icon} 
            className={cn("w-5 h-5", notification.isRead ? "text-gray-500" : color)} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold text-sm mb-1",
                notification.isRead ? "text-gray-700" : "text-gray-900"
              )}>
                {notification.title}
              </h3>
              <p className={cn(
                "text-sm mb-2 line-clamp-2",
                notification.isRead ? "text-gray-500" : "text-gray-700"
              )}>
                {notification.message}
              </p>
            </div>
            
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{formatDistanceToNow(new Date(notification.timestamp))} ago</span>
              {notification.metadata?.community && (
                <>
                  <span>•</span>
                  <span>r/{notification.metadata.community}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {notification.isRead ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsUnread(notification.Id);
                  }}
                  disabled={actionLoading === notification.Id}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Mark as unread"
                >
                  <ApperIcon name="EyeOff" className="w-4 h-4 text-gray-400" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.Id);
                  }}
                  disabled={actionLoading === notification.Id}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Mark as read"
                >
                  <ApperIcon name="Eye" className="w-4 h-4 text-gray-400" />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNotification(notification.Id);
                }}
                disabled={actionLoading === notification.Id}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Delete notification"
              >
                <ApperIcon name="Trash2" className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGroupHeader = (group) => {
    const unreadCount = group.notifications.filter(n => !n.isRead).length;
    const isExpanded = expandedGroups.has(group.key);
    
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleGroupExpansion(group.key)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <ApperIcon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              className="w-4 h-4 text-gray-500" 
            />
          </button>
          
          <div className="flex items-center gap-2">
            <ApperIcon 
              name={notificationService.getNotificationIcon(group.type)} 
              className={cn("w-5 h-5", notificationService.getNotificationColor(group.type))} 
            />
            <h3 className="font-semibold text-gray-900">{group.title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
              {group.count} {group.count === 1 ? 'notification' : 'notifications'}
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGroupMarkAsRead(group);
              }}
              disabled={actionLoading === `group-${group.key}`}
              className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {actionLoading === `group-${group.key}` ? (
                <ApperIcon name="Loader2" className="w-3 h-3 animate-spin" />
              ) : (
                'Mark all read'
              )}
            </button>
)}
          
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(group.latestTimestamp))} ago
          </span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeFilter]);

if (loading) {
    return <Loading className="min-h-screen" />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error} 
        onRetry={loadNotifications}
        className="min-h-screen" 
      />
    );
  }

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleMarkAllAsRead}
                disabled={actionLoading === 'mark-all' || unreadCount === 0}
                variant="secondary"
                size="sm"
              >
                {actionLoading === 'mark-all' ? (
                  <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                ) : (
                  <ApperIcon name="CheckCheck" className="w-4 h-4" />
                )}
                Mark All Read
              </Button>
              
              <Button
                onClick={handleClearAll}
                disabled={actionLoading === 'clear-all' || notifications.length === 0}
                variant="secondary"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                {actionLoading === 'clear-all' ? (
                  <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                ) : (
                  <ApperIcon name="Trash2" className="w-4 h-4" />
                )}
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex overflow-x-auto">
              {notificationTypes.map(type => {
                const count = type.id === 'all' 
                  ? notifications.length 
                  : type.id === 'unread'
                  ? unreadCount
                  : notifications.filter(n => n.type === type.id).length;

                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveFilter(type.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                      activeFilter === type.id
                        ? "border-primary text-primary bg-blue-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    )}
                  >
                    <ApperIcon name={type.icon} className="w-4 h-4" />
                    {type.label}
                    {count > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {count}
                      </span>
)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {groupedNotifications.length === 0 ? (
            <div className="p-8">
              <Empty
                title={activeFilter === 'all' ? "No notifications" : `No ${activeFilter === 'unread' ? 'unread' : notificationTypes.find(t => t.id === activeFilter)?.label.toLowerCase()} notifications`}
                message={activeFilter === 'all' 
                  ? "You're all caught up! New notifications will appear here." 
                  : `No ${activeFilter === 'unread' ? 'unread' : activeFilter} notifications at this time.`}
                icon="Bell"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {groupedNotifications.map(group => (
                <div key={group.key} className="bg-white">
                  {/* Group Header */}
                  {renderGroupHeader(group)}
                  
                  {/* Group Content */}
                  {expandedGroups.has(group.key) && (
                    <div className="divide-y divide-gray-100">
                      {group.notifications.map(notification => (
                        <div
                          key={notification.Id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "p-6 cursor-pointer transition-colors hover:bg-gray-50 ml-12",
                            !notification.isRead && "bg-blue-50/50"
                          )}
                        >
                          {renderNotificationContent(notification)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Collapsed Preview */}
                  {!expandedGroups.has(group.key) && group.notifications.length > 0 && (
                    <div className="p-6 ml-12 border-b border-gray-100 bg-gray-25">
                      <div className="text-sm text-gray-600">
                        Click to expand {group.notifications.length} notifications
                        {group.notifications.filter(n => !n.isRead).length > 0 && 
                          ` (${group.notifications.filter(n => !n.isRead).length} unread)`
                        }
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        {notifications.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-primary">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.type.includes('upvote') || n.type === 'award').length}
              </div>
              <div className="text-sm text-gray-600">Positive</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {notifications.filter(n => n.type === 'reply' || n.type === 'mention').length}
              </div>
              <div className="text-sm text-gray-600">Social</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;