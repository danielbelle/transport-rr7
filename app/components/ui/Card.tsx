import React from "react";
import type { JSX } from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
  hoverable = false,
}: CardProps & { hoverable?: boolean }): JSX.Element {
  return (
    <div
      className={`
      bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
      border border-gray-200 dark:border-gray-700 p-6
      transition-all duration-200
      ${hoverable ? "hover:shadow-2xl hover:-translate-y-1" : ""}
      ${className}
    `}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return <div className={`mb-6 ${className}`}>{children}</div>;
};

Card.Title = function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <h2
      className={`text-xl font-bold text-gray-800 dark:text-white ${className}`}
    >
      {children}
    </h2>
  );
};

Card.Content = function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return <div className={className}>{children}</div>;
};
