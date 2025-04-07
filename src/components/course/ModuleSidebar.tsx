
import React from 'react';
import { Module } from '@/types';
import { Book, LockIcon, ClipboardList } from 'lucide-react';

interface ModuleSidebarProps {
  modules: Module[];
  selectedModuleId: string | null;
  onModuleSelect: (module: Module) => void;
  completedModules?: string[];
  unlockedModules?: string[];
}

const ModuleSidebar = ({
  modules,
  selectedModuleId,
  onModuleSelect,
  completedModules = [],
  unlockedModules = [],
}: {
  modules: Module[];
  selectedModuleId: string | null;
  onModuleSelect: (module: Module) => void;
  completedModules?: string[];
  unlockedModules?: string[];
}) => {
  // If no modules, show a placeholder
  if (modules.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No modules available
        </p>
      </div>
    );
  }

  // Only show the quiz option if there are modules (we need them for the quiz content)
  const showQuizOption = modules.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="font-bold text-xl mb-4">Course Modules</h2>
      
      <ul className="space-y-2">
        {modules.map((module) => {
          // Determine module state
          const isSelected = selectedModuleId === module.id;
          const isCompleted = completedModules.includes(module.id);
          const isUnlocked = unlockedModules.includes(module.id) || unlockedModules.length === 0;

          return (
            <li key={module.id}>
              <button
                className={`
                  w-full 
                  text-left 
                  px-4 
                  py-3 
                  rounded-lg 
                  transition-colors 
                  flex 
                  items-center 
                  ${isSelected 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  } 
                  ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => isUnlocked ? onModuleSelect(module) : null}
                disabled={!isUnlocked}
              >
                {isUnlocked ? (
                  <Book 
                    className={`
                      h-4 
                      w-4 
                      mr-2 
                      ${isCompleted ? 'text-green-500' : ''}
                    `} 
                  />
                ) : (
                  <LockIcon className="h-4 w-4 mr-2 text-gray-400" />
                )}
                <span className={isCompleted ? 'line-through text-gray-500' : ''}>
                  {module.title}
                </span>
              </button>
            </li>
          );
        })}

        {/* Add Course Quiz at the end (only if we have modules) */}
        {showQuizOption && (
          <li key="quiz-module">
            <button
              className={`
                w-full 
                text-left 
                px-4 
                py-3 
                rounded-lg 
                transition-colors 
                flex 
                items-center 
                ${selectedModuleId === 'quiz-module' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              onClick={() => onModuleSelect({
                id: "quiz-module",
                title: "Course Quiz",
                course_id: modules[0]?.course_id || "quiz-course",
                order: 999,
                description: "Final assessment for the entire course",
                type: "mixed"
              })}
            >
              <ClipboardList className="h-4 w-4 mr-2 text-blue-500" />
              <span>Course Quiz</span>
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ModuleSidebar;
