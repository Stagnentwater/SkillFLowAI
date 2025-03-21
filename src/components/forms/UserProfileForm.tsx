
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/AuthContext';
import { useUser } from '@/context/UserContext';
import { Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const predefinedSkills = [
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
  const [showCustomSkill, setShowCustomSkill] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const navigate = useNavigate();

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
      setShowCustomSkill(false);
    }
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
        console.log('Updating user profile with skills:', selectedSkills);
        
        // 1. Update auth user metadata first
        const { error: authError } = await supabase.auth.updateUser({
          data: { 
            name,
            skills: selectedSkills,
          }
        });
        
        if (authError) {
          console.error('Error updating auth metadata:', authError);
          toast.error('Failed to update user metadata');
          return;
        }
        
        // 2. Update the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: name,
            skills: selectedSkills,
            updated_at: new Date().toISOString()
          });
          
        if (profileError) {
          console.error('Error updating Supabase profiles table:', profileError);
          toast.error('Failed to update profile in database');
          return;
        }
        
        // 3. Also update the Learner_Profile table
        // First check if the user already exists in Learner_Profile
        const { data: existingLearner, error: checkError } = await supabase
          .from('Learner_Profile')
          .select('*')
          .eq('Email', user.email)
          .maybeSingle();
        
        if (checkError) {
          console.error('Error checking Learner_Profile:', checkError);
        }
        
        // Create or update Learner_Profile
        if (existingLearner) {
          // Update existing learner profile
          const { error: learnerUpdateError } = await supabase
            .from('Learner_Profile')
            .update({
              Name: name,
              Skills: selectedSkills,
            })
            .eq('Email', user.email);
            
          if (learnerUpdateError) {
            console.error('Error updating Learner_Profile:', learnerUpdateError);
            toast.error('Failed to update learner profile');
          }
        } else {
          // Create new learner profile
          const { error: learnerCreateError } = await supabase
            .from('Learner_Profile')
            .insert({
              Email: user.email,
              Name: name,
              Skills: selectedSkills,
              n_visual_solve: 0,
              n_textual_solve: 0,
              Courses: []
            });
            
          if (learnerCreateError) {
            console.error('Error creating Learner_Profile:', learnerCreateError);
            toast.error('Failed to create learner profile');
          }
        }
      }
      
      // Update local user profile
      await updateUserProfile({
        name,
        skills: selectedSkills,
      });
      
      toast.success('Profile updated successfully');
      navigate('/dashboard');
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
          {predefinedSkills.map((skill) => (
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
          
          {/* Custom skills that were added */}
          {selectedSkills
            .filter(skill => !predefinedSkills.includes(skill))
            .map((customSkill) => (
              <div 
                key={customSkill} 
                className="flex items-center space-x-2 p-3 border border-primary rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Checkbox 
                  id={`skill-${customSkill}`}
                  checked={true}
                  onCheckedChange={() => toggleSkill(customSkill)}
                />
                <Label 
                  htmlFor={`skill-${customSkill}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {customSkill}
                </Label>
              </div>
            ))}
            
          {/* Add custom skill button */}
          {!showCustomSkill ? (
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center p-3 border border-dashed"
              onClick={() => setShowCustomSkill(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Other Skill
            </Button>
          ) : (
            <div className="flex items-center p-3 border rounded-lg bg-muted">
              <Input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Type your skill"
                className="mr-2"
                autoFocus
              />
              <Button 
                type="button" 
                size="sm"
                onClick={addCustomSkill}
                disabled={!customSkill.trim()}
              >
                Add
              </Button>
            </div>
          )}
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
