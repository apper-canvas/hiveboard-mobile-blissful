import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { notificationService } from "@/services/api/notificationService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const notificationTypes = [
    {
      id: 'upvote_post',
      label: 'Post Upvotes',
      description: 'When someone upvotes your posts',
      icon: 'ArrowUp',
      category: 'engagement'
    },
    {
      id: 'upvote_comment',
      label: 'Comment Upvotes', 
      description: 'When someone upvotes your comments',
      icon: 'ArrowUp',
      category: 'engagement'
    },
    {
      id: 'reply',
      label: 'Replies',
      description: 'When someone replies to your posts or comments',
      icon: 'MessageCircle',
      category: 'social'
    },
    {
      id: 'mention',
      label: 'Mentions',
      description: 'When someone mentions you in posts or comments',
      icon: 'AtSign',
      category: 'social'
    },
    {
      id: 'new_follower',
      label: 'New Followers',
      description: 'When someone follows you',
      icon: 'UserPlus',
      category: 'social'
    },
    {
      id: 'award',
      label: 'Awards',
      description: 'When you receive awards on your content',
      icon: 'Award',
      category: 'engagement'
    },
    {
      id: 'content_removed',
      label: 'Content Removal',
      description: 'When your content is removed by moderators',
      icon: 'Trash2',
      category: 'moderation'
    },
    {
      id: 'ban',
      label: 'Bans & Warnings',
      description: 'When you receive bans or warnings',
      icon: 'Shield',
      category: 'moderation'
    },
    {
      id: 'mod_invite',
      label: 'Moderator Invites',
      description: 'When you are invited to moderate a community',
      icon: 'Crown',
      category: 'moderation'
    },
    {
      id: 'message',
      label: 'Direct Messages',
      description: 'When you receive direct messages',
      icon: 'Mail',
      category: 'social'
    }
  ];

  const categories = [
    { id: 'engagement', label: 'Engagement', icon: 'Heart', color: 'text-red-500' },
    { id: 'social', label: 'Social', icon: 'Users', color: 'text-blue-500' },
    { id: 'moderation', label: 'Moderation', icon: 'Shield', color: 'text-orange-500' }
  ];

  const frequencyOptions = [
    { value: 'instant', label: 'Instant', description: 'Get notified immediately' },
    { value: 'hourly', label: 'Hourly', description: 'Bundled notifications every hour' },
    { value: 'daily', label: 'Daily', description: 'Daily digest at 9 AM' },
    { value: 'weekly', label: 'Weekly', description: 'Weekly summary on Sundays' }
  ];

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError(err.message || 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleType = async (typeId) => {
    try {
      setSaving(true);
      const updatedPreferences = {
        ...preferences,
        types: {
          ...preferences.types,
          [typeId]: !preferences.types[typeId]
        }
      };
      
      await notificationService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      toast.success(`${notificationTypes.find(t => t.id === typeId)?.label} notifications ${updatedPreferences.types[typeId] ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Error updating preferences:', err);
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDelivery = async (method) => {
    try {
      setSaving(true);
      const updatedPreferences = {
        ...preferences,
        delivery: {
          ...preferences.delivery,
          [method]: !preferences.delivery[method]
        }
      };
      
      await notificationService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      toast.success(`${method === 'email' ? 'Email' : 'Push'} notifications ${updatedPreferences.delivery[method] ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Error updating preferences:', err);
      toast.error('Failed to update delivery preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = async (frequency) => {
    try {
      setSaving(true);
      const updatedPreferences = {
        ...preferences,
        frequency
      };
      
      await notificationService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      toast.success(`Notification frequency changed to ${frequencyOptions.find(f => f.value === frequency)?.label.toLowerCase()}`);
    } catch (err) {
      console.error('Error updating preferences:', err);
      toast.error('Failed to update notification frequency');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategory = async (categoryId) => {
    const categoryTypes = notificationTypes.filter(type => type.category === categoryId);
    const allEnabled = categoryTypes.every(type => preferences.types[type.id]);
    const newValue = !allEnabled;
    
    try {
      setSaving(true);
      const updatedTypes = { ...preferences.types };
      categoryTypes.forEach(type => {
        updatedTypes[type.id] = newValue;
      });
      
      const updatedPreferences = {
        ...preferences,
        types: updatedTypes
      };
      
      await notificationService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      
      const categoryLabel = categories.find(c => c.id === categoryId)?.label;
      toast.success(`${categoryLabel} notifications ${newValue ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Error updating preferences:', err);
      toast.error('Failed to update category preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all notification preferences to defaults? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const defaultPreferences = await notificationService.resetPreferences();
      setPreferences(defaultPreferences);
      toast.success('Notification preferences reset to defaults');
    } catch (err) {
      console.error('Error resetting preferences:', err);
      toast.error('Failed to reset notification preferences');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  if (loading) {
    return <Loading className="min-h-screen" />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error} 
        onRetry={loadPreferences}
        className="min-h-screen" 
      />
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <ApperIcon name="Settings" className="w-8 h-8 text-primary" />
                Notification Preferences
              </h1>
              <p className="text-gray-600">
                Customize how and when you receive notifications
              </p>
            </div>
            
            <Button
              onClick={handleResetToDefaults}
              disabled={saving}
              variant="secondary"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <ApperIcon name="RotateCcw" className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Methods */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ApperIcon name="Send" className="w-5 h-5 text-primary" />
                Delivery Methods
              </h2>
              
              <div className="space-y-4">
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Mail" className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-600">Receive notifications via email for important events</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleDelivery('email')}
                    disabled={saving}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      preferences.delivery.email ? "bg-primary" : "bg-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5",
                      preferences.delivery.email ? "translate-x-6" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Smartphone" className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Push Notifications</div>
                      <div className="text-sm text-gray-600">Receive notifications on your device</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleDelivery('push')}
                    disabled={saving}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      preferences.delivery.push ? "bg-primary" : "bg-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5",
                      preferences.delivery.push ? "translate-x-6" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            {/* Frequency Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ApperIcon name="Clock" className="w-5 h-5 text-primary" />
                Frequency
              </h2>
              
              <div className="space-y-3">
                {frequencyOptions.map(option => (
                  <div
                    key={option.value}
                    onClick={() => handleFrequencyChange(option.value)}
                    className={cn(
                      "p-4 rounded-xl cursor-pointer transition-colors border-2",
                      preferences.frequency === option.value
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                      
                      {preferences.frequency === option.value && (
                        <ApperIcon name="Check" className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Types by Category */}
            {categories.map(category => {
              const categoryTypes = notificationTypes.filter(type => type.category === category.id);
              const enabledCount = categoryTypes.filter(type => preferences.types[type.id]).length;
              const allEnabled = enabledCount === categoryTypes.length;
              
              return (
                <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <ApperIcon name={category.icon} className={cn("w-5 h-5", category.color)} />
                      {category.label} Notifications
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({enabledCount}/{categoryTypes.length} enabled)
                      </span>
                    </h2>
                    
                    <Button
                      onClick={() => handleToggleCategory(category.id)}
                      disabled={saving}
                      variant="secondary"
                      size="sm"
                    >
                      {allEnabled ? 'Disable All' : 'Enable All'}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {categoryTypes.map(type => (
                      <div
                        key={type.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            preferences.types[type.id] ? "bg-blue-100" : "bg-gray-200"
                          )}>
                            <ApperIcon 
                              name={type.icon} 
                              className={cn(
                                "w-5 h-5",
                                preferences.types[type.id] ? "text-blue-600" : "text-gray-500"
                              )} 
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{type.label}</div>
                            <div className="text-sm text-gray-600">{type.description}</div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleToggleType(type.id)}
                          disabled={saving}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            preferences.types[type.id] ? "bg-primary" : "bg-gray-300"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5",
                            preferences.types[type.id] ? "translate-x-6" : "translate-x-0.5"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ApperIcon name="BarChart3" className="w-5 h-5 text-primary" />
                Settings Overview
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Enabled Types</span>
                  <span className="font-bold text-primary">
                    {Object.values(preferences.types).filter(Boolean).length}/{notificationTypes.length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email Notifications</span>
                  <span className={cn(
                    "font-bold",
                    preferences.delivery.email ? "text-green-600" : "text-gray-400"
                  )}>
                    {preferences.delivery.email ? 'On' : 'Off'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Push Notifications</span>
                  <span className={cn(
                    "font-bold",
                    preferences.delivery.push ? "text-green-600" : "text-gray-400"
                  )}>
                    {preferences.delivery.push ? 'On' : 'Off'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Frequency</span>
                  <span className="font-bold text-primary capitalize">
                    {preferences.frequency}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ApperIcon name="Lightbulb" className="w-5 h-5 text-amber-500" />
                Tips
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <ApperIcon name="CheckCircle" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Use "Hourly" or "Daily" frequency to reduce notification overload
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  <ApperIcon name="CheckCircle" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Enable push notifications for important updates like mentions
                  </span>
                </div>
                
                <div className="flex items-start gap-2">
                  <ApperIcon name="CheckCircle" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Disable engagement notifications if you prefer fewer interruptions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;