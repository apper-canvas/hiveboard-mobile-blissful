import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const AwardDisplay = ({ awards = [] }) => {
  if (!awards || awards.length === 0) return null;

  // Group awards by type and count them
  const awardCounts = awards.reduce((acc, award) => {
    const existing = acc.find(a => a.awardId === award.awardId);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ ...award, count: 1 });
    }
    return acc;
  }, []);

  const colorMap = {
    yellow: 'text-yellow-500',
    gray: 'text-gray-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500'
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {awardCounts.map((award) => (
        <div
          key={`${award.awardId}`}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          title={`${award.count}x ${award.awardType?.name || 'Award'}`}
        >
          <ApperIcon
            name={award.awardType?.icon || 'Award'}
            size={14}
            className={cn(colorMap[award.awardType?.color] || 'text-gray-600')}
          />
          <span className="text-xs font-semibold text-gray-700">
            {award.count}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AwardDisplay;