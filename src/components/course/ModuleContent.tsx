
import React from 'react';
import Markdown from 'react-markdown';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { VisualContentViewer } from '@/components/VisualContentViewer';
import TextToSpeechButton from './TextToSpeechButton';

import { ModuleContent as ModuleContentType } from '@/types';

const ModuleContent = ({
  title,
  content,
  visualPoints,
  textualPoints,
}: {
  title: string;
  content: ModuleContentType | null;
  visualPoints: number;
  textualPoints: number;
}) => {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        {content?.textualContent && (
          <TextToSpeechButton text={content.textualContent} />
        )}
      </div>
      
      {/* Learning Style Banner */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Your Learning Profile</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-blue-600 dark:text-blue-400">Visual</span>
              <span className="text-xs font-medium">{visualPoints} pts</span>
            </div>
            <Progress 
              value={(visualPoints / (visualPoints + textualPoints)) * 100} 
              className="h-2" 
              indicatorClassName="bg-blue-500"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-amber-600 dark:text-amber-400">Textual</span>
              <span className="text-xs font-medium">{textualPoints} pts</span>
            </div>
            <Progress 
              value={(textualPoints / (visualPoints + textualPoints)) * 100} 
              className="h-2" 
              indicatorClassName="bg-amber-500"
            />
          </div>
        </div>
      </div>
      
      {/* Module Content */}
      {content ? (
        <div className="space-y-8">
          {/* Visual Content Section */}
          {content.visualContent && content.visualContent.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium">Visual Representation</h3>
              </div>
              <div className="p-6">
                {content.visualContent.map((item, index) => (
                  <VisualContentViewer key={index} content={item} />
                ))}
              </div>
            </div>
          )}
          
          {/* Text Content Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Textual Content</h3>
            </div>
            <div className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                {content.textualContent ? (
                  <Markdown>{content.textualContent}</Markdown>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No textual content available for this module.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading module content...</p>
        </div>
      )}
    </div>
  );
};

export default ModuleContent;
