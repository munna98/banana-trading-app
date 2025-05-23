// src/components/UI/Card.jsx
import React from 'react';

const Card = ({
  children,
  className = '',
  title,
  subtitle,
  onClick,
  hoverable = false,
  padding = 'p-6'
}) => {
  const baseClasses = `
    bg-white rounded-xl shadow-sm border border-gray-100
    ${hoverable ? 'hover:shadow-md transition-all duration-300 cursor-pointer' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${padding}
    ${className}
  `;

  return (
    <div className={baseClasses.trim()} onClick={onClick}>
      {(title || subtitle) && (
        <div className="mb-4 pb-2 border-b border-gray-100">
          {title && (
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// Stats Card variant for dashboard
export const StatsCard = ({
  title,
  value,
  icon,
  color = 'blue',
  change,
  changeType = 'neutral'
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  const changeColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500'
  };

  const changeIcons = {
    positive: '▲', // Up arrow
    negative: '▼', // Down arrow
    neutral: '━'   // Dash
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300 p-5">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]} mr-4 flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">
            {value}
          </p>
          {change && (
            <p className={`text-sm flex items-center ${changeColors[changeType]} mt-1`}>
              <span className="mr-1">{changeIcons[changeType]}</span> {change}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// Info Card variant
export const InfoCard = ({
  title,
  items = [],
  className = '',
  emptyMessage = 'No data available'
}) => {
  return (
    <Card title={title} className={className}>
      {items.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-3">
              <span className="text-gray-600 font-medium">{item.label}</span>
              <span className="font-semibold text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4 text-sm italic">{emptyMessage}</p>
      )}
    </Card>
  );
};

export default Card;