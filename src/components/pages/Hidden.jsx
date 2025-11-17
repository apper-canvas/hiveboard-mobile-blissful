import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, isValid } from "date-fns";
import { toast } from "react-toastify";
import { hiddenService } from "@/services/api/hiddenService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const Hidden = () => {
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadHiddenPosts();
  }, []);

  const loadHiddenPosts = async () => {
    setLoading(true);
    try {
      const posts = await hiddenService.getHiddenPosts();
      setHiddenPosts(posts);
    } catch (error) {
      toast.error('Failed to load hidden posts');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPosts = () => {
    return hiddenPosts.filter(post =>
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.communityName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleUnhidePost = async (postId) => {
    try {
      await hiddenService.unhidePost(postId);
      setHiddenPosts(prev => prev.filter(post => post.Id !== postId));
      setSelectedPosts(prev => prev.filter(id => id !== postId));
      toast.success('Post restored to feed');
    } catch (error) {
      toast.error('Failed to restore post');
    }
  };

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => {
      const isSelected = prev.includes(postId);
      if (isSelected) {
        return prev.filter(id => id !== postId);
      } else {
        return [...prev, postId];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredPosts = getFilteredPosts();
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(post => post.Id));
    }
  };

  const handleBulkUnhide = async () => {
    if (selectedPosts.length === 0) return;
    
    try {
      await hiddenService.bulkUnhide(selectedPosts);
      setHiddenPosts(prev => prev.filter(post => !selectedPosts.includes(post.Id)));
      setSelectedPosts([]);
      setShowBulkActions(false);
      toast.success(`Restored ${selectedPosts.length} posts to feed`);
    } catch (error) {
      toast.error('Failed to restore posts');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    
    if (confirm(`Permanently delete ${selectedPosts.length} hidden posts? This action cannot be undone.`)) {
      try {
        await hiddenService.bulkDelete(selectedPosts);
        setHiddenPosts(prev => prev.filter(post => !selectedPosts.includes(post.Id)));
        setSelectedPosts([]);
        setShowBulkActions(false);
        toast.success(`Deleted ${selectedPosts.length} posts permanently`);
      } catch (error) {
        toast.error('Failed to delete posts');
      }
    }
  };

  if (loading) return <Loading className="min-h-screen" />;

  const filteredPosts = getFilteredPosts();
  const hasSelectedPosts = selectedPosts.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hidden Posts</h1>
          <p className="text-gray-600">Manage posts you've hidden from your feed</p>
        </div>

        {/* Controls */}
        <div className="bg-surface rounded-lg border p-4 mb-6 space-y-4">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search hidden posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={() => {
                setShowBulkActions(!showBulkActions);
                setSelectedPosts([]);
              }}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="CheckSquare" className="w-4 h-4 mr-2" />
              Bulk Actions
            </Button>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedPosts.length} selected
                </span>
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                >
                  {selectedPosts.length === filteredPosts.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              {hasSelectedPosts && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkUnhide}
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    <ApperIcon name="Eye" className="w-4 h-4 mr-1" />
                    Restore to Feed
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4 mr-1" />
                    Delete Permanently
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {filteredPosts.length === 0 ? (
          <Empty
            title="No hidden posts found"
            message={searchTerm 
              ? "Try adjusting your search terms"
              : "You haven't hidden any posts yet"}
            actionText="Browse Posts"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.Id}
                className={`bg-surface rounded-lg border p-4 transition-colors ${
                  showBulkActions ? 'hover:bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {showBulkActions && (
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.Id)}
                      onChange={() => handleSelectPost(post.Id)}
                      className="mt-1"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <ApperIcon name="EyeOff" className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        Hidden Post
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Hidden from feed
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>
                      {post.content && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {post.content}
                        </p>
                      )}
<div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>r/{post.communityName}</span>
                          <span>{post?.createdAt && isValid(new Date(post.createdAt)) 
                            ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                            : 'Date unavailable'}</span>
                          <span>{post.upvotes || 0} upvotes</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleUnhidePost(post.Id)}
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                          >
                            <ApperIcon name="Eye" className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Stats */}
        {hiddenPosts.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <ApperIcon name="Info" className="w-4 h-4 mr-2" />
              You have {hiddenPosts.length} hidden post{hiddenPosts.length !== 1 ? 's' : ''}
              {searchTerm && ` (${filteredPosts.length} matching your search)`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hidden;