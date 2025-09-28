import React from 'react';

interface HeartIconProps {
  isLiked: boolean;
  onClick: () => void;
  size?: number;
  className?: string;
}

const HeartIcon: React.FC<HeartIconProps> = ({ 
  isLiked, 
  onClick, 
  size = 20, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`heart-button ${className}`}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'all 0.2s ease-in-out',
        width: `${size + 8}px`,
        height: `${size + 8}px`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      title={isLiked ? 'Unlike comment' : 'Like comment'}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={isLiked ? '#FF69B4' : 'none'}
        stroke={isLiked ? '#FF69B4' : '#FF69B4'}
        strokeWidth={isLiked ? '0' : '2'}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
};

export default HeartIcon;