import { supabase } from '@/integrations/supabase/client';
import { ModuleContent, VisualContent } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';

// Transform JSON from database to VisualContent[] type
const transformVisualContent = (jsonContent: Json | null): VisualContent[] => {
  if (!jsonContent || !Array.isArray(jsonContent)) {
    return [];
  }
  
  return jsonContent.map((item: any) => ({
    type: item.type || 'mermaid',
    diagram: item.diagram || '',
    url: item.url || '',
    title: item.title || '',
    description: item.description || ''
  }));
};

// Transform VisualContent[] to Json for database storage
const transformVisualContentToJson = (visualContent: VisualContent[] | string[]): Json => {
  if (!visualContent || visualContent.length === 0) {
    return [] as unknown as Json;
  }
  
  try {
    // If the array contains strings, convert them to VisualContent objects
    if (typeof visualContent[0] === 'string') {
      const formattedContent = (visualContent as string[]).map(url => ({
        type: 'url',
        url
      }));
      return formattedContent as unknown as Json;
    }
    
    // Make sure we have valid VisualContent objects
    const validContent = (visualContent as VisualContent[]).map(item => ({
      type: item.type || 'mermaid',
      diagram: item.diagram || '',
      url: item.url || '',
      title: item.title || '',
      description: item.description || ''
    }));
    
    // Just cast the VisualContent array to Json
    return validContent as unknown as Json;
  } catch (error) {
    console.error('Error transforming visual content:', error);
    return [] as unknown as Json;
  }
};

// Fetch module content by module ID
export const fetchModuleContent = async (moduleId: string): Promise<ModuleContent | null> => {
  try {
    const { data, error } = await supabase
      .from('module_content')
      .select('*')
      .eq('module_id', moduleId)
      .single();
    
    if (error) {
      console.error('Error fetching module content:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Transform the data to match our ModuleContent type
    return {
      id: data.id,
      moduleId: data.module_id,
      content: data.content || '',
      textualContent: data.textual_content || '',
      visualContent: transformVisualContent(data.visual_content),
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Exception in fetchModuleContent:', error);
    return null;
  }
};

// Create new module content
export const createModuleContent = async (
  moduleId: string,
  content: string,
  textualContent: string,
  visualContent: VisualContent[] | string[]
): Promise<ModuleContent | null> => {
  try {
    const contentId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Convert visualContent to proper format for database
    const formattedVisualContent = transformVisualContentToJson(visualContent);
    
    const { data, error } = await supabase
      .from('module_content')
      .insert({
        id: contentId,
        module_id: moduleId,
        content,
        textual_content: textualContent,
        visual_content: formattedVisualContent
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating module content:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Transform the data to match our ModuleContent type
    return {
      id: data.id,
      moduleId: data.module_id,
      content: data.content || '',
      textualContent: data.textual_content || '',
      visualContent: transformVisualContent(data.visual_content),
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Exception in createModuleContent:', error);
    return null;
  }
};

// Update existing module content
export const updateModuleContent = async (
  contentId: string,
  content: string,
  textualContent: string,
  visualContent: VisualContent[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('module_content')
      .update({
        content,
        textual_content: textualContent,
        visual_content: transformVisualContentToJson(visualContent)
      })
      .eq('id', contentId);
    
    if (error) {
      console.error('Error updating module content:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in updateModuleContent:', error);
    return false;
  }
};

// Save module content (create or update)
export const saveModuleContent = async (
  moduleId: string,
  content: string,
  textualContent: string,
  visualContent: VisualContent[]
): Promise<boolean> => {
  try {
    // Check if content already exists for this module
    const existingContent = await fetchModuleContent(moduleId);
    
    if (existingContent) {
      // Update existing content
      return updateModuleContent(
        existingContent.id,
        content,
        textualContent,
        visualContent
      );
    } else {
      // Create new content
      const newContent = await createModuleContent(
        moduleId,
        content,
        textualContent,
        visualContent
      );
      
      return !!newContent;
    }
  } catch (error) {
    console.error('Exception in saveModuleContent:', error);
    return false;
  }
};

// Generate module content using edge function
export const generateModuleContent = async (
  moduleId: string,
  moduleTitle: string
): Promise<ModuleContent | null> => {
  try {
    console.log(`Generating content for module: ${moduleId}`);
    
    // Call the edge function to generate content
    const { data: token } = await supabase.auth.getSession();
    
    if (!token.session) {
      console.error('No authentication session found');
      return null;
    }
    
    const functionUrl = `https://ncmrsccaleuhlthxkpxq.supabase.co/functions/v1/generate-course-content?moduleId=${moduleId}`;
    
    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.session.access_token}`
      }
    });
    
    if (!response.ok) {
      console.error('Error response from generate-course-content function:', await response.text());
      return null;
    }
    
    const generatedContent = await response.json();
    
    // Format the generated content
    const moduleContent: ModuleContent = {
      id: uuidv4(), // This will be replaced when saved to database
      moduleId,
      content: generatedContent.content || `Generated content for ${moduleTitle}`,
      textualContent: generatedContent.textualContent || '',
      visualContent: generatedContent.visualContent || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save the generated content to the database
    await saveModuleContent(
      moduleId,
      moduleContent.content,
      moduleContent.textualContent,
      moduleContent.visualContent
    );
    
    return moduleContent;
  } catch (error) {
    console.error('Exception in generateModuleContent:', error);
    return null;
  }
};
