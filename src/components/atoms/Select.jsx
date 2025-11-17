import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(({ 
  className, 
  error,
  children,
  ...props 
}, ref) => {
  const baseStyles = "w-full px-4 py-2.5 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed bg-white";
  
  const variants = error 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50" 
    : "border-gray-300 focus:border-primary focus:ring-primary hover:border-gray-400";

  return (
    <select
      className={cn(baseStyles, variants, className)}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

export default Select;