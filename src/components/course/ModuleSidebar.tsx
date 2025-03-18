
import React from 'react';
import { Module } from '@/types';
import { Book } from 'lucide-react';

interface ModuleSidebarProps {
  modules: Module[];
  selectedModuleId: string | null;
  onModuleSelect: (module: Module) => void;
}

const ModuleSidebar = ({
  modules,
  selectedModuleId,
  onModuleSelect
}: ModuleSidebarProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="font-bold text-xl mb-4">Course Modules</h2>
      
      <ul className="space-y-2">
        {modules.map((module) => (
          <li key={module.id}>
            <button
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                selectedModuleId === module.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => onModuleSelect(module)}
            >
              <div className="flex items-center">
                <Book className="h-4 w-4 mr-2" />
                <span>{module.title}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModuleSidebar;
