import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import MobileSidebar from "@/components/organisms/MobileSidebar";
import { cn } from "@/utils/cn";

const Header = ({ 
  title, 
  action, 
  actionLabel, 
  onAction,
  className 
}) => {
  return (
    <header className={cn(
      "bg-white border-b border-gray-200 px-6 py-4",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <MobileSidebar />
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
        {action && actionLabel && onAction && (
          <Button onClick={onAction} icon="Plus">
            {actionLabel}
          </Button>
)}
        <button
          onClick={() => {
            if (window.ApperSDK?.ApperUI?.logout) {
              window.ApperSDK.ApperUI.logout();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ApperIcon name="LogOut" className="h-5 w-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;