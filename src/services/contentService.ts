import { supabase } from '@/integrations/supabase/client';
import { ModuleContent } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';

// Define the VisualContent type
type VisualContent = {
  type: 'mermaid' | 'url';
  diagram?: string;
  url: string;
};

// Fetch content for a module
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
    
    // Transform visual_content from Json to VisualContent[]
    let visualContent: VisualContent[] = [];
    if (data.visual_content) {
      if (typeof data.visual_content === 'string') {
        try {
          visualContent = JSON.parse(data.visual_content) as VisualContent[];
        } catch (e) {
          console.error('Error parsing visual_content JSON:', e);
          visualContent = [];
        }
      } else if (Array.isArray(data.visual_content)) {
        visualContent = data.visual_content.filter(item => 
          item && typeof item === 'object' && 'type' in item && 'url' in item
        ) as VisualContent[];
      }
    }
    
    return {
      id: data.id,
      moduleId: data.module_id,
      content: data.content || '',
      textualContent: data.textual_content || '',
      visualContent: visualContent,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Exception in fetchModuleContent:', error);
    return null;
  }
};

// Create new content for a module
export const createModuleContent = async (
  moduleId: string,
  content: string,
  textualContent: string,
  visualContent: Record<string, VisualContent>
): Promise<ModuleContent | null> => {
  try {
    const contentId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Convert visualContent to JSON for storage
    const visualContentJson = (typeof visualContent === 'object' && visualContent !== null) 
      ? visualContent as unknown as Json
      : [] as unknown as Json;
    
    const { data, error } = await supabase
      .from('module_content')
      .insert({
        id: contentId,
        module_id: moduleId,
        content,
        textual_content: textualContent,
        visual_content: visualContentJson,
        created_at: timestamp,
        updated_at: timestamp
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating module content:', error);
      return null;
    }
    
    // Convert the visual_content back to VisualContent[] for the return value
    let visualContentArray: VisualContent[] = [];
    if (data.visual_content) {
      if (typeof data.visual_content === 'string') {
        try {
          visualContentArray = JSON.parse(data.visual_content) as VisualContent[];
        } catch (e) {
          console.error('Error parsing visual_content:', e);
          visualContentArray = [];
        }
      } else if (Array.isArray(data.visual_content)) {
        visualContentArray = data.visual_content as VisualContent[];
      }
    }
    
    return {
      id: data.id,
      moduleId: data.module_id,
      content: data.content || '',
      textualContent: data.textual_content || '',
      visualContent: visualContentArray,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Exception in createModuleContent:', error);
    return null;
  }
};

// Update content for a module
export const updateModuleContent = async (
  contentId: string,
  contentData: Partial<Omit<ModuleContent, 'id' | 'moduleId' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
  try {
    // Convert visualContent to JSON for storage if it exists
    let visualContentJson: Json | undefined = undefined;
    if (contentData.visualContent) {
      visualContentJson = contentData.visualContent as unknown as Json;
    }
    
    const updatePayload = {
      content: contentData.content,
      textual_content: contentData.textualContent,
      visual_content: visualContentJson,
      updated_at: new Date().toISOString()
    };
    
    // Filter out undefined values
    Object.keys(updatePayload).forEach(key => 
      updatePayload[key] === undefined && delete updatePayload[key]
    );
    
    const { error } = await supabase
      .from('module_content')
      .update(updatePayload)
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

export const saveModuleContent = async (
  moduleId: string,
  content: string,
  textualContent: string,
  visualContent: Json
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('module_content')
      .insert({
        module_id: moduleId,
        content,
        textual_content: textualContent,
        visual_content: visualContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving module content:', error);
      return false;
    }

    console.log('Module content saved successfully');
    return true;
  } catch (error) {
    console.error('Exception saving module content:', error);
    return false;
  }
};
