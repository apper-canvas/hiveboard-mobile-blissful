import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Select from "@/components/atoms/Select";

const FilterTabs = ({ 
  activeFilter = "hot", 
  postType = "all",
  onFilterChange, 
  onTypeChange,
  className 
}) => {
// No tab state needed for dropdown interface
const sortOptions = [
    { key: "hot", label: "Hot", icon: "🔥" },
    { key: "new", label: "New", icon: "✨" },
    { key: "topAllTime", label: "Top All Time", icon: "👑" },
    { key: "topWeek", label: "Top This Week", icon: "📈" },
    { key: "controversial", label: "Controversial", icon: "⚡" },
    { key: "rising", label: "Rising", icon: "🚀" }
  ];

  const typeOptions = [
    { key: "all", label: "All", icon: "📋" },
    { key: "images", label: "Images", icon: "🖼️" },
    { key: "videos", label: "Videos", icon: "🎥" },
    { key: "discussions", label: "Discussions", icon: "💬" },
    { key: "links", label: "Links", icon: "🔗" }
  ];

  return (
<div className={cn("bg-white rounded-2xl shadow-lg border border-gray-100/50 p-4 backdrop-blur-sm", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sort By Dropdown */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <ApperIcon name="ArrowUpDown" className="w-4 h-4" />
            Sort By
          </label>
          <Select
            value={activeFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full"
          >
            {sortOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.icon} {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Filter By Type Dropdown */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <ApperIcon name="Filter" className="w-4 h-4" />
            Filter By Type
          </label>
          <Select
            value={postType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full"
          >
            {typeOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.icon} {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterTabs;