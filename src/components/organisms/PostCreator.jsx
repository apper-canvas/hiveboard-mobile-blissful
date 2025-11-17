import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import { postService } from '@/services/api/postService';
import { communityService } from '@/services/api/communityService';
import { cn } from '@/utils/cn';

const PostCreator = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [errors, setErrors] = useState({});

const [formData, setFormData] = useState({
    title: '',
    content: '',
    communityName: '',
    flair: '',
    isNSFW: false,
    isSpoiler: false,
    isOC: false,
    contentType: 'text',
    url: '',
    pollOptions: ['', ''],
    pollDuration: 1
  });

  useEffect(() => {
    if (isOpen) {
      loadCommunities();
    }
  }, [isOpen]);

  const loadCommunities = async () => {
    try {
      const data = await communityService.getAll();
      setCommunities(data);
    } catch (error) {
      console.error('Failed to load communities:', error);
    }
  };

  const tabs = [
    { id: 'text', label: 'Post', icon: 'FileText' },
    { id: 'media', label: 'Image & Video', icon: 'Image' },
    { id: 'link', label: 'Link', icon: 'Link' },
    { id: 'poll', label: 'Poll', icon: 'BarChart3' }
  ];

  const flairOptions = [
    'Discussion', 'News', 'Question', 'Tutorial', 'Review', 
    'Announcement', 'Meta', 'Humor', 'Art', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const addPollOption = () => {
    if (formData.pollOptions.length < 6) {
      setFormData(prev => ({
        ...prev,
        pollOptions: [...prev.pollOptions, '']
      }));
    }
  };

  const removePollOption = (index) => {
    if (formData.pollOptions.length > 2) {
      setFormData(prev => ({
        ...prev,
        pollOptions: prev.pollOptions.filter((_, i) => i !== index)
      }));
    }
  };

  const updatePollOption = (index, value) => {
    setFormData(prev => ({
      ...prev,
      pollOptions: prev.pollOptions.map((option, i) => i === index ? value : option)
    }));
  };

const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 300) {
      newErrors.title = 'Title must be 300 characters or less';
    }

    if (!formData.communityName) {
      newErrors.communityName = 'Please select a community';
    }

    if (activeTab === 'text' && !formData.content.trim()) {
      newErrors.content = 'Post content is required';
    }

    if (activeTab === 'link' && !formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (activeTab === 'link' && formData.url.trim() && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (activeTab === 'poll') {
      const validOptions = formData.pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        newErrors.pollOptions = 'At least 2 poll options are required';
      }
      if (!formData.pollDuration || formData.pollDuration < 1 || formData.pollDuration > 7) {
        newErrors.pollDuration = 'Please select a poll duration (1-7 days)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
try {
      const postData = {
        title: formData.title.trim(),
        content: activeTab === 'text' ? formData.content.trim() : 
                activeTab === 'link' ? formData.url.trim() : 
                activeTab === 'poll' ? JSON.stringify(formData.pollOptions.filter(opt => opt.trim())) : '',
        contentType: activeTab,
        communityName: formData.communityName,
        authorUsername: 'currentUser',
        flair: formData.flair,
        isNSFW: formData.isNSFW,
        isSpoiler: formData.isSpoiler,
        isOC: formData.isOC,
        pollDuration: activeTab === 'poll' ? formData.pollDuration : null,
        pollOptions: activeTab === 'poll' ? formData.pollOptions.filter(opt => opt.trim()).map(opt => ({ option: opt, votes: 0, voters: [] })) : null
      };

      await postService.create(postData);
      toast.success('Post created successfully!');
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      communityName: '',
      flair: '',
      isNSFW: false,
      isSpoiler: false,
      isOC: false,
      contentType: 'text',
      url: '',
      pollOptions: ['', ''],
      pollDuration: 1
    });
    setActiveTab('text');
    setIsPreviewMode(false);
    setErrors({});
  };

  const renderMarkdownPreview = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'text':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={isPreviewMode ? "secondary" : "primary"}
                size="sm"
                onClick={() => setIsPreviewMode(false)}
              >
                Write
              </Button>
              <Button
                variant={isPreviewMode ? "primary" : "secondary"}
                size="sm"
                onClick={() => setIsPreviewMode(true)}
              >
                Preview
              </Button>
            </div>
            
            {isPreviewMode ? (
              <div className="border border-gray-200 rounded-lg p-4 min-h-[200px] bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                {formData.content ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdownPreview(formData.content) 
                    }}
                  />
                ) : (
                  <p className="text-gray-400 italic">Nothing to preview</p>
                )}
              </div>
            ) : (
              <FormField label="Text" error={errors.content}>
                <Textarea
                  placeholder="What are your thoughts? (Supports basic markdown: **bold**, *italic*, `code`)"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={8}
                  error={!!errors.content}
                />
              </FormField>
            )}
          </div>
        );

      case 'media':
        return (
          <div className="space-y-4">
            <FormField label="Upload Image or Video">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ApperIcon name="Upload" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop or click to upload</p>
                <p className="text-sm text-gray-400">Supports: JPG, PNG, GIF, MP4, WebM</p>
                <Button variant="secondary" size="sm" className="mt-4">
                  Choose File
                </Button>
              </div>
            </FormField>
            
            <FormField label="URL (Optional)">
              <Input
                placeholder="Or paste an image/video URL"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
              />
            </FormField>
          </div>
        );

      case 'link':
        return (
          <div className="space-y-4">
            <FormField label="URL" error={errors.url}>
              <Input
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                error={!!errors.url}
              />
            </FormField>
          </div>
        );

case 'poll':
        return (
          <div className="space-y-4">
            <FormField label="Poll Duration" error={errors.pollDuration}>
              <Select
                value={formData.pollDuration}
                onChange={(e) => handleInputChange('pollDuration', parseInt(e.target.value))}
              >
                <option value="">Select duration</option>
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
                <option value="7">7 days</option>
              </Select>
            </FormField>
            
            <FormField label="Poll Options" error={errors.pollOptions}>
              {formData.pollOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.pollOptions.length > 2 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removePollOption(index)}
                    >
                      <ApperIcon name="X" className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </FormField>
            
            {formData.pollOptions.length < 6 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={addPollOption}
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Create a post</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <ApperIcon name={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl space-y-6">
            {/* Community and Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Choose a community" error={errors.communityName}>
                <Select
                  value={formData.communityName}
                  onChange={(e) => handleInputChange('communityName', e.target.value)}
                  error={!!errors.communityName}
                >
                  <option value="">Select community</option>
                  {communities.map((community) => (
                    <option key={community.name} value={community.name}>
                      r/{community.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Flair (optional)">
                <Select
                  value={formData.flair}
                  onChange={(e) => handleInputChange('flair', e.target.value)}
                >
                  <option value="">No flair</option>
                  {flairOptions.map((flair) => (
                    <option key={flair} value={flair}>
                      {flair}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField label="Title" error={errors.title}>
              <Input
                placeholder="An interesting title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                maxLength={300}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.title.length}/300 characters
              </div>
            </FormField>

            {/* Tab Content */}
            {renderTabContent()}

            {/* Post Options */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Post options</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isNSFW}
                    onChange={() => handleToggle('isNSFW')}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm">Mark as NSFW</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isSpoiler}
                    onChange={() => handleToggle('isSpoiler')}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm">Mark as Spoiler</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isOC}
                    onChange={() => handleToggle('isOC')}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm">Original Content (OC)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim() || !formData.communityName}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostCreator;