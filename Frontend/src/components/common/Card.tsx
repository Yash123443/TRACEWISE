import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-stone-200 text-stone-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-150 ${
        hoverable ? 'hover:border-stone-300 hover:shadow-md cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}> = ({ children, className = '', action }) => (
  <div
    className={`px-5 py-3.5 border-b border-stone-200/80 bg-stone-50/50 flex items-center justify-between gap-3 ${className}`}
  >
    <div className="flex-1 min-w-0">{children}</div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`px-5 py-3 border-t border-stone-200/80 bg-stone-50/70 flex items-center justify-between gap-3 ${className}`}
  >
    {children}
  </div>
);
