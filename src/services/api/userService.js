import usersData from "@/services/mockData/users.json";
import React from "react";

let users = [...usersData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  async getAll() {
    await delay(300);
    return [...users].sort((a, b) => b.karma - a.karma);
  },

  async getById(username) {
    await delay(200);
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      throw new Error("User not found");
    }
    return { ...user };
  },

async getCurrentUser() {
    await delay(150);
    // For demo purposes, return a mock current user with full profile
    return {
      username: "current_user",
      displayName: "Current User",
      karma: 1337,
      joinedAt: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
      subscribedCommunities: ["technology", "programming", "science"],
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      banner: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=200&fit=crop",
      bio: "Just your average tech enthusiast exploring the digital frontier.",
      socialLinks: [
        { platform: "twitter", url: "https://twitter.com/currentuser" },
        { platform: "github", url: "https://github.com/currentuser" }
      ],
      isOnline: true,
      followers: 156,
      following: ["tech_researcher", "space_explorer"],
      achievements: [
        { name: "First Post", description: "Made your first post" },
        { name: "Commenter", description: "Posted 100 comments" },
        { name: "Popular", description: "Received 1000+ karma" }
      ]
    };
  },

  async search(query) {
    await delay(200);
    const searchTerm = query.toLowerCase();
    return users.filter(u => u.username.toLowerCase().includes(searchTerm));
  },

async create(userData) {
    await delay(400);
    const newUser = {
      username: userData.username.toLowerCase(),
      displayName: userData.displayName || userData.username,
      karma: 0,
      joinedAt: Date.now(),
      subscribedCommunities: [],
      avatar: userData.avatar || null,
      banner: userData.banner || null,
      bio: userData.bio || "",
      socialLinks: userData.socialLinks || [],
      isOnline: true,
      followers: 0,
      following: [],
      achievements: [
        { name: "New User", description: "Welcome to the community!" }
      ]
    };
    
    users.push(newUser);
    return { ...newUser };
  },

async update(username, data) {
    await delay(300);
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    
    // Ensure we don't overwrite critical fields accidentally
    const updatableFields = ['displayName', 'bio', 'avatar', 'banner', 'socialLinks', 'isOnline'];
    const filteredData = Object.keys(data)
      .filter(key => updatableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});
    
    users[userIndex] = { ...users[userIndex], ...filteredData };
    return { ...users[userIndex] };
  },

  async delete(username) {
    await delay(300);
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex === -1) {
      throw new Error("User not found");
    }
users.splice(userIndex, 1);
    return true;
  },

  // Block user functionality
  async blockUser(userId) {
    await delay(300);
    // In a real app, this would update user preferences/blocked list
    // For now, we'll just simulate the API call
    return { success: true, message: 'User blocked successfully' };
  },

  // Unblock user functionality  
  async unblockUser(userId) {
    await delay(300);
    // In a real app, this would remove from blocked list
    return { success: true, message: 'User unblocked successfully' };
  },

  // Get blocked users list
  async getBlockedUsers() {
    await delay(200);
    // In a real app, this would fetch from user preferences
    return [];
  },

  // Report user functionality
  async reportUser(userId, reason) {
    await delay(400);
    // In a real app, this would submit to moderation system
    return { success: true, message: 'User reported successfully' };
  }
};