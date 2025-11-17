import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow, isValid } from "date-fns";
import { toast } from "react-toastify";
import { savedService } from "@/services/api/savedService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const Saved = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedComments, setSavedComments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedContent();
  }, []);

  const loadSavedContent = async () => {
    setLoading(true);
    try {
      const [posts, comments, cats] = await Promise.all([
        savedService.getSavedPosts(),
        savedService.getSavedComments(),
        savedService.getCategories()
      ]);
      
      // Enhance posts and comments with category info and type
      const enhancedPosts = posts.map(post => ({
        ...post,
        type: 'post',
        category: savedService.getItemCategory(post.Id, 'post')
      }));
      
      const enhancedComments = comments.map(comment => ({
        ...comment,
        type: 'comment',
        category: savedService.getItemCategory(comment.Id, 'comment')
      }));
      
      setSavedPosts(enhancedPosts);
      setSavedComments(enhancedComments);
      setCategories(['all', 'uncategorized', ...cats]);
    } catch (error) {
      toast.error('Failed to load saved content');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    const items = activeTab === 'posts' ? savedPosts : savedComments;
    
    let filtered = items.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedCategory === 'all') return matchesSearch;
      if (selectedCategory === 'uncategorized') return matchesSearch && !item.category;
      return matchesSearch && item.category === selectedCategory;
    });
    
    return filtered;
  };

  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.Id === item.Id && selected.type === item.type);
      if (isSelected) {
        return prev.filter(selected => !(selected.Id === item.Id && selected.type === item.type));
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSelectAll = () => {
    const items = getFilteredItems();
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items);
    }
  };

  const handleBulkUnsave = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await savedService.bulkUnsave(selectedItems);
      toast.success(`Removed ${selectedItems.length} items from saved`);
      setSelectedItems([]);
      setShowBulkActions(false);
      loadSavedContent();
    } catch (error) {
      toast.error('Failed to remove items from saved');
    }
  };

  const handleBulkCategorize = async (category) => {
    if (selectedItems.length === 0) return;
    
    try {
      await savedService.bulkCategorize(selectedItems, category);
      toast.success(`Added ${selectedItems.length} items to ${category}`);
      setSelectedItems([]);
      setShowBulkActions(false);
      loadSavedContent();
    } catch (error) {
      toast.error('Failed to categorize items');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const updatedCategories = await savedService.createCategory(newCategory.trim());
      setCategories(['all', 'uncategorized', ...updatedCategories]);
      setNewCategory('');
      setShowCreateCategory(false);
      toast.success('Category created successfully');
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (categoryName === 'all' || categoryName === 'uncategorized') return;
    
    try {
      const updatedCategories = await savedService.deleteCategory(categoryName);
      setCategories(['all', 'uncategorized', ...updatedCategories]);
      if (selectedCategory === categoryName) {
        setSelectedCategory('all');
      }
      toast.success('Category deleted successfully');
      loadSavedContent();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) return <Loading className="min-h-screen" />;

  const filteredItems = getFilteredItems();
  const hasSelectedItems = selectedItems.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Content</h1>
          <p className="text-gray-600">Manage your bookmarked posts and comments</p>
        </div>

        {/* Controls */}
        <div className="bg-surface rounded-lg border p-4 mb-6 space-y-4">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab('posts');
                setSelectedItems([]);
                setShowBulkActions(false);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'posts' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ApperIcon name="FileText" className="w-4 h-4" />
                Posts ({savedPosts.length})
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('comments');
                setSelectedItems([]);
                setShowBulkActions(false);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'comments' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ApperIcon name="MessageSquare" className="w-4 h-4" />
                Comments ({savedComments.length})
              </div>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={`Search saved ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : 
                     category === 'uncategorized' ? 'Uncategorized' : 
                     category}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => setShowCreateCategory(true)}
                variant="outline"
                size="sm"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions Toggle */}
          <div className="flex items-center justify-between">
            <Button
              onClick={() => {
                setShowBulkActions(!showBulkActions);
                setSelectedItems([]);
              }}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="CheckSquare" className="w-4 h-4 mr-2" />
              Bulk Actions
            </Button>
            
            {showBulkActions && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} selected
                </span>
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                >
                  {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            )}
          </div>

          {/* Bulk Action Buttons */}
          {showBulkActions && hasSelectedItems && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button
                onClick={handleBulkUnsave}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <ApperIcon name="Trash2" className="w-4 h-4 mr-1" />
                Remove from Saved
              </Button>
              {categories.filter(c => c !== 'all' && c !== 'uncategorized').map(category => (
                <Button
                  key={category}
                  onClick={() => handleBulkCategorize(category)}
                  variant="outline"
                  size="sm"
                >
                  Add to {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Category Management Modal */}
        {showCreateCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
              <Input
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full mb-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCategory();
                  if (e.key === 'Escape') setShowCreateCategory(false);
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setShowCreateCategory(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  disabled={!newCategory.trim()}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {filteredItems.length === 0 ? (
          <Empty
            title={`No saved ${activeTab} found`}
            message={searchTerm || selectedCategory !== 'all' 
              ? `Try adjusting your search or category filter`
              : `Start saving ${activeTab} to see them here`}
            actionText="Browse Content"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={`${item.type}-${item.Id}`}
                className={`bg-surface rounded-lg border p-4 transition-colors ${
                  showBulkActions ? 'hover:bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {showBulkActions && (
                    <input
                      type="checkbox"
                      checked={selectedItems.some(selected => 
                        selected.Id === item.Id && selected.type === item.type
                      )}
                      onChange={() => handleSelectItem(item)}
                      className="mt-1"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <ApperIcon 
                        name={item.type === 'post' ? 'FileText' : 'MessageSquare'} 
                        className="w-4 h-4 text-gray-500" 
                      />
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {item.type}
                      </span>
                      {item.category && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>
                    
                    {item.type === 'post' ? (
                      <div>
                        <Link
                          to={`/post/${item.Id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary mb-2 block"
                        >
                          {item.title}
                        </Link>
                        {item.content && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {item.content}
                          </p>
                        )}
<div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>r/{item.communityName}</span>
                          <span>{item?.createdAt && isValid(new Date(item.createdAt)) 
                            ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                            : 'Date unavailable'}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-900 mb-2">{item.content}</p>
<div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{item?.createdAt && isValid(new Date(item.createdAt)) 
                            ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                            : 'Date unavailable'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;