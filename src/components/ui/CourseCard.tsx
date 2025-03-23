
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  isCreator?: boolean;
  isEnrolled?: boolean;
}

const CourseCard = ({ course, isCreator = false, isEnrolled = false }: CourseCardProps) => {
  const { id, title, description, coverImage, viewCount, skillsOffered, creatorName } = course;

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg">
      <div className="aspect-video overflow-hidden relative">
        <img
          src={coverImage || "/placeholder.svg"}
          alt={title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
        {isCreator && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded-md">
            Creator
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2 flex-grow">
        <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <span>By {creatorName}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 py-2 flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3">{description}</p>
        
        {skillsOffered && skillsOffered.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {skillsOffered.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary"
                >
                  {skill}
                </span>
              ))}
              {skillsOffered.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  +{skillsOffered.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          <span>{viewCount || 0} enrolled</span>
        </div>
        
        {isEnrolled ? (
          <Link to={`/course/${id}`}>
            <Button size="sm" variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              View Modules
            </Button>
          </Link>
        ) : (
          <Link to={`/course/${id}`}>
            <Button size="sm">
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
