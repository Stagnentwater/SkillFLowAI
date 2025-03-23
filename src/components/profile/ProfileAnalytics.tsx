
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Brain, Lightbulb, BookOpen, Award } from 'lucide-react';

const ProfileAnalytics = () => {
  const { user } = useAuth();
  
  // Mock data - in a real app this would come from the API
  const skillData = [
    { name: 'JavaScript', value: 75 },
    { name: 'React', value: 60 },
    { name: 'TypeScript', value: 45 },
    { name: 'CSS', value: 80 },
    { name: 'HTML', value: 90 },
  ];
  
  const learningData = [
    { name: 'Mon', hours: 1.5 },
    { name: 'Tue', hours: 2.3 },
    { name: 'Wed', hours: 0.8 },
    { name: 'Thu', hours: 1.2 },
    { name: 'Fri', hours: 2.0 },
    { name: 'Sat', hours: 3.2 },
    { name: 'Sun', hours: 1.9 },
  ];
  
  const preferenceData = [
    { name: 'Visual', value: user?.visualPoints || 25 },
    { name: 'Textual', value: user?.textualPoints || 15 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9146FF'];
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Learning Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.9</div>
            <p className="text-xs text-muted-foreground">
              +2.1 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +1 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visual Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.visualPoints || 0}</div>
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
            <div className="text-2xl font-bold">{user?.textualPoints || 0}</div>
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
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  skills: { theme: { light: "#3b82f6", dark: "#3b82f6" } },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" scale="band" />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltipContent>
                              {payload.map((entry, index) => (
                                <div key={`item-${index}`}>
                                  <div className="flex items-center">
                                    <div className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span>{entry.name}: {entry.value}%</span>
                                  </div>
                                </div>
                              ))}
                            </ChartTooltipContent>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--color-skills)"
                      radius={[4, 4, 4, 4]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
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
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  hours: { theme: { light: "#10b981", dark: "#10b981" } },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={learningData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltipContent>
                              {payload.map((entry, index) => (
                                <div key={`item-${index}`}>
                                  <div className="flex items-center">
                                    <div className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span>{entry.name}: {entry.value} hours</span>
                                  </div>
                                </div>
                              ))}
                            </ChartTooltipContent>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="hours"
                      fill="var(--color-hours)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
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
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preferenceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {preferenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileAnalytics;
