// Mock data and services for messaging functionality

// Helper function to simulate network delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock message threads for each conversation
const messageThreads = {
  1: [
    {
      Id: 14,
      conversationId: 1,
      senderId: 1,
      content: "Hey Sarah! Did you see the **latest discussion** in r/technology? \n\n```javascript\nconst example = 'markdown support';\n```",
      timestamp: "2024-01-20T14:15:00Z",
      isRead: true,
      parentId: null,
      isReported: false
    },
    {
      Id: 15,
      conversationId: 1,
      senderId: 2,
      content: "Thanks for sharing that article! *Really insightful* perspective on community building.\n\n> This is a great example of how communities can grow organically.",
      timestamp: "2024-01-20T14:30:00Z",
      isRead: false,
      parentId: null,
      isReported: false
    },
    {
      Id: 16,
      conversationId: 1,
      senderId: 1,
      content: "Absolutely! The key is **consistency** and *authentic engagement*.",
      timestamp: "2024-01-20T14:35:00Z",
      isRead: true,
      parentId: 15,
      isReported: false
    }
  ],
  2: [
    {
      Id: 22,
      conversationId: 2,
      senderId: 3,
      content: "Hi John! I need help setting up community guidelines for my new subreddit.\n\n**Areas I need help with:**\n- Content moderation\n- User engagement\n- Growth strategies",
      timestamp: "2024-01-20T09:45:00Z",
      isRead: true,
      parentId: null,
      isReported: false
    },
    {
      Id: 23,
      conversationId: 2,
      senderId: 1,
      content: "Sure, I can help you set up the community guidelines. When works for you?\n\n*Tip:* Start with basic rules and expand as your community grows.",
      timestamp: "2024-01-20T10:15:00Z",
      isRead: true,
      parentId: null,
      isReported: false
    },
    {
      Id: 24,
      conversationId: 2,
      senderId: 3,
      content: "How about tomorrow afternoon? Thanks for the tip!",
      timestamp: "2024-01-20T10:20:00Z",
      isRead: false,
      parentId: 23,
      isReported: false
    }
  ],
  3: [
    {
      Id: 30,
      conversationId: 3,
      senderId: 1,
      content: "Thanks for reading my post! \n\n[Link to post](https://example.com/post)\n\n~~Let me know~~ Please share your thoughts!",
      timestamp: "2024-01-19T16:30:00Z",
      isRead: true,
      parentId: null,
      isReported: false
    },
    {
      Id: 31,
      conversationId: 3,
      senderId: 4,
      content: "Hey! Loved your post about **sustainable tech**. We should collaborate on something similar.\n\n- I have experience with green energy\n- Also working on carbon footprint reduction\n- Would love to combine our expertise!",
      timestamp: "2024-01-19T16:45:00Z",
      isRead: false,
      parentId: null,
      isReported: false
    }
  ],
  4: [
    {
      Id: 41,
      conversationId: 4,
      senderId: 1,
      content: "Great to see everyone at the meetup! Thanks for coming.\n\n**Next steps:**\n1. Follow up with action items\n2. Schedule next meeting\n3. Share resources",
      timestamp: "2024-01-18T19:10:00Z",
      isRead: true,
      parentId: null,
      isReported: false
    },
    {
      Id: 42,
      conversationId: 4,
      senderId: 5,
      content: "The community meetup was *amazing*! Thanks for organizing it.\n\nLooking forward to implementing the ideas we discussed.",
      timestamp: "2024-01-18T19:20:00Z",
      isRead: true,
      parentId: null,
      isReported: false
    }
  ],
  5: [
    {
      Id: 54,
      conversationId: 5,
      senderId: 1,
      content: "Sure, let me know what questions you have about the rollout.\n\n**Available times:**\n- Tomorrow 2-4 PM\n- Thursday morning\n- Friday afternoon",
      timestamp: "2024-01-17T11:20:00Z",
      isRead: true,
      parentId: null,
      isReported: false
    },
    {
      Id: 55,
      conversationId: 5,
      senderId: 6,
      content: "Question about the new feature rollout - do you have time for a quick call?",
      timestamp: "2024-01-17T11:30:00Z",
      isRead: false,
      parentId: null,
      isReported: false
    },
    {
      Id: 56,
      conversationId: 5,
      senderId: 6,
      content: "Also, I noticed some issues with the mobile interface. Should I create a bug report?\n\n**Issues found:**\n- Layout breaks on small screens\n- Buttons too small for touch\n- Text overflow problems",
      timestamp: "2024-01-17T11:32:00Z",
      isRead: false,
      parentId: 55,
      isReported: false
    },
    {
      Id: 57,
      conversationId: 5,
      senderId: 6,
      content: "Let me know when you're available! 📅",
      timestamp: "2024-01-17T11:35:00Z",
      isRead: false,
      parentId: 55,
      isReported: false
    }
  ]
};

let conversations = Object.keys(messageThreads).map((convId) => ({
  Id: parseInt(convId),
  participantIds: [1, 2, 3, 4, 5, 6],
  lastMessage: messageThreads[parseInt(convId)][messageThreads[parseInt(convId)].length - 1],
  updatedAt: messageThreads[parseInt(convId)][messageThreads[parseInt(convId)].length - 1].timestamp
}));
let nextConversationId = Math.max(...Object.keys(messageThreads).map(Number)) + 1;
let nextMessageId = Math.max(...Object.values(messageThreads).flat().map(m => m.Id)) + 1;

export const messageService = {
  // Get all conversations for current user
  async getConversations() {
    await delay(300);
    return conversations.map(conv => ({ ...conv })).sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  },

  // Get messages for a specific conversation
  async getMessages(conversationId) {
    await delay(200);
    const messages = messageThreads[conversationId] || [];
    return messages.map(msg => ({ ...msg }));
  },

  // Send a new message
  async sendMessage(conversationId, content, senderId = 1) {
    await delay(400);
    
const newMessage = {
      Id: nextMessageId++,
      conversationId: parseInt(conversationId),
      senderId: parseInt(senderId),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      parentId: null,
      isReported: false
    };

    // Add message to thread
    if (!messageThreads[conversationId]) {
      messageThreads[conversationId] = [];
    }
    messageThreads[conversationId].push(newMessage);

    // Update conversation last message and timestamp
    const convIndex = conversations.findIndex(c => c.Id === parseInt(conversationId));
    if (convIndex !== -1) {
      conversations[convIndex].lastMessage = { ...newMessage };
      conversations[convIndex].updatedAt = newMessage.timestamp;
      
      // Update unread count for other participants
      if (senderId !== 1) {
        conversations[convIndex].unreadCount = (conversations[convIndex].unreadCount || 0) + 1;
      }
    }

    return newMessage;
  },

  // Send reply to a message
  async sendReply(conversationId, content, parentId, senderId = 1) {
    await delay(300);
    
    const newReply = {
      Id: nextMessageId++,
      conversationId: parseInt(conversationId),
      senderId: parseInt(senderId),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      parentId: parseInt(parentId),
      isReported: false
    };

    // Add reply to thread
    if (!messageThreads[conversationId]) {
      messageThreads[conversationId] = [];
    }
    messageThreads[conversationId].push(newReply);

    // Update conversation last message and timestamp
    const convIndex = conversations.findIndex(c => c.Id === parseInt(conversationId));
    if (convIndex !== -1) {
      conversations[convIndex].lastMessage = { ...newReply };
      conversations[convIndex].updatedAt = newReply.timestamp;
      
      // Update unread count for other participants
      if (senderId !== 1) {
        conversations[convIndex].unreadCount = (conversations[convIndex].unreadCount || 0) + 1;
      }
    }

    return newReply;
  },

  // Start a new conversation
  async startConversation(participantUsername, initialMessage) {
    await delay(500);
    
    // For demo, create a mock participant
    const participant = {
      Id: Math.floor(Math.random() * 1000) + 100,
      username: participantUsername,
      avatar: null
    };

    const newConversation = {
      Id: nextConversationId++,
      participants: [
        { Id: 1, username: "john_doe", avatar: null },
        participant
      ],
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString()
    };

    conversations.unshift(newConversation);

    // Send initial message if provided
if (initialMessage?.trim()) {
      const firstMessage = await this.sendMessage(newConversation.Id, initialMessage, 1);
      newConversation.lastMessage = firstMessage;
    }

    return newConversation;
  },

  // Mark messages as read
  async markAsRead(conversationId) {
    await delay(200);
    
    // Mark all messages in conversation as read
    if (messageThreads[conversationId]) {
      messageThreads[conversationId].forEach(msg => {
        if (msg.senderId !== 1) { // Don't mark own messages as read
          msg.isRead = true;
        }
      });
    }

    // Reset unread count for conversation
    const convIndex = conversations.findIndex(c => c.Id === parseInt(conversationId));
    if (convIndex !== -1) {
      conversations[convIndex].unreadCount = 0;
    }

    return true;
  },

  // Mark messages as unread
  async markAsUnread(conversationId) {
    await delay(200);
    
    // Mark last message from other user as unread
    if (messageThreads[conversationId]) {
      const messages = messageThreads[conversationId];
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].senderId !== 1) {
          messages[i].isRead = false;
          break;
        }
      }
    }

    // Set unread count for conversation
    const convIndex = conversations.findIndex(c => c.Id === parseInt(conversationId));
    if (convIndex !== -1) {
      conversations[convIndex].unreadCount = 1;
    }

    return true;
  },

  // Report message as spam
  async reportSpam(messageId, reason) {
    await delay(300);
    
    // Find and mark message as reported
    for (const conversationId in messageThreads) {
      const messages = messageThreads[conversationId];
      const message = messages.find(m => m.Id === parseInt(messageId));
      if (message) {
        message.isReported = true;
        message.reportReason = reason;
        message.reportedAt = new Date().toISOString();
        break;
      }
    }

    return true;
  },

  // Get total unread message count
async getUnreadCount() {
    await delay(100);
    return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  },

  // Get blocked users
  async getBlockedUsers() {
    await delay(200);
    // In a real app, this would fetch from user preferences
    return [];
  },

  // Block/unblock functionality is handled in userService
  // but we keep conversation filtering logic here
  async getFilteredConversations(blockedUserIds = []) {
    await delay(300);
    return conversations.filter(conv => 
      !conv.participants.some(p => 
        blockedUserIds.includes(p.Id) && p.Id !== 1
      )
    );
  },

  // Search conversations
  async searchConversations(query) {
    await delay(300);
    
    if (!query.trim()) {
      return this.getConversations();
    }

    const searchTerm = query.toLowerCase();
    return conversations.filter(conv => {
      // Search in participant usernames
      const hasMatchingParticipant = conv.participants.some(p => 
        p.username.toLowerCase().includes(searchTerm)
      );
      
      // Search in last message content
      const hasMatchingMessage = conv.lastMessage?.content?.toLowerCase().includes(searchTerm);
      
      return hasMatchingParticipant || hasMatchingMessage;
    });
  },

  // Delete conversation
  async deleteConversation(conversationId) {
    await delay(300);
    
    const index = conversations.findIndex(c => c.Id === parseInt(conversationId));
    if (index !== -1) {
      conversations.splice(index, 1);
      delete messageThreads[conversationId];
      return true;
    }
    return false;
}
};