import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Textarea = forwardRef(({ 
  className, 
  error,
  rows = 4,
  ...props 
}, ref) => {
  const baseStyles = "w-full px-4 py-2.5 text-sm border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical min-h-[100px]";
  
  const variants = error 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50" 
    : "border-gray-300 focus:border-primary focus:ring-primary bg-white hover:border-gray-400";

  return (
    <textarea
      rows={rows}
      className={cn(baseStyles, variants, className)}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;