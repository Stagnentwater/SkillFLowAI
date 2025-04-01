import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateModules } from "./modules.ts";
// Removed duplicate import of generateContent
import { corsHeaders } from "./utils.ts";

import { supabase } from '../../../src/integrations/supabase/client.ts'; // Adjusted the relative path
import { generateContent } from './content';

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const moduleId = url.searchParams.get('moduleId');

  if (!moduleId) {
    return new Response('Module ID is required', { status: 400 });
  }

  try {
    // Extract the Bearer token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Authorization header is missing or invalid', { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token and get the user details
    const { data: authenticatedUser, error: userError } = await supabase.auth.getUser(token);
    if (userError || !authenticatedUser) {
      console.error('Error verifying user token:', userError);
      return new Response('Failed to verify user token', { status: 401 });
    }

    const userId = authenticatedUser[0].id;
    // Fetch module details from the database
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, description, course_id')
      .eq('id', moduleId)
      .single();

    if (moduleError || !moduleData) {
      console.error('Error fetching module details:', moduleError);
      return new Response('Failed to fetch module details', { status: 500 });
    }

    const { title, description ,course_id} = moduleData;
    const course=await supabase
      .from('Courses_Table')
      .select('name,description')
      .eq('id', parseInt(course_id));
      const c_name=course[0].name;

    const learnerProfile = await supabase
      .from('Learner_Profile')
      .select('id, visual_points, textual_points, skills')
      .eq('id', userId)
      .single();


    // Generate content using the Gemini API
    const contentResponse = await generateContent({
      moduleId,
      moduleTitle: title,
      moduleDescription: description ?? '',
      courseDescription: description == null ? "" : description,
      courseTitle: c_name, // Replace with actual course title
      userId: userId, // Replace with actual user ID
      visualPoints: learnerProfile[0].visual_points, // Replace with actual visual points
      textualPoints: learnerProfile[0].textual_points, // Replace with actual textual points
      userSkills: learnerProfile[0].skills, // Replace with actual user skills
    });

    const contentData = await contentResponse.json();

    return new Response(JSON.stringify(contentData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return new Response('Failed to generate content', { status: 500 });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();

    if (action === 'generateModules') {
      return await generateModules(data);
    } else if (action === 'generateContent') {
      return await generateContent(data);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
