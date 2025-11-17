import notificationsData from "@/services/mockData/notifications.json";

let notifications = [...notificationsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationService = {
  async getAll() {
    await delay(300);
    return [...notifications].sort((a, b) => b.timestamp - a.timestamp);
  },

  async getUnreadCount() {
    await delay(100);
    return notifications.filter(n => !n.isRead).length;
  },

  async getByType(type) {
    await delay(200);
    return notifications.filter(n => n.type === type).sort((a, b) => b.timestamp - a.timestamp);
  },

  async getUnread() {
    await delay(200);
    return notifications.filter(n => !n.isRead).sort((a, b) => b.timestamp - a.timestamp);
  },

  async markAsRead(id) {
    await delay(150);
    const notificationIndex = notifications.findIndex(n => n.Id === id);
    if (notificationIndex === -1) {
      throw new Error("Notification not found");
    }
    
    notifications[notificationIndex] = { 
      ...notifications[notificationIndex], 
      isRead: true 
    };
    return { ...notifications[notificationIndex] };
  },

  async markAsUnread(id) {
    await delay(150);
    const notificationIndex = notifications.findIndex(n => n.Id === id);
    if (notificationIndex === -1) {
      throw new Error("Notification not found");
    }
    
    notifications[notificationIndex] = { 
      ...notifications[notificationIndex], 
      isRead: false 
    };
    return { ...notifications[notificationIndex] };
  },

  async markAllAsRead() {
    await delay(200);
    notifications = notifications.map(n => ({ ...n, isRead: true }));
    return true;
  },

  async delete(id) {
    await delay(150);
    const notificationIndex = notifications.findIndex(n => n.Id === id);
    if (notificationIndex === -1) {
      throw new Error("Notification not found");
    }
    
    notifications.splice(notificationIndex, 1);
    return true;
  },

  async clearAll() {
    await delay(200);
    notifications = [];
    return true;
  },

  async create(notificationData) {
    await delay(200);
    const newNotification = {
      Id: Math.max(...notifications.map(n => n.Id)) + 1,
      ...notificationData,
      isRead: false,
      timestamp: Date.now()
    };
    
    notifications.unshift(newNotification);
    
    // Trigger email notification for important events
    await this.triggerEmailNotification(newNotification);
    
    return { ...newNotification };
  },

  // Group notifications by type and similar content
  groupNotifications(notificationList) {
    const groups = new Map();
    
    notificationList.forEach(notification => {
      const groupKey = this.getGroupKey(notification);
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          type: notification.type,
          title: this.getGroupTitle(notification),
          notifications: [],
          count: 0,
          latestTimestamp: notification.timestamp
        });
      }
      
      const group = groups.get(groupKey);
      group.notifications.push(notification);
      group.count++;
      
      if (notification.timestamp > group.latestTimestamp) {
        group.latestTimestamp = notification.timestamp;
      }
    });
    
    return Array.from(groups.values()).sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  },

  getGroupKey(notification) {
    // Group by type and target
    switch (notification.type) {
      case 'upvote_post':
      case 'upvote_comment':
        return `${notification.type}_${notification.targetId}`;
      case 'reply':
        return `reply_${notification.targetId}`;
      case 'mention':
        return `mention_${notification.targetId}`;
      case 'new_follower':
        return 'new_followers';
      case 'award':
        return `award_${notification.targetId}`;
      default:
        return `${notification.type}_${notification.Id}`;
    }
  },

  getGroupTitle(notification) {
    switch (notification.type) {
      case 'upvote_post':
        return 'Post Upvotes';
      case 'upvote_comment':
        return 'Comment Upvotes';
      case 'reply':
        return 'Replies';
      case 'mention':
        return 'Mentions';
      case 'new_follower':
        return 'New Followers';
      case 'award':
        return 'Awards';
      case 'content_removed':
        return 'Content Moderation';
      case 'ban':
        return 'Account Actions';
      case 'mod_invite':
        return 'Moderation Invites';
      case 'message':
        return 'Messages';
      default:
        return 'Notifications';
    }
  },

  // Trigger email notifications for important events
  async triggerEmailNotification(notification) {
    try {
      // Check if this notification type should trigger email
      const emailTypes = ['reply', 'mention', 'award', 'mod_invite', 'ban', 'content_removed'];
      
      if (!emailTypes.includes(notification.type)) {
        return;
      }

      // Get user preferences (in real app, this would be based on user ID)
      const preferences = await this.getPreferences();
      
      if (!preferences.delivery.email) {
        return;
      }

      // Check if this specific notification type is enabled for email
      if (!preferences.types[notification.type]) {
        return;
      }

      // Prepare email data
      const emailData = {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        targetType: notification.targetType,
        targetId: notification.targetId,
        timestamp: notification.timestamp,
        metadata: notification.metadata
      };

      // Note: In production, this would make an API call to send email
      console.info(`Email notification triggered for: ${notification.type}`);
      
    } catch (error) {
      console.error('Failed to trigger email notification:', error);
      // Don't throw error as this shouldn't block notification creation
    }
  },

  // Utility method to get notification icon based on type
  getNotificationIcon(type) {
    const iconMap = {
      upvote_post: 'ArrowUp',
      upvote_comment: 'ArrowUp',
      reply: 'MessageCircle',
      mention: 'AtSign',
      new_follower: 'UserPlus',
      award: 'Award',
      content_removed: 'Trash2',
      ban: 'Shield',
      mod_invite: 'Crown',
      message: 'Mail'
    };
    return iconMap[type] || 'Bell';
  },

  // Utility method to get notification color based on type
  getNotificationColor(type) {
    const colorMap = {
      upvote_post: 'text-green-600',
      upvote_comment: 'text-green-600',
      reply: 'text-blue-600',
      mention: 'text-purple-600',
      new_follower: 'text-indigo-600',
      award: 'text-yellow-600',
      content_removed: 'text-red-600',
      ban: 'text-red-600',
      mod_invite: 'text-green-600',
      message: 'text-gray-600'
    };
    return colorMap[type] || 'text-gray-600';
  },

  // Get formatted notification type name
  getTypeDisplayName(type) {
    const displayMap = {
      upvote_post: 'Post Upvote',
      upvote_comment: 'Comment Upvote',
      reply: 'Reply',
      mention: 'Mention',
      new_follower: 'New Follower',
      award: 'Award',
      content_removed: 'Content Removed',
      ban: 'Ban',
      mod_invite: 'Mod Invite',
      message: 'Message'
    };
return displayMap[type] || 'Notification';
  },

// Notification preferences management
  getPreferences: async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return default preferences structure with enhanced email settings
      return {
        types: {
          upvote_post: true,
          upvote_comment: true,
          reply: true,
          mention: true,
          new_follower: true,
          award: true,
          content_removed: true,
          ban: true,
          mod_invite: true,
          message: true
        },
        delivery: {
          email: true,
          push: true,
          emailImportantOnly: false, // Only send emails for important notifications
          emailDigest: false // Send daily/weekly digest instead of individual emails
        },
        frequency: 'instant', // instant, hourly, daily, weekly
        emailTypes: {
          upvote_post: false,
          upvote_comment: false,
          reply: true,
          mention: true,
          new_follower: false,
          award: true,
          content_removed: true,
          ban: true,
          mod_invite: true,
          message: true
        }
      };
    } catch (error) {
      throw new Error('Failed to load notification preferences');
    }
  },

  updatePreferences: async (preferences) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real application, this would save to backend
      // For now, we'll just validate the structure
      if (!preferences.types || !preferences.delivery || !preferences.frequency) {
        throw new Error('Invalid preferences structure');
      }
      
      return preferences;
    } catch (error) {
      throw new Error('Failed to update notification preferences');
    }
  },

  resetPreferences: async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Return default preferences
      return {
        types: {
          upvote_post: true,
          upvote_comment: true,
          reply: true,
          mention: true,
          new_follower: true,
          award: true,
          content_removed: true,
          ban: true,
          mod_invite: true,
          message: true
        },
        delivery: {
          email: true,
          push: true,
          emailImportantOnly: false,
          emailDigest: false
        },
        frequency: 'instant',
        emailTypes: {
          upvote_post: false,
          upvote_comment: false,
          reply: true,
          mention: true,
          new_follower: false,
          award: true,
          content_removed: true,
          ban: true,
          mod_invite: true,
          message: true
        }
      };
    } catch (error) {
      throw new Error('Failed to reset notification preferences');
    }
  }
};