
import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '@/types';
import { Eye, User, Calendar } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  isCreator?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isCreator = false }) => {
  const formattedDate = new Date(course.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Fallback image if none provided
  const coverImage = course.coverImage || 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2';

  return (
    <Link 
      to={`/course/${course.id}`} 
      className="block group transition-all duration-300 rounded-xl overflow-hidden bg-gray-800 shadow-sm hover:shadow-lg border border-gray-700 transform hover:-translate-y-1"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <img 
          src={coverImage}
          alt={course.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Skills tag overlay */}
        {course.skillsOffered && course.skillsOffered.length > 0 && (
          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1">
            {course.skillsOffered.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="inline-block text-xs px-2 py-1 rounded-full bg-gray-900/80 backdrop-blur-sm font-medium text-primary"
              >
                {skill}
              </span>
            ))}
            {course.skillsOffered.length > 3 && (
              <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-900/80 backdrop-blur-sm font-medium text-primary">
                +{course.skillsOffered.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Creator badge */}
        {isCreator && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white">
            Your Course
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center text-gray-400">
              <User className="w-4 h-4 mr-1" />
              {course.creatorName || 'SkillFlowAI'}
            </span>
            
            <span className="flex items-center text-gray-400">
              <Eye className="w-4 h-4 mr-1" />
              {course.viewCount || 0}
            </span>
          </div>
          
          <span className="flex items-center text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            {formattedDate}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
