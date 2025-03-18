
import React from 'react';
import { Book, Loader2 } from 'lucide-react';

interface EmptyModuleStateProps {
  isLoading?: boolean;
}

const EmptyModuleState = ({ isLoading = false }: EmptyModuleStateProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <h3 className="text-xl font-medium mb-2">Generating Content</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Personalizing content based on your learning style...
        </p>
      </div>
    );
  }
  
  return (
    <div className="text-center py-12">
      <Book className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-medium mb-2">Select a Module</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Choose a module from the sidebar to start learning
      </p>
    </div>
  );
};

export default EmptyModuleState;
