import React from 'react';
import { User } from 'lucide-react';
import Header from '../components/layout/Navbar'

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

const AboutUs: React.FC = () => {
  // Sample team members data - replace with your actual team members
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Jane Doe",
      role: "Lead Developer",
      image: "/api/placeholder/400/400", // Replace with actual image paths
    },
    {
      id: 2,
      name: "John Smith",
      role: "AI Specialist",
      image: "/api/placeholder/400/400",
    },
    {
      id: 3,
      name: "Alex Johnson",
      role: "UX Designer",
      image: "/api/placeholder/400/400",
    },
    {
      id: 4,
      name: "Sam Williams",
      role: "Content Manager",
      image: "/api/placeholder/400/400",
    },
  ];

  return (
    <>
    <Header/>
    <div className="bg-gray-900 min-h-screen text-white mt-16">
      {/* Header Section */}
      <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-blue-400 mb-2">About Us</h1>
      
      {/* Project Aim Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-blue-300">Our Mission</h2>
        <div className="overflow-hidden bg-gray-800 p-4 rounded-lg mb-8">
        <div className="whitespace-nowrap animate-marquee">
          <p className="text-xl">
          At SkillFlowAI, we aim to revolutionize the learning experience by leveraging AI to create personalized educational paths that adapt to individual learning styles, making skill acquisition more efficient and effective for everyone.
          </p>
        </div>
        </div>
        <p className="text-lg mb-4">
        SkillFlowAI was founded with a vision to democratize education through technology. We believe that everyone deserves access to high-quality learning materials tailored to their unique needs and preferences.
        </p>
        <p className="text-lg mb-4">
        Our platform uses advanced artificial intelligence to analyze learning patterns and generate custom courses that help users master new skills in the most efficient way possible. By combining AI-generated content with skills tracking and job matching, we've created a complete ecosystem for personal and professional growth.
        </p>
      </div>
      
      {/* Team Section */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-blue-300">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers.map((member) => (
          <div
          key={member.id}
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-blue-400/30"
          >
          <div className="h-64 overflow-hidden">
            {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
            />
            ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <User size={64} className="text-gray-400" />
            </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-blue-400">{member.name}</h3>
            <p className="text-gray-300">{member.role}</p>
          </div>
          </div>
        ))}
        </div>
      </div>
      </div>

      {/* CSS for marquee animation */}
      <style jsx>{`
      @keyframes marquee {
        0% {
        transform: translateX(100%);
        }
        100% {
        transform: translateX(-100%);
        }
      }
      .animate-marquee {
        animation: marquee 20s linear infinite;
      }
      `}</style>
    </div>
    </>
  );

};

export default AboutUs;