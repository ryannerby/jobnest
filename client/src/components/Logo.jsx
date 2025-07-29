import React from 'react';

const Logo = ({ size = "large" }) => {
  const sizeClasses = {
    xsmall: "h-12 w-auto", // half of large
    small: "h-8 w-auto",
    medium: "h-16 w-auto",
    large: "h-24 w-auto",
    custom: "h-32 w-auto" // extra large for header
  };

  return (
    <img
      src={"/logo.png"}
      alt="JobNest Logo"
      className={sizeClasses[size]}
      style={{ display: 'block' }}
    />
  );
};

export default Logo; 