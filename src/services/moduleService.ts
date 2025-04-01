
import { supabase } from '@/integrations/supabase/client';
import { Module } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Fetch all modules for a course
export const fetchModules = async (courseId: string): Promise<Module[]> => {
  try {
    // Fetch the modules for the specified course
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules') // Ensure the 'modules' table exists in your Supabase database
      .select('*') // Fetch all columns
      .eq('course_id', courseId)
      .order('order', { ascending: true }); // Order by the 'order' column

    // Map the fetched data to the Module type
    const modules: Module[] = modulesData?.map((module: any) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      courseId: module.courseId,
      order: module.order,
      type: module.type,
      createdAt: module.created_at,
      updatedAt: module.updated_at,
    })) || [];

    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      return [];
    }

    // Return the mapped modules
    return modules;

  } catch (error) {
    console.error('Exception in fetchModules:', error);
    return [];
  }
};

// Fetch a single module
export const fetchModule = async (moduleId: string): Promise<Module | null> => {
  try {
    // Since we don't have a modules table yet, return a placeholder
    return {
      id: moduleId,
      title: 'Module Title',
      courseId: '1',
      order: 1,
      type: 'mixed'
    };
  } catch (error) {
    console.error('Exception in fetchModule:', error);
    return null;
  }
};

// Create a new module
export const createModule = async (
  courseId: string, 
  title: string, 
  orderNum: number,
  type: 'visual' | 'textual' | 'mixed' = 'mixed'
): Promise<Module | null> => {
  try {
    const moduleId = uuidv4();
    
    // Since we don't have a modules table yet, return a placeholder
    return {
      id: moduleId,
      title: title,
      courseId: courseId,
      order: orderNum,
      type: type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Exception in createModule:', error);
    return null;
  }
};

// Update a module
export const updateModule = async (
  moduleId: string, 
  moduleData: Partial<Omit<Module, 'id' | 'courseId' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
  try {
    // Since we don't have a modules table yet, just return success
    return true;
  } catch (error) {
    console.error('Exception in updateModule:', error);
    return false;
  }
};

// Delete a module
export const deleteModule = async (moduleId: string): Promise<boolean> => {
  try {
    // Since we don't have a modules table yet, just return success
    return true;
  } catch (error) {
    console.error('Exception in deleteModule:', error);
    return false;
  }
};
