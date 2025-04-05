import React, { useEffect, useRef } from 'react';
import { ModuleContent as ModuleContentType, VisualContent, Module } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import mermaid from 'mermaid';
import { useCourseContentGenerator } from '@/hooks/useCourseContentGenerator';
import { Excalidraw } from '@excalidraw/excalidraw';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  // Reference to track rendering of diagrams
  const renderedDiagrams = useRef(new Set());

  // Render mermaid diagrams when they change or after component mounts
  useEffect(() => {
    if (content.visualContent?.length > 0) {
      content.visualContent.forEach((visual, index) => {
        if (visual.type === 'mermaid' && visual.diagram) {
          const diagramId = `mermaid-diagram-${index}`;
          
          // Only render if not rendered before
          if (!renderedDiagrams.current.has(diagramId)) {
            try {
              // Need a small delay to ensure the DOM is ready
              setTimeout(() => {
                mermaid.render(diagramId, visual.diagram).then(({ svg }) => {
                  const container = document.getElementById(`mermaid-container-${index}`);
                  if (container) {
                    container.innerHTML = svg;
                    renderedDiagrams.current.add(diagramId);
                  }
                });
              }, 100);
            } catch (error) {
              console.error("Failed to render mermaid diagram:", error);
              toast.error("Failed to render diagram");
            }
          }
        }
      });
    }
  }, [content.visualContent]);

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

                  {visual.type === 'excalidraw' && visual.diagram && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                      <Excalidraw
                        initialData={{
                          elements: JSON.parse(visual.diagram), // For actual Excalidraw JSON
                          appState: { viewBackgroundColor: '#ffffff' },
                        }}
                      />
                    </div>
                  )}

                  {visual.type === 'mermaid' && visual.diagram && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                      <div id={`mermaid-container-${index}`} className="mermaid-diagram"></div>
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