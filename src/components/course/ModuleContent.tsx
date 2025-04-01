import React, { useEffect } from 'react';
import { ModuleContent as ModuleContentType } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import mermaid from 'mermaid';

interface ModuleContentProps {
  title: string;
  content: ModuleContentType;
  visualPoints: number;
  textualPoints: number;
  onTakeQuiz: () => void;
}

const ModuleContent = ({
  title,
  content,
  visualPoints,
  textualPoints,
  onTakeQuiz
}: ModuleContentProps) => {
  useEffect(() => {
    if (content.visualContent) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.contentLoaded();
    }
  }, [content]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p>{content.content}</p>
        
        {content.visualContent && content.visualContent.length > 0 && (
          <div className="my-8">
            {content.visualContent.map((diagram, index) => (
              <pre key={index} className="mermaid">
                {diagram}
              </pre>
            ))}
          </div>
        )}
        
        {content.textualContent && (
          <div className="my-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Additional Explanation</h3>
            <p>{content.textualContent}</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 border-t pt-6 flex justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>
            Learning style preference: {visualPoints > textualPoints ? 'Visual' : 'Textual'}
          </div>
          <div>
            Visual points: {visualPoints || 0}
          </div>
          <div>
            Textual points: {textualPoints || 0}
          </div>
        </div>
        
        <Button onClick={onTakeQuiz}>
          Take Quiz
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ModuleContent;
