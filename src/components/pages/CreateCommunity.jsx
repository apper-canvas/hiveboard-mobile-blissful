import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { communityService } from "@/services/api/communityService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Community from "@/components/pages/Community";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";


const CreateCommunity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nameCheckLoading, setNameCheckLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    communityType: "Public",
    isNSFW: false,
    topics: [],
    iconFile: null,
    bannerFile: null,
    rules: [""],
    acceptedGuidelines: false
  });
  const [errors, setErrors] = useState({});
  const [nameAvailable, setNameAvailable] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [topicInput, setTopicInput] = useState("");

  const communityTypes = [
    {
      value: "Public",
      label: "Public",
      description: "Anyone can view, post, and comment to this community"
    },
    {
      value: "Restricted",
      label: "Restricted", 
      description: "Anyone can view this community, but only approved users can post"
    },
    {
      value: "Private",
      label: "Private",
      description: "Only approved users can view and submit to this community"
    }
  ];

  const predefinedTopics = [
    "Technology", "Gaming", "Science", "Art", "Music", "Sports", "Food", "Travel",
    "Books", "Movies", "Health", "Fitness", "Education", "Business", "Politics",
    "Photography", "Fashion", "DIY", "Pets", "Nature", "Cars", "History"
  ];

  // Debounced name availability check
  useEffect(() => {
    if (formData.name.length >= 3) {
      const timeoutId = setTimeout(async () => {
        await checkNameAvailability(formData.name);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setNameAvailable(null);
    }
  }, [formData.name]);

  const checkNameAvailability = async (name) => {
    if (!name || name.length < 3) return;
    
    setNameCheckLoading(true);
    try {
      const isAvailable = await communityService.validateUniqueName(name);
      setNameAvailable(isAvailable);
      if (!isAvailable) {
        setErrors(prev => ({
          ...prev,
          name: "This community name is already taken"
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.name;
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Error checking name availability:", error);
    } finally {
      setNameCheckLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (field, file) => {
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [field]: "Please upload a valid image file (JPEG, PNG, or WebP)"
        }));
        return;
      }
      
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [field]: "File size must be less than 5MB"
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
      
      // Clear error
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addTopic = (topic) => {
    const trimmedTopic = topic.trim();
    if (trimmedTopic && !formData.topics.includes(trimmedTopic)) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, trimmedTopic]
      }));
    }
    setTopicInput("");
  };

  const removeTopic = (topicToRemove) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
    }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, ""]
    }));
  };

  const updateRule = (index, value) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const removeRule = (index) => {
    if (formData.rules.length > 1) {
      setFormData(prev => ({
        ...prev,
        rules: prev.rules.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Community name is required";
      } else if (formData.name.length < 3) {
        newErrors.name = "Community name must be at least 3 characters";
      } else if (formData.name.length > 21) {
        newErrors.name = "Community name must be 21 characters or less";
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
        newErrors.name = "Community name can only contain letters, numbers, and underscores";
      } else if (nameAvailable === false) {
        newErrors.name = "This community name is already taken";
      }
      
      if (!formData.description.trim()) {
        newErrors.description = "Community description is required";
      } else if (formData.description.length > 500) {
        newErrors.description = "Description must be 500 characters or less";
      }
    }
    
    if (step === 3) {
      if (!formData.acceptedGuidelines) {
        newErrors.acceptedGuidelines = "You must accept the community guidelines";
      }
      
      // Validate rules
      const nonEmptyRules = formData.rules.filter(rule => rule.trim());
      if (nonEmptyRules.length === 0) {
        newErrors.rules = "At least one community rule is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    try {
      const communityData = {
        name: formData.name.toLowerCase(),
        description: formData.description.trim(),
        communityType: formData.communityType,
        isNSFW: formData.isNSFW,
        topics: formData.topics,
        iconUrl: formData.iconFile ? URL.createObjectURL(formData.iconFile) : null,
        bannerUrl: formData.bannerFile ? URL.createObjectURL(formData.bannerFile) : null,
        rules: formData.rules.filter(rule => rule.trim()),
        createdAt: Date.now(),
        memberCount: 1,
        postCount: 0,
        onlineUsers: 1,
        moderators: [{
          username: "CurrentUser", // In real app, get from auth context
          role: "Head Moderator",
          joinedAt: Date.now()
        }],
        theme: {
          primary: "#6366F1",
          secondary: "#8B5CF6",
          banner: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          accent: "#4F46E5"
        }
      };
      
      const newCommunity = await communityService.create(communityData);
      toast.success(`r/${newCommunity.name} community created successfully! You are now the head moderator.`);
      navigate(`/r/${newCommunity.name}`);
    } catch (error) {
      toast.error(error.message || "Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
            step === currentStep 
              ? "bg-primary text-white" 
              : step < currentStep 
                ? "bg-accent text-white"
                : "bg-gray-200 text-gray-600"
          )}>
            {step < currentStep ? (
              <ApperIcon name="Check" className="w-5 h-5" />
            ) : (
              step
            )}
          </div>
          {step < 3 && (
            <div className={cn(
              "w-20 h-1 mx-2",
              step < currentStep ? "bg-accent" : "bg-gray-200"
            )} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with the basics of your community</p>
      </div>
      
      <FormField 
        label="Community Name" 
        required
        error={errors.name}
        hint="3-21 characters. Letters, numbers, and underscores only."
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm font-medium">r/</span>
          </div>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="awesomecommunity"
            className="pl-8"
            maxLength={21}
          />
          {nameCheckLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <ApperIcon name="Loader2" className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
          {nameAvailable === true && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <ApperIcon name="Check" className="w-4 h-4 text-accent" />
            </div>
          )}
        </div>
      </FormField>
      
      <FormField 
        label="Community Description" 
        required
        error={errors.description}
        hint="Tell people what your community is about"
      >
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="A community for discussing amazing things and sharing awesome content..."
          rows={4}
          maxLength={500}
        />
        <div className="text-xs text-gray-500 text-right">
          {formData.description.length}/500 characters
        </div>
      </FormField>
      
      <FormField 
        label="Community Type" 
        required
      >
        <div className="space-y-3">
          {communityTypes.map((type) => (
            <label key={type.value} className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="communityType"
                value={type.value}
                checked={formData.communityType === type.value}
                onChange={(e) => handleInputChange("communityType", e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">{type.label}</div>
                <div className="text-sm text-gray-600">{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      </FormField>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Community</h2>
        <p className="text-gray-600">Add visual elements and topics to make your community unique</p>
      </div>
      
      <FormField label="18+ Community">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isNSFW}
            onChange={(e) => handleInputChange("isNSFW", e.target.checked)}
          />
          <div>
            <div className="font-medium text-gray-900">Mature Content (18+)</div>
            <div className="text-sm text-gray-600">This community may contain mature themes</div>
          </div>
        </label>
      </FormField>
      
      <FormField 
        label="Community Topics/Tags"
        hint="Add topics to help people discover your community"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Add a topic..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTopic(topicInput);
                }
              }}
            />
            <Button 
              type="button"
              onClick={() => addTopic(topicInput)}
              disabled={!topicInput.trim()}
            >
              Add
            </Button>
          </div>
          
          {predefinedTopics.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Popular topics:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedTopics.slice(0, 12).map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => addTopic(topic)}
                    disabled={formData.topics.includes(topic)}
                    className={cn(
                      "px-3 py-1 text-sm rounded-full border transition-colors",
                      formData.topics.includes(topic)
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {formData.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.topics.map((topic, index) => (
                <div key={index} className="flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-sm">
                  <span>{topic}</span>
                  <button
                    type="button"
                    onClick={() => removeTopic(topic)}
                    className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                  >
                    <ApperIcon name="X" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormField>
      
      <FormField 
        label="Community Icon"
        error={errors.iconFile}
        hint="Upload an icon for your community (JPG, PNG, WebP - max 5MB)"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
            {formData.iconFile ? (
              <img 
                src={URL.createObjectURL(formData.iconFile)} 
                alt="Community icon" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              formData.name.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("iconFile", e.target.files[0])}
              className="hidden"
              id="icon-upload"
            />
            <label 
              htmlFor="icon-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ApperIcon name="Upload" className="w-4 h-4" />
              Upload Icon
            </label>
          </div>
        </div>
      </FormField>
      
      <FormField 
        label="Community Banner"
        error={errors.bannerFile}
        hint="Upload a banner for your community (JPG, PNG, WebP - max 5MB)"
      >
        <div className="space-y-4">
          <div className="w-full h-32 rounded-lg bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
            {formData.bannerFile ? (
              <img 
                src={URL.createObjectURL(formData.bannerFile)} 
                alt="Community banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white font-medium">
                Preview Banner
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("bannerFile", e.target.files[0])}
              className="hidden"
              id="banner-upload"
            />
            <label 
              htmlFor="banner-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ApperIcon name="Upload" className="w-4 h-4" />
              Upload Banner
            </label>
          </div>
        </div>
      </FormField>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Rules & Guidelines</h2>
        <p className="text-gray-600">Set clear rules to maintain a healthy community</p>
      </div>
      
      <FormField 
        label="Community Rules" 
        required
        error={errors.rules}
        hint="Add rules that members should follow in your community"
      >
        <div className="space-y-3">
          {formData.rules.map((rule, index) => (
            <div key={index} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-2">
                {index + 1}
              </div>
              <div className="flex-1">
                <Textarea
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  placeholder={`Rule ${index + 1}: Be respectful to all members`}
                  rows={2}
                />
              </div>
              {formData.rules.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeRule(index)}
                  className="mt-2 p-2 text-red-500 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addRule}
            className="w-full"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </FormField>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ApperIcon name="Shield" className="w-5 h-5 text-primary" />
          Community Guidelines
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>By creating this community, you agree to:</p>
          <ul className="space-y-2 ml-4">
            <li>• Follow all platform-wide content policies</li>
            <li>• Moderate your community according to its rules</li>
            <li>• Respect intellectual property and user privacy</li>
            <li>• Foster a welcoming environment for all members</li>
            <li>• Take action against harmful content and behavior</li>
          </ul>
        </div>
        
        <FormField error={errors.acceptedGuidelines} className="mt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptedGuidelines}
              onChange={(e) => handleInputChange("acceptedGuidelines", e.target.checked)}
              className="mt-1"
            />
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                I accept the community guidelines and agree to moderate responsibly
              </span>
            </div>
          </label>
        </FormField>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Create Community</h1>
            <p className="text-primary-100">Build and grow your own community space</p>
          </div>
          
          <div className="p-8">
            {renderStepIndicator()}
            
            <form onSubmit={(e) => e.preventDefault()}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previousStep}
                  disabled={currentStep === 1}
                >
                  <ApperIcon name="ChevronLeft" className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={nameCheckLoading}
                    >
                      Next
                      <ApperIcon name="ChevronRight" className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading || !formData.acceptedGuidelines}
                      className="min-w-[120px]"
                    >
                      {loading ? (
                        <>
                          <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                          Create Community
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunity;