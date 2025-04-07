import React, { useEffect, useRef } from 'react';
import { ModuleContent as ModuleContentType, VisualContent } from '@/types';
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
  onTakeQuiz,
}: ModuleContentProps) => {
  const diagramAttempts = useRef(0);
  
  // Initialize mermaid when component mounts
  useEffect(() => {
    // Initialize mermaid with basic configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
    });
    
    // Initial render attempt
    setTimeout(() => {
      renderMermaidDiagrams();
    }, 100);
  }, []);
  
  // Re-render diagrams when content changes
  useEffect(() => {
    if (content?.visualContent?.length) {
      setTimeout(() => {
        renderMermaidDiagrams();
      }, 100);
    }
  }, [content]);
  
  // Function to manually render all mermaid diagrams
  const renderMermaidDiagrams = () => {
    if (!content?.visualContent?.length) return;
    
    // Increment attempts counter
    diagramAttempts.current += 1;
    
    content.visualContent.forEach((visual, index) => {
      if (visual.type === 'mermaid' && visual.diagram) {
        const containerId = `mermaid-container-${index}`;
        const container = document.getElementById(containerId);
        
        if (container) {
          try {
            // Show loading state
            container.innerHTML = `<div class="flex justify-center p-4"><div class="animate-spin h-6 w-6 border-2 border-gray-500 rounded-full border-t-transparent"></div></div>`;
            
            // Create a unique ID for this diagram
            const diagramId = `mermaid-diagram-${index}-${diagramAttempts.current}`;
            
            // Attempt to render the diagram
            mermaid.render(diagramId, visual.diagram)
              .then(result => {
                container.innerHTML = result.svg;
              })
              .catch(error => {
                console.error('Error rendering diagram:', error);
                container.innerHTML = '<div class="p-4 text-center text-gray-500">Unable to display diagram</div>';
              });
          } catch (error) {
            console.error('Error in rendering process:', error);
            container.innerHTML = '<div class="p-4 text-center text-gray-500">Unable to display diagram</div>';
          }
        }
      }
    });
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

        {/* Render visual content (e.g., diagrams or URLs) */}
        {content.visualContent && content.visualContent.length > 0 && (
          <div className="my-8 space-y-10">
            <h3 className="text-xl font-semibold mt-4 mb-6">Visual Representations</h3>
            
            {/* Optional refresh button - can be removed if not needed */}
            <div className="mb-4">
              <button 
                onClick={renderMermaidDiagrams} 
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Refresh Diagrams
              </button>
            </div>
            
            {Array.isArray(content.visualContent) &&
              content.visualContent.map((visual: VisualContent, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-md"
                >
                  {visual.title && (
                    <h4 className="text-lg font-medium mb-2">{visual.title}</h4>
                  )}

                  {visual.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{visual.description}</p>
                  )}

                  {/* Handle Mermaid diagrams */}
                  {visual.type === 'mermaid' && visual.diagram && (
                    <div 
                      id={`mermaid-container-${index}`}
                      className="mermaid-container bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto"
                      style={{ minHeight: '200px' }}
                    >
                      <div className="flex justify-center p-4">
                        <div className="animate-spin h-6 w-6 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                      </div>
                    </div>
                  )}

                  {visual.type === 'url' && visual.url && (
                    <div className="my-4">
                      <a
                        href={visual.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View Diagram {index + 1}
                      </a>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Render textual content */}
        {content.textualContent && (
          <div className="my-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Detailed Explanation</h3>
            <div className="whitespace-pre-line">{content.textualContent}</div>
          </div>
        )}
      </div>

      <div className="mt-12 border-t pt-6 flex justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>
            Learning style preference: {visualPoints > textualPoints ? 'Visual' : 'Textual'}
          </div>
          <div>Visual points: {visualPoints || 0}</div>
          <div>Textual points: {textualPoints || 0}</div>
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