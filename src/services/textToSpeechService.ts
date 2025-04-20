
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const textToSpeech = async (text: string): Promise<string | null> => {
  try {
    // Trim text to reasonable length (OpenAI has character limits)
    const trimmedText = text.slice(0, 3000); // Using a smaller limit for the free tier
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("text-to-speech", {
      body: { text: trimmedText },
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`API error: ${error.message}`);
    }

    if (!data?.audioContent) {
      console.error("No audio content returned:", data);
      throw new Error("No audio content returned");
    }

    return data.audioContent; // Base64 encoded audio content
  } catch (error) {
    console.error("Text-to-speech error:", error);
    toast.error("Failed to convert text to speech");
    return null;
  }
};

export const playAudio = (base64Audio: string): void => {
  try {
    // Create an audio element to play the speech
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    
    // Add error handling for audio playback
    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      toast.error("Failed to play audio");
    };
    
    audio.play().catch(err => {
      console.error("Failed to play audio:", err);
      toast.error("Failed to play audio: " + err.message);
    });
  } catch (error) {
    console.error("Error creating audio:", error);
    toast.error("Failed to create audio player");
  }
};
