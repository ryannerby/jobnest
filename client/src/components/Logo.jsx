import React from 'react';

const Logo = ({ size = "large" }) => {
  const sizeClasses = {
    small: "text-2xl",
    medium: "text-4xl", 
    large: "text-6xl"
  };

  return (
    <div className={`font-display font-black tracking-tight ${sizeClasses[size]}`}>
      <span className="text-primary-blue">Job</span>
      <span className="text-primary-lime relative">
        Nest
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-lime rounded-full animate-pulse-slow"></div>
      </span>
    </div>
  );
};

export default Logo; 