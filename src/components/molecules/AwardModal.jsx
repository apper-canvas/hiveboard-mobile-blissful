import React, { useState, useEffect } from 'react';
import { awardService } from '@/services/api/awardService';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';

const AwardModal = ({ isOpen, onClose, onAwardGiven, contentType = 'post', contentId = null }) => {
  const [awards, setAwards] = useState([]);
  const [selectedAward, setSelectedAward] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const allAwards = awardService.getAllAwards();
      setAwards(allAwards);
      setSelectedAward(allAwards[0] || null);
    }
  }, [isOpen]);

  const handleGiveAward = async () => {
    if (!selectedAward || contentId === null) {
      toast.error('Please select an award');
      return;
    }

    setIsLoading(true);

    // Simulate coin deduction and award process
    setTimeout(() => {
      try {
        if (contentType === 'post') {
          awardService.awardPost(contentId, selectedAward.Id);
        } else if (contentType === 'comment') {
          awardService.awardComment(contentId, selectedAward.Id);
        }

        toast.success(`${selectedAward.name} awarded! -${selectedAward.cost} coins`);
        onAwardGiven?.(selectedAward);
        setIsLoading(false);
        onClose();
      } catch (error) {
        toast.error('Failed to give award');
        setIsLoading(false);
      }
    }, 500);
  };

  if (!isOpen) return null;

  const colorMap = {
    yellow: 'from-yellow-100 to-yellow-50 border-yellow-300',
    gray: 'from-gray-100 to-gray-50 border-gray-300',
    blue: 'from-blue-100 to-blue-50 border-blue-300',
    green: 'from-green-100 to-green-50 border-green-300',
    red: 'from-red-100 to-red-50 border-red-300',
    purple: 'from-purple-100 to-purple-50 border-purple-300',
    orange: 'from-orange-100 to-orange-50 border-orange-300'
  };

  const colorIconMap = {
    yellow: 'text-yellow-600',
    gray: 'text-gray-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Give Award</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Info message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
              <ApperIcon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                Awards show appreciation for great content. Coins will be deducted from your account.
              </p>
            </div>

            {/* Awards Grid */}
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {awards.map((award) => (
                <button
                  key={award.Id}
                  onClick={() => setSelectedAward(award)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all hover:shadow-md',
                    selectedAward?.Id === award.Id
                      ? `border-primary bg-gradient-to-br ${colorMap[award.color]} shadow-md`
                      : `border-gray-200 bg-gray-50 hover:border-gray-300`
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <ApperIcon
                      name={award.icon}
                      size={28}
                      className={cn(
                        'transition-colors',
                        selectedAward?.Id === award.Id
                          ? colorIconMap[award.color]
                          : 'text-gray-600'
                      )}
                    />
                    <div className="text-center">
                      <h3 className="font-semibold text-sm text-gray-900">{award.name}</h3>
                      <p className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
                        <ApperIcon name="Coins" size={12} />
                        {award.cost}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected award description */}
            {selectedAward && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-sm text-indigo-900">{selectedAward.description}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGiveAward}
              disabled={!selectedAward || isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Giving...
                </>
              ) : (
                <>
                  <ApperIcon name="Gift" size={16} />
                  Give {selectedAward?.name || 'Award'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AwardModal;