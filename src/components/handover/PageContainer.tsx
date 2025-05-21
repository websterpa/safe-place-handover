
import React, { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">iFoundIt.io</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </header>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
