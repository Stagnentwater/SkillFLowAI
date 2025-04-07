
import React from 'react';
import { useUser } from '@/context/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseCard from '@/components/ui/CourseCard';
import { useAuth } from '@/context/AuthContext';
import { useDashboardCourses } from '@/hooks/useDashboardCourses';

const ProfileDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { loadingCourses, enrolledCourses } = useDashboardCourses(user, isAuthenticated);

  if (loadingCourses) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Enrolled Courses</h2>
        <Link to="/home">
          <Button variant="ghost" className="gap-2">
            Explore more courses <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => (
            <CourseCard key={course.id} course={course} isEnrolled={true} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3 mb-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-medium">You haven't enrolled in any courses yet</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            Explore our catalog and find courses that match your interests.
          </p>
          <Link to="/home">
            <Button>Browse Courses</Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default ProfileDashboard;
