import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../components/layout/Navbar'
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  // State to track which FAQ items are expanded
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  // Toggle the expanded state of an FAQ item
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  // Sample FAQ data - replace with your actual FAQs
  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: "How does SkillFlowAI generate personalized courses?",
      answer: "SkillFlowAI uses advanced AI algorithms to analyze your learning style, preferences, and goals. When you provide a topic or skill you want to learn, our system generates custom course content tailored specifically to you, ensuring the most efficient and effective learning experience possible.",
      category: "Platform"
    },
    {
      id: 2,
      question: "Is SkillFlowAI free to use?",
      answer: "SkillFlowAI offers both free and premium tiers. The free tier provides access to basic features and a limited number of AI-generated courses. Premium subscriptions unlock unlimited course generation, advanced personalization, and exclusive job matching features.",
      category: "Pricing"
    },
    {
      id: 3,
      question: "Can I create my own courses on SkillFlowAI?",
      answer: "Yes! SkillFlowAI allows you to create custom courses by simply describing the topic and learning objectives. Our AI will generate comprehensive course materials based on your input, which you can then refine and customize as needed.",
      category: "Courses"
    },
    {
      id: 4,
      question: "How does the job matching feature work?",
      answer: "As you complete courses and quizzes on SkillFlowAI, your skills profile is automatically updated. Our system then compares your skills profile with job listings to find positions that match your capabilities. You can apply directly to these matched jobs through our platform.",
      category: "Jobs"
    },
    {
      id: 5,
      question: "How accurate are the AI-generated courses?",
      answer: "SkillFlowAI courses are designed to provide accurate, up-to-date information. Our AI draws from trusted educational resources and is regularly updated. However, we recommend checking critical information from multiple sources, especially for rapidly changing fields.",
      category: "Courses"
    },
    {
      id: 6,
      question: "Can I track my learning progress?",
      answer: "Absolutely! SkillFlowAI provides detailed progress tracking for all courses you're enrolled in. You can view your completion percentage, quiz scores, and skill development over time through your personal dashboard.",
      category: "Platform"
    },
    {
      id: 7,
      question: "What types of skills can I learn on SkillFlowAI?",
      answer: "SkillFlowAI supports a wide range of skills across technical (programming, data science, design), professional (leadership, communication, project management), and creative domains (writing, design thinking, digital art). If you can describe it, our AI can likely create a course for it.",
      category: "Courses"
    },
    {
      id: 8,
      question: "How do I get help if I have issues with the platform?",
      answer: "You can reach our support team via the Contact Us page. We aim to respond to all inquiries within 24 hours. We also have an extensive knowledge base and community forum where you might find immediate answers to common questions.",
      category: "Support"
    },
  ];

  // Group FAQ items by category
  const groupedFAQs: Record<string, FAQItem[]> = faqItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  // Get unique categories
  const categories = Object.keys(groupedFAQs);

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-slide-in-down">
              Frequently Asked Questions
            </h1>
            <p className="text-foreground/80 text-lg max-w-3xl mx-auto mb-8 animate-fade-in delay-150">
              Find answers to common questions about SkillFlowAI's platform, courses, and features. If you can't find what you're looking for, feel free to contact our support team.
            </p>
            <div className="flex justify-center mb-8">
              <span className="inline-block w-32 h-1 rounded-full bg-gradient-to-r from-primary to-purple-600 animate-fade-in" />
            </div>
          </section>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto animate-slide-in-up">
            {categories.map((category, catIdx) => (
              <div key={category} className="mb-10 animate-fade-in" style={{ animationDelay: `${catIdx * 100}ms` }}>
                <h2 className="text-2xl font-semibold mb-4 text-primary animate-slide-in-down">{category}</h2>
                <div className="space-y-4">
                  {groupedFAQs[category].map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="border border-border rounded-lg overflow-hidden shadow-sm bg-card/80 animate-pop-up"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <button
                        className="w-full text-left p-4 flex justify-between items-center bg-card hover:bg-card/80 transition-colors"
                        onClick={() => toggleExpand(item.id)}
                        aria-expanded={expandedIds.includes(item.id)}
                      >
                        <span className="font-medium text-foreground">{item.question}</span>
                        {expandedIds.includes(item.id) ? (
                          <ChevronUp className="h-5 w-5 text-primary shrink-0 transition-transform duration-300 rotate-180" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-primary shrink-0 transition-transform duration-300" />
                        )}
                      </button>
                      <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden bg-card/50 border-t border-border ${expandedIds.includes(item.id) ? 'max-h-40 opacity-100 p-4 pt-0' : 'max-h-0 opacity-0 p-0'}`}
                        style={{ pointerEvents: expandedIds.includes(item.id) ? 'auto' : 'none' }}
                      >
                        <p className="text-foreground/80">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support CTA */}
          <div className="mt-20 text-center animate-fade-in">
            <h3 className="text-xl font-medium mb-4 text-foreground">Still have questions?</h3>
            <p className="text-foreground/80 mb-6">We're here to help! Reach out to our support team.</p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full text-white bg-gradient-to-r from-primary to-purple-600 shadow-lg hover:scale-105 hover:shadow-primary/30 transition-all duration-300 animate-pop-up"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;