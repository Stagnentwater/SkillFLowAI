
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Headphones, Loader2 } from 'lucide-react';
import { textToSpeech, playAudio } from '@/services/textToSpeechService';
import { toast } from 'sonner';

interface TextToSpeechButtonProps {
  text: string;
}

const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ text }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTextToSpeech = async () => {
    if (!text) {
      toast.error("No content available to read");
      return;
    }

    setIsLoading(true);
    try {
      // Trim longer text to avoid hitting API limits
      const trimmedText = text.slice(0, 3000); // Reduced limit to stay within OpenAI's free tier
      
      if (text.length > 3000) {
        toast.info("Reading first part of content due to length limits");
      }

      toast.info("Preparing audio...");
      const audioContent = await textToSpeech(trimmedText);
      
      if (audioContent) {
        toast.success("Playing audio");
        playAudio(audioContent);
      } else {
        toast.error("Could not generate audio");
      }
    } catch (error) {
      console.error("Failed to convert text to speech:", error);
      toast.error("Could not read content aloud. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleTextToSpeech} 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2"
      disabled={isLoading || !text}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Headphones className="h-4 w-4" />
      )}
      {isLoading ? "Processing..." : "Listen"}
    </Button>
  );
};

export default TextToSpeechButton;
