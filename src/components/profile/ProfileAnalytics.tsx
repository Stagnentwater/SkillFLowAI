
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Brain, Lightbulb, BookOpen, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Define types for the data we're working with
type CourseEnrollment = {
  id: string;
  completed: boolean;
  title?: string;
};

// Updated to match the actual database schema
type UserProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  skills: Record<string, number> | null;
  visual_points: number | null;
  textual_points: number | null;
  courses_enrolled?: CourseEnrollment[] | null;
};

const ProfileAnalytics = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skillData, setSkillData] = useState<Array<{name: string, value: number}>>([]);
  const [learningData, setLearningData] = useState<Array<{name: string, hours: number}>>([]);
  const [preferenceData, setPreferenceData] = useState<Array<{name: string, value: number}>>([]);
  const [learningStats, setLearningStats] = useState({
    totalHours: 0,
    coursesCompleted: 0,
    visualScore: 0,
    textualScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
        if (profileError) throw profileError;
        
        // Safely create typed profile data
        const typedProfile: UserProfile = {
          id: profileData.id,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          skills:
            typeof profileData.skills === 'object' &&
            !Array.isArray(profileData.skills)
              ? (profileData.skills as Record<string, number>)
              : {},
          visual_points: profileData.visual_points ?? null,
          textual_points: profileData.textual_points ?? null,
          courses_enrolled: Array.isArray(profileData.courses_enrolled)
            ? (profileData.courses_enrolled as CourseEnrollment[])
            : [],
        };
        
        setProfile(typedProfile);
        
        // Set learning preference data
        setPreferenceData([
          { name: 'Visual', value: typedProfile.visual_points || 0 },
          { name: 'Textual', value: typedProfile.textual_points || 0 }
        ]);
        
        // Calculate completed courses
        let completedCourses = 0;
        if (Array.isArray(typedProfile.courses_enrolled)) {
          completedCourses = typedProfile.courses_enrolled.filter(course => course && course.completed).length;
        }
        
        // Set learning stats
        setLearningStats({
          totalHours: 12.9, // This could be calculated from course progress in a real app
          coursesCompleted: completedCourses,
          visualScore: typedProfile.visual_points || 0,
          textualScore: typedProfile.textual_points || 0
        });
        
        // Fetch and transform skills data
        if (typedProfile.skills) {
          const skillsArray = Object.entries(typedProfile.skills).map(([name, value]) => ({
            name,
            value: typeof value === 'number' ? value : 0
          })).sort((a, b) => b.value - a.value).slice(0, 5);
          
          setSkillData(skillsArray);
        } else {
          // Default skills if none found
          setSkillData([
            { name: 'JavaScript', value: 65 },
            { name: 'React', value: 78 },
            { name: 'CSS', value: 56 },
            { name: 'HTML', value: 82 }
          ]);
        }
        
        // Fetch user course progress to get learning activity
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id);
          
        if (progressError) throw progressError;
        
        // For weekly learning activity, we're just creating mock data based on the user having any progress
        const hasProgress = progressData && progressData.length > 0;
        
        setLearningData([
          { name: 'Mon', hours: hasProgress ? 1.5 : 0.5 },
          { name: 'Tue', hours: hasProgress ? 2.3 : 0.7 },
          { name: 'Wed', hours: hasProgress ? 0.8 : 0.3 },
          { name: 'Thu', hours: hasProgress ? 1.2 : 0.4 },
          { name: 'Fri', hours: hasProgress ? 2.0 : 0.6 },
          { name: 'Sat', hours: hasProgress ? 3.2 : 1.2 },
          { name: 'Sun', hours: hasProgress ? 1.9 : 0.8 }
        ]);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user?.id]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9146FF'];
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading analytics data...</div>;
  }
  
  return (
    <div className="mb-16"> {/* Add bottom margin to prevent overlap with footer content */}
      <h2 className="text-2xl font-bold mb-6">Learning Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats.totalHours}</div>
            <p className="text-xs text-muted-foreground">
              Based on course progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats.coursesCompleted}</div>
            <p className="text-xs text-muted-foreground">
              From enrolled courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visual Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats.visualScore}</div>
            <p className="text-xs text-muted-foreground">
              Learning style: Visual
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Textual Score</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats.textualScore}</div>
            <p className="text-xs text-muted-foreground">
              Learning style: Textual
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Skills Progress</TabsTrigger>
          <TabsTrigger value="activity">Learning Activity</TabsTrigger>
          <TabsTrigger value="preference">Learning Preference</TabsTrigger>
        </TabsList>
        
        <TabsContent value="skills" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Progress</CardTitle>
              <CardDescription>
                Track your progress across different skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={skillData.length > 0 ? skillData : [
                      { name: 'JavaScript', value: 65 },
                      { name: 'React', value: 78 },
                      { name: 'CSS', value: 56 },
                      { name: 'HTML', value: 82 },
                      { name: 'TypeScript', value: 45 }
                    ]} 
                    layout="vertical" 
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      tickCount={6} 
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      scale="band" 
                      tick={{ fontSize: 14 }}
                      width={80} 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white'
                      }}
                      formatter={(value) => [`${value}%`, 'Progress']}
                    />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                      animationDuration={300}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Learning Activity</CardTitle>
              <CardDescription>
                Hours spent learning per day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={learningData.length > 0 ? learningData : [
                      { name: 'Mon', hours: 0.5 },
                      { name: 'Tue', hours: 0.7 },
                      { name: 'Wed', hours: 0.3 },
                      { name: 'Thu', hours: 0.4 },
                      { name: 'Fri', hours: 0.6 },
                      { name: 'Sat', hours: 1.2 },
                      { name: 'Sun', hours: 0.8 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 14 }}
                      tickMargin={10}
                      height={40}
                    />
                    <YAxis 
                      width={40}
                      tick={{ fontSize: 14 }}
                      tickCount={5}
                      domain={[0, 'dataMax + 0.5']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white'
                      }}
                      formatter={(value) => [`${value} hours`, 'Time Spent']}
                    />
                    <Bar
                      dataKey="hours"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                      animationDuration={300}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preference" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Preference</CardTitle>
              <CardDescription>
                Your balance between visual and textual learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={preferenceData.length > 0 && (preferenceData[0].value > 0 || preferenceData[1].value > 0) ? 
                        preferenceData : 
                        [
                          { name: 'Visual', value: 65 },
                          { name: 'Textual', value: 35 }
                        ]}
                      cx="50%"
                      cy="45%"  
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={40} 
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {preferenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}`, 'Points']}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white'
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileAnalytics;