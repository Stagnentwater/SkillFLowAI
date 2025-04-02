import React, { useEffect, useState } from 'react';
import { ModuleContent as ModuleContentType, VisualContent, Module } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import mermaid from 'mermaid';
import { fetchModuleContent } from '@/services/contentService';

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
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleContent, setModuleContent] = useState<ModuleContentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (content.visualContent && content.visualContent.length > 0) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.contentLoaded();
    }
  }, [content]);

  const onModuleSelect = async (module: Module) => {
    setSelectedModule(module);
    setModuleContent(null); // Clear previous content
    setIsLoading(true); // Show loading state

    try {
      // Fetch content for the selected module
      const existingContent = await fetchModuleContent(module.id);

      if (existingContent) {
        // If content exists, display it
        setModuleContent(existingContent);
      } else {
        // If no content exists, generate it
        const response = await fetch(`/api/generate-course-content?moduleId=${module.id}`);
        if (!response.ok) {
          console.error('Failed to generate content:', response.statusText);
          return;
        }

        const generatedContent = await response.json();
        setModuleContent(generatedContent);
      }
    } catch (error) {
      console.error('Error handling module selection:', error);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {/* Render the main content */}
        {content.content && (
          <div className="mb-8">
            <p>{content.content}</p>
          </div>
        )}
        
        {/* Render visual content (e.g., mermaid diagrams or URLs) */}
        {content.visualContent && content.visualContent.length > 0 && (
          <div className="my-8">
            {Array.isArray(content.visualContent) && content.visualContent.every(item => typeof item === 'object' && 'type' in item) &&
              Array.isArray(content.visualContent) && content.visualContent.every(item => typeof item === 'object' && 'type' in item) &&
              Array.isArray(content.visualContent) && content.visualContent.every(item => typeof item === 'object' && 'type' in item) &&
              (content.visualContent as VisualContent[]).map((visual: VisualContent, index) => {
              if (visual.type === 'mermaid') {
                return (
                  <pre key={index} className="mermaid">
                    {visual.diagram}
                  </pre>
                );
              } else if (visual.type === 'url') {
                return (
                  <div key={index} className="my-4">
                    <a
                      href={visual.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Diagram {index + 1}
                    </a>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Render textual content */}
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
