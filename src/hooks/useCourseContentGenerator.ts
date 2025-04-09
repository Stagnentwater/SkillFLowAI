
import { useState, useCallback } from 'react';
import { ModuleContent, Module } from '@/types';
import { fetchModuleContent, saveModuleContent } from '@/services/contentService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseCourseContentGeneratorProps {
  onContentLoaded?: (content: ModuleContent) => void;
}

export function useCourseContentGenerator(props?: UseCourseContentGeneratorProps) {
  const { onContentLoaded } = props || {};
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleContent, setModuleContent] = useState<ModuleContent | null>(null);

  const getOrGenerateContent = useCallback(async (module: Module): Promise<ModuleContent | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Check if content already exists in the database
      const existingContent = await fetchModuleContent(module.id);
      
      if (existingContent) {
        // If content exists, use it
        setModuleContent(existingContent);
        onContentLoaded?.(existingContent);
        return existingContent;
      }
      
      // Step 2: Content doesn't exist, generate it using edge function
      toast.info(`Generating content for module: ${module.title}`);
      
      // Get auth token for edge function call
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('Authentication required to generate content');
      }
      
      // Call the edge function directly
      const functionUrl = `https://ncmrsccaleuhlthxkpxq.supabase.co/functions/v1/generate-course-content?moduleId=${module.id}`;
      
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error from generate-course-content function:', errorText);
        
        // If the API key is expired, generate fallback content instead
        if (errorText.includes('API key expired') || errorText.includes('API_KEY_INVALID')) {
          console.log('Using fallback content generation due to API key issue');
          return generateFallbackContent(module);
        }
        
        throw new Error(`Failed to generate content: ${response.status} ${response.statusText}`);
      }
      
      const generatedContent = await response.json();
      const userId=await supabase.auth.getUser().then(({ data})=> data.user?.id);
      // Step 3: Transform the edge function response into ModuleContent type
      const moduleContent: ModuleContent = {
        id: generatedContent.id || '',
        moduleId: module.id,
        content: generatedContent.content || '',
        textualContent: generatedContent.textualContent || '',
        visualContent: generatedContent.visualContent || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user_id:userId
      };
      
      setModuleContent(moduleContent);
      onContentLoaded?.(moduleContent);
      return moduleContent;
    } catch (err) {
      console.error('Error in course content generation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating content';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If any error occurs, try to generate fallback content
      return generateFallbackContent(module);
    } finally {
      setIsLoading(false);
    }
  }, [onContentLoaded]);

  // Generate basic content when API fails
  const generateFallbackContent = async (module: Module): Promise<ModuleContent | null> => {
    try {
      const fallbackContent: ModuleContent = {
        id: crypto.randomUUID(),
        moduleId: module.id,
        content: `This is placeholder content for the module "${module.title}". The content generation service is currently experiencing issues.`,
        textualContent: `
          ## ${module.title}
          
          This module would typically contain AI-generated content, but there was an issue with the content generation service.
          
          ### Common reasons for this issue:
          - The API key for the AI service might have expired
          - There might be connectivity issues with the AI service
          - The AI service might be temporarily unavailable
          
          Please try again later or contact the administrator.
        `,
        visualContent: [
          {
            type: 'mermaid',
            diagram: 'graph TD;\n  A[Start] --> B[Content];\n  B --> C[Learning];\n  C --> D[End];',
            title: 'Learning Flow',
            description: 'A simple diagram showing the learning flow for this module'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save the fallback content to the database
      const savedContent = await saveModuleContent(
        module.id,
        fallbackContent.content,
        fallbackContent.textualContent,
        fallbackContent.visualContent
      );
      
      if (savedContent) {
        toast.success('Fallback content created successfully');
        
        // Fetch the saved content to get the proper ID and timestamps
        const dbContent = await fetchModuleContent(module.id);
        
        if (dbContent) {
          setModuleContent(dbContent);
          onContentLoaded?.(dbContent);
          return dbContent;
        }
      }
      
      // If saving failed, at least return the fallback content for display
      setModuleContent(fallbackContent);
      onContentLoaded?.(fallbackContent);
      return fallbackContent;
    } catch (fallbackErr) {
      console.error('Error generating fallback content:', fallbackErr);
      toast.error('Failed to create even fallback content');
      return null;
    }
  };

  return {
    isLoading,
    error,
    moduleContent,
    getOrGenerateContent,
    setModuleContent
  };
}
