
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  skills: string[];
  description: string;
}

// Sample job listings for demonstration
const SAMPLE_JOBS: JobListing[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'Remote',
    salary: '$85,000 - $120,000',
    skills: ['JavaScript', 'React', 'CSS', 'HTML'],
    description: 'We are looking for an experienced frontend developer proficient in React and modern JavaScript.'
  },
  {
    id: '2',
    title: 'UX Designer',
    company: 'DesignHub',
    location: 'New York, NY',
    salary: '$90,000 - $130,000',
    skills: ['UI/UX', 'Figma', 'Design Systems', 'User Research'],
    description: 'Join our team to create beautiful and intuitive user experiences for our clients.'
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: 'GrowthStartup',
    location: 'San Francisco, CA',
    salary: '$120,000 - $160,000',
    skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
    description: 'Looking for a full stack developer who can work across our entire application stack.'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Remote',
    salary: '$110,000 - $150,000',
    skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD'],
    description: 'Help us build and maintain robust cloud infrastructure and deployment pipelines.'
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'DataInsights Co.',
    location: 'Boston, MA',
    salary: '$130,000 - $170,000',
    skills: ['Python', 'Machine Learning', 'SQL', 'Data Visualization'],
    description: 'Join our data science team to extract insights from complex datasets and build predictive models.'
  },
];

// Top job positions for marquee
const TOP_POSITIONS = [
  { title: 'Senior Software Engineer', salary: '$150K-$220K' },
  { title: 'Product Manager', salary: '$120K-$180K' },
  { title: 'DevOps Specialist', salary: '$130K-$190K' },
  { title: 'UX/UI Designer', salary: '$90K-$140K' },
  { title: 'Data Scientist', salary: '$140K-$200K' },
  { title: 'Full Stack Developer', salary: '$100K-$160K' },
  { title: 'Machine Learning Engineer', salary: '$160K-$230K' },
  { title: 'Cloud Architect', salary: '$170K-$240K' },
];

const JobSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  
  // User's skills from their profile
  const userSkills = user?.skills || [];
  
  // Simulate a search by filtering the sample jobs
  const handleSearch = () => {
    setSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let results = [...SAMPLE_JOBS];
      
      if (searchQuery.trim()) {
        results = results.filter(job => 
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Sort jobs to prioritize those matching user skills
      results.sort((a, b) => {
        const aMatchCount = a.skills.filter(skill => 
          userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
        ).length;
        
        const bMatchCount = b.skills.filter(skill => 
          userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
        ).length;
        
        return bMatchCount - aMatchCount;
      });
      
      setJobListings(results);
      setSearching(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Skills Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Your Skills</h2>
            <div className="flex flex-wrap gap-2">
              {userSkills.length > 0 ? (
                userSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Complete courses to earn skills that will appear here.
                </p>
              )}
            </div>
          </div>
          
          {/* Marquee of Top Positions */}
          <div className="relative overflow-hidden py-4 mb-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="animate-marquee whitespace-nowrap inline-block">
              {TOP_POSITIONS.map((position, index) => (
                <span key={index} className="mx-8 inline-flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{position.title}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">{position.salary}</span>
                </span>
              ))}
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap inline-block">
              {TOP_POSITIONS.map((position, index) => (
                <span key={index} className="mx-8 inline-flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{position.title}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">{position.salary}</span>
                </span>
              ))}
            </div>
          </div>
          
          {/* Search Section */}
          <Card className="p-6 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-3">Find Your Next Career Opportunity</h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Search for jobs that match your skills and interests. Our intelligent matching system will prioritize positions that align with your skill set.
              </p>
            </div>
            
            <div className="flex gap-3 max-w-2xl mx-auto">
              <Input 
                placeholder="Search job titles, skills, or companies..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-grow"
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <SearchIcon className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </Card>
          
          {/* Job Results */}
          {jobListings.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Job Opportunities</h2>
              
              {jobListings.map(job => {
                const matchingSkills = job.skills.filter(skill => 
                  userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
                );
                
                return (
                  <Card key={job.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <div className="text-gray-600 dark:text-gray-400 mb-2">
                          {job.company} • {job.location}
                        </div>
                        <div className="text-lg font-medium text-primary mb-3">
                          {job.salary}
                        </div>
                        <p className="mb-4">{job.description}</p>
                        
                        <div className="mb-3">
                          <span className="text-sm font-semibold">Required Skills:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.skills.map((skill, index) => {
                              const isMatch = userSkills.some(
                                userSkill => userSkill.toLowerCase() === skill.toLowerCase()
                              );
                              
                              return (
                                <Badge 
                                  key={index} 
                                  variant={isMatch ? "default" : "outline"}
                                  className={isMatch ? "bg-green-500" : ""}
                                >
                                  {skill}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        {matchingSkills.length > 0 && (
                          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm py-1 px-3 rounded-full mb-3">
                            {matchingSkills.length}/{job.skills.length} skills match
                          </div>
                        )}
                        <Button className="min-w-[120px]">Apply Now</Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : searching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Searching for job opportunities...</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Start your job search</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Enter a job title, skill, or company name to find opportunities that match your profile.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobSearch;
