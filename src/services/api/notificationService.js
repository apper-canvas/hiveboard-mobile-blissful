import { getApperClient } from "@/services/api/apperClientInit";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationService = {
  getUnreadCount: async () => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('notifications_c', {
        fields: [
          { field: { Name: 'Id' } },
          { field: { Name: 'isRead_c' } }
        ],
        where: [
          {
            FieldName: 'isRead_c',
            Operator: 'EqualTo',
            Values: [false],
            Include: true
          }
        ]
      });

      if (!response?.success) {
        console.error('Error fetching unread count:', response?.message);
        return 0;
      }

      return response.data?.length || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error?.message || error);
      return 0;
    }
  },

  getAll: async (filters = {}) => {
    try {
      const apperClient = getApperClient();
      
      const whereConditions = [];
      
      if (filters.type) {
        whereConditions.push({
          FieldName: 'type_c',
          Operator: 'EqualTo',
          Values: [filters.type]
        });
      }

      if (filters.isRead !== undefined) {
        whereConditions.push({
          FieldName: 'isRead_c',
          Operator: 'EqualTo',
          Values: [filters.isRead]
        });
      }

      const response = await apperClient.fetchRecords('notifications_c', {
        fields: [
          { field: { Name: 'Id' } },
          { field: { Name: 'title_c' } },
          { field: { Name: 'message_c' } },
          { field: { Name: 'type_c' } },
          { field: { Name: 'isRead_c' } },
          { field: { Name: 'createdAt_c' } },
          { field: { Name: 'link_c' } }
        ],
        where: whereConditions,
        orderBy: [{ fieldName: 'createdAt_c', sorttype: 'DESC' }],
        pagingInfo: {
          limit: filters.limit || 20,
          offset: filters.offset || 0
        }
      });

      if (!response?.success) {
        console.error('Error fetching notifications:', response?.message);
        return { data: [], total: 0, pageInfo: { limit: filters.limit || 20, offset: filters.offset || 0 } };
      }

      return {
        data: response.data || [],
        total: response.total || 0,
        pageInfo: { limit: filters.limit || 20, offset: filters.offset || 0 }
      };
    } catch (error) {
      console.error('Error in getAll:', error?.message || error);
      return { data: [], total: 0, pageInfo: { limit: filters.limit || 20, offset: filters.offset || 0 } };
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.getRecordById('notifications_c', id, {
        fields: [
          { field: { Name: 'Id' } },
          { field: { Name: 'title_c' } },
          { field: { Name: 'message_c' } },
          { field: { Name: 'type_c' } },
          { field: { Name: 'isRead_c' } },
          { field: { Name: 'createdAt_c' } },
          { field: { Name: 'link_c' } }
        ]
      });

      if (!response?.success) {
        console.error('Error fetching notification:', response?.message);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error in getById:', error?.message || error);
      return null;
    }
  },

  markAsRead: async (id) => {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.updateRecord('notifications_c', {
        records: [{ Id: id, isRead_c: true }]
      });

      if (!response?.success) {
        console.error('Error marking notification as read:', response?.message);
        return null;
      }

      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error('Error in markAsRead:', error?.message || error);
      return null;
    }
  },

  markAsUnread: async (id) => {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.updateRecord('notifications_c', {
        records: [{ Id: id, isRead_c: false }]
      });

      if (!response?.success) {
        console.error('Error marking notification as unread:', response?.message);
        return null;
      }

      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error('Error in markAsUnread:', error?.message || error);
      return null;
    }
  },

  markAllAsRead: async () => {
    try {
      const apperClient = getApperClient();
      
      const fetchResponse = await apperClient.fetchRecords('notifications_c', {
        fields: [{ field: { Name: 'Id' } }],
        where: [
          {
            FieldName: 'isRead_c',
            Operator: 'EqualTo',
            Values: [false]
          }
        ]
      });

      if (!fetchResponse?.success) {
        console.error('Error fetching unread notifications:', fetchResponse?.message);
        return [];
      }

      const unreadIds = fetchResponse.data?.map(n => n.Id) || [];
      
      if (unreadIds.length === 0) {
        return [];
      }

      const updateResponse = await apperClient.updateRecord('notifications_c', {
        records: unreadIds.map(id => ({ Id: id, isRead_c: true }))
      });

      if (!updateResponse?.success) {
        console.error('Error marking all as read:', updateResponse?.message);
        return [];
      }

      return updateResponse.results?.map(r => r.data) || [];
    } catch (error) {
      console.error('Error in markAllAsRead:', error?.message || error);
      return [];
    }
  },

  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.deleteRecord('notifications_c', {
        RecordIds: [id]
      });

      if (!response?.success) {
        console.error('Error deleting notification:', response?.message);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in delete:', error?.message || error);
      return { success: false };
    }
  },

  clearAll: async () => {
    try {
      const apperClient = getApperClient();
      
      const fetchResponse = await apperClient.fetchRecords('notifications_c', {
        fields: [{ field: { Name: 'Id' } }]
      });

      if (!fetchResponse?.success) {
        console.error('Error fetching notifications for clear:', fetchResponse?.message);
        return { success: false };
      }

      const allIds = fetchResponse.data?.map(n => n.Id) || [];
      
      if (allIds.length === 0) {
        return { success: true };
      }

      const deleteResponse = await apperClient.deleteRecord('notifications_c', {
        RecordIds: allIds
      });

      if (!deleteResponse?.success) {
        console.error('Error clearing all notifications:', deleteResponse?.message);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in clearAll:', error?.message || error);
      return { success: false };
    }
  },

  getGroupedByType: async (filters = {}) => {
    try {
      const result = await notificationService.getAll(filters);
      const grouped = {};

      result.data?.forEach(notification => {
        const type = notification.type_c || 'other';
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push(notification);
      });

      return { ...result, data: grouped };
    } catch (error) {
      console.error('Error in getGroupedByType:', error?.message || error);
      return { data: {}, total: 0, pageInfo: { limit: filters.limit || 20, offset: filters.offset || 0 } };
    }
  },

  getDisplayName: (type) => {
    const displayMap = {
      like: 'Likes',
      comment: 'Comments',
      award: 'Awards',
      mention: 'Mentions',
      follow: 'Follows',
      message: 'Messages',
    };

    return displayMap[type] || 'Notification';
  },

  getPreferences: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      throw new Error('Failed to load notification preferences');
    }
  },

  updatePreferences: async (preferences) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
      await new Promise(resolve => setTimeout(resolve, 400));
      
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

export default notificationService;
import { getApperClient } from "@/services/api/apperClientInit";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationService = {
  getUnreadCount: async () => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('notifications_c', {
        fields: [
          { field: { Name: 'Id' } },
          { field: { Name: 'isRead_c' } }
        ],
        where: [
          {
            FieldName: 'isRead_c',
            Operator: 'EqualTo',
            Values: [false],
            Include: true
          }
        ]
      });

      if (!response?.success) {
        console.error('Error fetching unread count:', response?.message);
        return 0;
      }

      return response.data?.length || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error?.message || error);
      return 0;
    }
  },

  getAll: async (filters = {}) => {
    try {
      const apperClient = getApperClient();
      
      // Build where conditions
      const whereConditions = [];
      
      if (filters.type) {
        whereConditions.push({
          FieldName: 'type_c',
          Operator: 'EqualTo',
          Values: [filters.type]
        });
      }

      if (filters.isRead !== undefined) {
        whereConditions.push({
          FieldName: 'isRead_c',
          Operator: 'EqualTo',
          Values: [filters.isRead]
        });
      }

      const response = await apperClient.fetchRecords('notifications_c', {
        fields: [
          { field: { Name: 'Id' } },
          { field: { Name: 'title_c' } },
          { field: { Name: 'message_c' } },
          { field: { Name: 'type_c' } },
          { field: { Name: 'isRead_c' } },
          { field: { Name: 'createdAt_c' } },
          { field: { Name: 'link_c' } }
        ],
        where: whereConditions,
        orderBy: [{ fieldName: 'createdAt_c', sorttype: 'DESC' }],
        pagingInfo: {
          limit: filters.limit || 20,
          offset: filters.offset || 0
        }
      });

      if (!response?.success) {
        console.error('Error fetching notifications:', response?.message);
        return { data: [], total: 0, pageInfo: { limit: filters.limit || 20, offset: filters.offset || 0 } };
      }

      return {
        data: response.data || [],
        total: response.total || 0,
        pageInfo: { limit: filters.limit || 20, offset: filters.offset || 0 }
      };
    } catch (error) {
      console.error('Error in getAll:', error?.message || error);
      return { data: [], total: 0, pageInfo: { limit: filters.limit || 20, offset: filters.offset || 0 } };
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.getRecordById('notifications_c', id, {
        fields: [
          { field: { Name: 'Id' } },
          { field: { Name: 'title_c' } },
          { field: { Name: 'message_c' } },
          { field: { Name: 'type_c' } },
          { field: { Name: 'isRead_c' } },
          { field: { Name: 'createdAt_c' } },
          { field: { Name: 'link_c' } }
        ]
      });

      if (!response?.success) {
        console.error('Error fetching notification:', response?.message);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error in getById:', error?.message || error);
      return null;
    }
  },

  markAsRead: async (id) => {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.updateRecord('notifications_c', {
        records: [{ Id: id, isRead_c: true }]
      });

      if (!response?.success) {
        console.error('Error marking notification as read:', response?.message);
        return null;
      }

      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error('Error in markAsRead:', error?.message || error);
      return null;
    }
  },

  markAsUnread: async (id) => {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.updateRecord('notifications_c', {
        records: [{ Id: id, isRead_c: false }]
      });

      if (!response?.success) {
        console.error('Error marking notification as unread:', response?.message);
        return null;
      }

      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error('Error in markAsUnread:', error?.message || error);
      return null;
    }
  },

  markAllAsRead: async () => {
    try {
      const apperClient = getApperClient();
      
      // First, fetch all unread notifications
      const fetchResponse = await apperClient.fetchRecords('notifications_c', {
        fields: [{ field: { Name: 'Id' } }],
        where: [
          {
            FieldName: 'isRead_c',
            Operator: 'EqualTo',
            Values: [false]
          }
        ]
      });

      if (!fetchResponse?.success) {
        console.error('Error fetching unread notifications:', fetchResponse?.message);
        return [];
      }

      const unreadIds = fetchResponse.data?.map(n => n.Id) || [];
      
      if (unreadIds.length === 0) {
        return [];
      }

      // Update all unread notifications
      const updateResponse = await apperClient.updateRecord('notifications_c', {
        records: unreadIds.map(id => ({ Id: id, isRead_c: true }))
      });

      if (!updateResponse?.success) {
        console.error('Error marking all as read:', updateResponse?.message);
        return [];
      }

      return updateResponse.results?.map(r => r.data) || [];
    } catch (error) {
      console.error('Error in markAllAsRead:', error?.message || error);
      return [];
    }
  },

  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.deleteRecord('notifications_c', {
        RecordIds: [id]
      });

      if (!response?.success) {
        console.error('Error deleting notification:', response?.message);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in delete:', error?.message || error);
      return { success: false };
    }
  },

  clearAll: async () => {
    try {
      const apperClient = getApperClient();
      
      // Fetch all notifications
      const fetchResponse = await apperClient.fetchRecords('notifications_c', {
        fields: [{ field: { Name: 'Id' } }]
      });

      if (!fetchResponse?.success) {
        console.error('Error fetching notifications for clear:', fetchResponse?.message);
        return { success: false };
      }

      const allIds = fetchResponse.data?.map(n => n.Id) || [];
      
      if (allIds.length === 0) {
        return { success: true };
      }

      // Delete all notifications
      const deleteResponse = await apperClient.deleteRecord('notifications_c', {
        RecordIds: allIds
      });

      if (!deleteResponse?.success) {
        console.error('Error clearing all notifications:', deleteResponse?.message);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in clearAll:', error?.message || error);
      return { success: false };
    }
  },

  getGroupedByType: async (filters = {}) => {
    try {
      const result = await notificationService.getAll(filters);
      const grouped = {};

      result.data?.forEach(notification => {
        const type = notification.type_c || 'other';
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push(notification);
      });

      return { ...result, data: grouped };
    } catch (error) {
      console.error('Error in getGroupedByType:', error?.message || error);
      return { data: {}, total: 0, pageInfo: { limit: filters.limit || 20, offset: filters.offset || 0 } };
    }
  },
getDisplayName: (type) => {
    const displayMap = {
      like: 'Likes',
      comment: 'Comments',
      award: 'Awards',
      mention: 'Mentions',
      follow: 'Follows',
      message: 'Messages',
    };

    return displayMap[type] || 'Notification';
  },

  getPreferences: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      throw new Error('Failed to load notification preferences');
    }
  },

  updatePreferences: async (preferences) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
      await new Promise(resolve => setTimeout(resolve, 400));
      
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

export default notificationService;

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