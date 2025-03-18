
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { createCourse } from '@/services/api';
import { Loader2 } from 'lucide-react';

const skills = [
  'JavaScript', 'Python', 'Java', 'HTML/CSS', 'React', 
  'Node.js', 'SQL', 'Data Science', 'Machine Learning',
  'Design', 'Marketing', 'Writing', 'Project Management'
];

const CourseCreationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !systemPrompt || selectedSkills.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (systemPrompt.length < 50) {
      toast.error('System prompt should be at least 50 characters');
      return;
    }
    
    if (!user) {
      toast.error('You need to be logged in to create a course');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const courseData = {
        title,
        description,
        coverImage: coverImage || 'https://placehold.co/1200x630/3b82f6/ffffff.jpg?text=Course',
        skillsOffered: selectedSkills,
        systemPrompt,
      };
      
      const newCourse = await createCourse(courseData, user.id, user.name);
      
      toast.success('Course created successfully!');
      navigate(`/course/${newCourse.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="title" className="text-lg">Course Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Complete Python Masterclass"
          className="w-full p-3"
          required
        />
      </div>
      
      <div className="space-y-4">
        <Label htmlFor="description" className="text-lg">Course Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what students will learn in this course"
          className="w-full p-3 min-h-[100px]"
          required
        />
      </div>
      
      <div className="space-y-4">
        <Label htmlFor="coverImage" className="text-lg">Cover Image URL</Label>
        <Input
          id="coverImage"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://example.com/your-image.jpg"
          className="w-full p-3"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Leave blank to use a default image.
        </p>
      </div>
      
      <div className="space-y-4">
        <Label htmlFor="systemPrompt" className="text-lg">Course Content Prompt (100+ chars)</Label>
        <Textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Provide a detailed description of what this course should teach. This will be used to generate the course content."
          className="w-full p-3 min-h-[200px]"
          required
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This prompt will guide our AI in generating your course content. Be specific about topics, concepts, and learning objectives.
        </p>
      </div>
      
      <div className="space-y-4">
        <Label className="text-lg block mb-4">Skills This Course Offers</Label>
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
            Creating Course...
          </>
        ) : (
          'Create Course'
        )}
      </Button>
    </form>
  );
};

export default CourseCreationForm;
