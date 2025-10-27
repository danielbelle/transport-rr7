import type { CardProps } from "~/lib/types";

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
      bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
      border border-gray-200 dark:border-gray-700 p-6
      transition-all duration-200
      ${className}
    `}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = "" }: CardProps) {
  return <div className={`mb-6 ${className}`}>{children}</div>;
};

Card.Title = function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h2
      className={`text-xl font-bold text-gray-800 dark:text-white ${className}`}
    >
      {children}
    </h2>
  );
};

Card.Content = function CardContent({ children, className = "" }: CardProps) {
  return <div className={className}>{children}</div>;
};
