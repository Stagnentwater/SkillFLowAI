import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medal, Trophy, Award, Loader2, Crown, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const WaterEffect = ({ children, rank }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const getGradientColor = () => {
    switch (rank) {
      case 1: return 'from-yellow-300 to-amber-500'; // Gold
      case 2: return 'from-gray-300 to-gray-500'; // Silver
      case 3: return 'from-amber-700 to-amber-900'; // Bronze
      default: return 'from-blue-300 to-blue-500'; // Default blue
    }
  };

  return (
    <div 
      className="relative overflow-hidden rounded-lg p-1 group"
      onMouseEnter={() => setIsAnimating(true)}
      onMouseLeave={() => setIsAnimating(false)}
    >
      {/* Water effect background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColor()} opacity-90 
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent_70%)]
        after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_70%)]
        ${isAnimating ? 'animate-water-flow' : ''}`}
      />
      
      {/* Content container */}
      <div className="relative bg-white dark:bg-gray-800 rounded-md p-4 transition-all duration-300 ease-in-out">
        {children}
      </div>
    </div>
  );
};

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('allTime');

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeframe]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Query to get users sorted by skills array length
      const { data, error } = await supabase
        .from('Learner_Profile')
        .select('id, Name, Email, avatar, Skills, created_at')
        .order('created_at', { ascending: timeframe === 'newest' });
      
      if (error) throw error;

      // Process data to calculate skill count and rank users
      const processedData = data
        .map(user => ({
          ...user,
          skillCount: user.Skills ? Object.keys(user.Skills).length : 0
        }))
        .sort((a, b) => b.skillCount - a.skillCount)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      setLeaderboardData(processedData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-7 w-7 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-gray-500 font-medium">{rank}</span>;
    }
  };

  // Top 3 users for the podium display
  const topUsers = leaderboardData.slice(0, 3);
  // Rest of the users
  const remainingUsers = leaderboardData.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                Leaderboard <Trophy className="h-8 w-8 text-yellow-500" />
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                See who's mastering the most skills and leading the way
              </p>
            </div>
            <Tabs defaultValue="allTime" onValueChange={setTimeframe} className="w-auto">
              <TabsList>
                <TabsTrigger value="allTime">All Time</TabsTrigger>
                <TabsTrigger value="newest">Newest</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading leaderboard data...</p>
              </div>
            </div>
          ) : leaderboardData.length > 0 ? (
            <>
              {/* Top 3 Podium */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8 text-center">Top Achievers</h2>
                <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 h-64">
                  {/* Second Place */}
                  {topUsers[1] && (
                    <div className="w-full md:w-1/4 h-4/5">
                      <WaterEffect rank={2}>
                        <div className="flex flex-col items-center">
                          <div className="text-center mb-2">
                            <Medal className="h-8 w-8 text-gray-400 mx-auto" />
                            <span className="text-xl font-bold">2nd Place</span>
                          </div>
                          <Avatar className="h-16 w-16 border-2 border-gray-400 mb-2">
                            {topUsers[1].avatar ? (
                              <img 
                                src={topUsers[1].avatar} 
                                alt={topUsers[1].Name} 
                                className="object-cover"
                              />
                            ) : (
                              <div className="bg-primary h-full w-full flex items-center justify-center text-white text-xl font-medium">
                                {topUsers[1].Name?.charAt(0) || topUsers[1].Email?.charAt(0) || '?'}
                              </div>
                            )}
                          </Avatar>
                          <h3 className="font-bold text-lg truncate w-full text-center">{topUsers[1].Name || 'Anonymous'}</h3>
                          <div className="flex items-center mt-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            <span className="font-bold mr-1">{topUsers[1].skillCount}</span>
                            <Award className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </WaterEffect>
                    </div>
                  )}
                  
                  {/* First Place */}
                  {topUsers[0] && (
                    <div className="w-full md:w-1/3 h-full">
                      <WaterEffect rank={1}>
                        <div className="flex flex-col items-center">
                          <div className="text-center mb-3">
                            <Crown className="h-10 w-10 text-yellow-500 mx-auto" />
                            <span className="text-2xl font-bold">1st Place</span>
                          </div>
                          <Avatar className="h-20 w-20 border-4 border-yellow-500 mb-3">
                            {topUsers[0].avatar ? (
                              <img 
                                src={topUsers[0].avatar} 
                                alt={topUsers[0].Name} 
                                className="object-cover"
                              />
                            ) : (
                              <div className="bg-primary h-full w-full flex items-center justify-center text-white text-2xl font-medium">
                                {topUsers[0].Name?.charAt(0) || topUsers[0].Email?.charAt(0) || '?'}
                              </div>
                            )}
                          </Avatar>
                          <h3 className="font-bold text-xl truncate w-full text-center">{topUsers[0].Name || 'Anonymous'}</h3>
                          <div className="flex items-center mt-3 bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-full">
                            <span className="font-bold text-lg mr-1">{topUsers[0].skillCount}</span>
                            <Award className="h-5 w-5 text-yellow-500" />
                          </div>
                        </div>
                      </WaterEffect>
                    </div>
                  )}
                  
                  {/* Third Place */}
                  {topUsers[2] && (
                    <div className="w-full md:w-1/4 h-3/4">
                      <WaterEffect rank={3}>
                        <div className="flex flex-col items-center">
                          <div className="text-center mb-2">
                            <Medal className="h-7 w-7 text-amber-700 mx-auto" />
                            <span className="text-lg font-bold">3rd Place</span>
                          </div>
                          <Avatar className="h-14 w-14 border-2 border-amber-700 mb-2">
                            {topUsers[2].avatar ? (
                              <img 
                                src={topUsers[2].avatar} 
                                alt={topUsers[2].Name} 
                                className="object-cover"
                              />
                            ) : (
                              <div className="bg-primary h-full w-full flex items-center justify-center text-white text-lg font-medium">
                                {topUsers[2].Name?.charAt(0) || topUsers[2].Email?.charAt(0) || '?'}
                              </div>
                            )}
                          </Avatar>
                          <h3 className="font-bold truncate w-full text-center">{topUsers[2].Name || 'Anonymous'}</h3>
                          <div className="flex items-center mt-2 bg-amber-100 dark:bg-amber-900 px-3 py-1 rounded-full">
                            <span className="font-bold mr-1">{topUsers[2].skillCount}</span>
                            <Award className="h-4 w-4 text-amber-700" />
                          </div>
                        </div>
                      </WaterEffect>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Leaderboard Table */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6" /> 
                    All Learners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-2">
                      <div className="col-span-1 text-center">Rank</div>
                      <div className="col-span-7">User</div>
                      <div className="col-span-4 text-right">Skills</div>
                    </div>
                    
                    {leaderboardData.map((user) => (
                      <div 
                        key={user.id} 
                        className={`grid grid-cols-12 gap-4 items-center py-3 px-2 rounded-lg transition-colors ${
                          user.rank <= 3 ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900' : ''
                        }`}
                      >
                        <div className="col-span-1 text-center">
                          {getRankBadge(user.rank)}
                        </div>
                        <div className="col-span-7 flex items-center gap-3">
                          <Avatar className={`h-10 w-10 border ${
                            user.rank === 1 ? 'border-yellow-500' : 
                            user.rank === 2 ? 'border-gray-400' : 
                            user.rank === 3 ? 'border-amber-700' : 'border-gray-200 dark:border-gray-700'
                          }`}>
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.Name} 
                                className="object-cover"
                              />
                            ) : (
                              <div className="bg-primary h-full w-full flex items-center justify-center text-white font-medium">
                                {user.Name?.charAt(0) || user.Email?.charAt(0) || '?'}
                              </div>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.Name || 'Anonymous User'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.Email || 'No email'}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-lg font-bold">{user.skillCount}</span>
                            <Award className={`h-5 w-5 ${
                              user.rank === 1 ? 'text-yellow-500' : 
                              user.rank === 2 ? 'text-gray-400' : 
                              user.rank === 3 ? 'text-amber-700' : 'text-primary'
                            }`} />
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.skillCount === 1 ? 'skill' : 'skills'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-24 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-medium mb-2">No users found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                There are no users in the leaderboard yet. Users will appear here once they start acquiring skills.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LeaderboardPage;