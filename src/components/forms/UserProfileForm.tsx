
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/AuthContext';
import { useUser } from '@/context/UserContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const skills = [
  'JavaScript', 'Python', 'Java', 'HTML/CSS', 'React', 
  'Node.js', 'SQL', 'Data Science', 'Machine Learning',
  'Design', 'Marketing', 'Writing', 'Project Management'
];

const UserProfileForm = () => {
  const { user } = useAuth();
  const { updateUserProfile } = useUser();
  const [name, setName] = useState(user?.name || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error('Please enter your name');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Update profile in Supabase if authenticated
      if (user?.id) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: name,
            skills: selectedSkills,
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Error updating Supabase profile:', error);
          toast.error('Failed to update profile in database');
          return;
        }
      }
      
      // Update local user profile
      await updateUserProfile({
        name,
        skills: selectedSkills,
      });
      
      toast.success('Profile updated successfully');
      navigate('/home');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-4">
        <Label htmlFor="name" className="text-lg">Your Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 text-lg"
          required
        />
      </div>
      
      <div className="space-y-4">
        <Label className="text-lg block mb-4">Your Skills</Label>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select the skills you already possess. This helps us personalize your learning experience.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {skills.map((skill) => (
            <div 
              key={skill} 
              className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Checkbox 
                id={`skill-${skill}`}
                checked={selectedSkills.includes(skill)}
                onCheckedChange={() => toggleSkill(skill)}
              />
              <Label 
                htmlFor={`skill-${skill}`}
                className="text-sm cursor-pointer flex-1"
              >
                {skill}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <Button
        type="submit" 
        className="w-full py-6 text-base font-medium mt-8"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Profile...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </form>
  );
};

export default UserProfileForm;
