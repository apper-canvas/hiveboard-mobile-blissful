import { postService } from './postService';
import { commentService } from './commentService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Custom categories for saved content
let customCategories = JSON.parse(localStorage.getItem('savedCategories') || '["Reading List", "Favorites", "Later"]');

export const savedService = {
// Get all saved posts
  async getSavedPosts() {
    return await postService.getSavedPosts();
  },
  
  // Get all saved comments
  async getSavedComments() {
    return await commentService.getSavedComments();
  },

  // Get saved content for user profile
  async getUserSavedContent(username) {
    await delay(300);
    const [savedPosts, savedComments] = await Promise.all([
      this.getSavedPosts(),
      this.getSavedComments()
    ]);
    return {
      posts: savedPosts,
      comments: savedComments,
      total: savedPosts.length + savedComments.length
    };
  },
  
  // Category management
  async getCategories() {
    await delay(100);
    return [...customCategories];
  },
  
  async createCategory(name) {
    await delay(200);
    if (!customCategories.includes(name)) {
      customCategories.push(name);
      localStorage.setItem('savedCategories', JSON.stringify(customCategories));
    }
    return customCategories;
  },
  
  async deleteCategory(name) {
    await delay(200);
    customCategories = customCategories.filter(cat => cat !== name);
    localStorage.setItem('savedCategories', JSON.stringify(customCategories));
    
    // Remove category assignments from saved items
    const savedWithCategories = JSON.parse(localStorage.getItem('savedItemCategories') || '{}');
    Object.keys(savedWithCategories).forEach(key => {
      if (savedWithCategories[key] === name) {
        delete savedWithCategories[key];
      }
    });
    localStorage.setItem('savedItemCategories', JSON.stringify(savedWithCategories));
    
    return customCategories;
  },
  
// Item-category assignments
  async assignToCategory(itemId, category, itemType) {
    await delay(200);
    const savedCategories = JSON.parse(localStorage.getItem('savedItemCategories') || '{}');
    const key = `${itemType}_${itemId}`;
    savedCategories[key] = category;
    localStorage.setItem('savedItemCategories', JSON.stringify(savedCategories));
    return true;
  },
  
  async removeFromCategory(itemId, itemType) {
    await delay(200);
    const savedCategories = JSON.parse(localStorage.getItem('savedItemCategories') || '{}');
    const key = `${itemType}_${itemId}`;
    delete savedCategories[key];
    localStorage.setItem('savedItemCategories', JSON.stringify(savedCategories));
    return true;
  },
  
  getItemCategory(itemId, itemType) {
    const savedCategories = JSON.parse(localStorage.getItem('savedItemCategories') || '{}');
    const key = `${itemType}_${itemId}`;
    return savedCategories[key] || null;
  },
  
  // Bulk operations
async bulkUnsave(items) {
    await delay(400);
    const results = [];
    
    for (const item of items) {
      try {
        if (item.type === 'post') {
          await postService.unsavePost(item.Id);
        } else if (item.type === 'comment') {
          await commentService.unsaveComment(item.Id);
        }
        await this.removeFromCategory(item.Id, item.type);
        results.push({ id: item.Id, success: true });
      } catch (error) {
        results.push({ id: item.Id, success: false, error: error.message });
      }
    }
    
    return results;
  },
  
  async bulkCategorize(items, category) {
    await delay(400);
    const results = [];
    
    for (const item of items) {
      try {
        await this.assignToCategory(item.Id, category, item.type);
        results.push({ id: item.Id, success: true });
      } catch (error) {
        results.push({ id: item.Id, success: false, error: error.message });
      }
    }
    
    return results;
  },

  // Get user's saved content for profile display
  async getProfileSavedContent(username) {
    await delay(300);
    // In a real app, this would filter by username
    // For now, return all saved content as if it belongs to the current user
    const [posts, comments] = await Promise.all([
      this.getSavedPosts(),
      this.getSavedComments()
    ]);
    return [...posts.map(p => ({...p, type: 'post'})), ...comments.map(c => ({...c, type: 'comment'}))];
  }
};