
import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import anime from 'animejs';

interface ModuleQuizProps {
  quiz: Quiz;
  selectedAnswers: Record<string, string>;
  onAnswerSelect: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  submitted?: boolean;
  score?: number;
  totalQuestions?: number;
}

const ModuleQuiz = ({
  quiz,
  selectedAnswers,
  onAnswerSelect,
  onSubmit,
  loading = false,
  submitted = false,
  score = 0,
  totalQuestions = 0
}: ModuleQuizProps) => {
  // Calculate progress percentage for the quiz
  const progressPercentage = Object.keys(selectedAnswers).length / quiz.questions.length * 100;
  
  // Trigger animations when component mounts
  useEffect(() => {
    // Animate the header
    anime({
      targets: '.quiz-title',
      translateY: [20, 0],
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 800
    });
    
    // Animate the questions with a staggered delay
    anime({
      targets: '.question-card',
      translateY: [20, 0],
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 800,
      delay: anime.stagger(150)
    });
  }, []);
  
  // Trigger confetti when quiz is submitted and score is good
  useEffect(() => {
    if (submitted && score >= (totalQuestions * 0.8)) {
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a']
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
      
      // Animate the result content
      anime({
        targets: '.result-content',
        scale: [0.9, 1],
        opacity: [0, 1],
        easing: 'easeOutElastic(1, .8)',
        duration: 1200
      });
    }
  }, [submitted, score, totalQuestions]);
  
  // Animate option selection
  const animateSelection = (element: HTMLElement) => {
    anime({
      targets: element,
      scale: [1, 1.02, 1],
      backgroundColor: ['rgba(var(--primary), 0.1)', 'rgba(var(--primary), 0.2)', 'rgba(var(--primary), 0.1)'],
      easing: 'easeInOutQuad',
      duration: 300
    });
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold quiz-title opacity-0">Course Quiz</h2>
        {!submitted && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {Object.keys(selectedAnswers).length}/{quiz.questions.length} answered
            </span>
            <Progress value={progressPercentage} className="w-24" />
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading quiz questions...</p>
        </div>
      ) : submitted ? (
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg result-content opacity-0">
          <div className="flex flex-col items-center justify-center py-6">
            <div className={`rounded-full p-3 mb-4 ${score >= (totalQuestions * 0.8) ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
              {score >= (totalQuestions * 0.8) ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <AlertCircle className="h-8 w-8" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {score >= (totalQuestions * 0.8) ? 'Congratulations!' : 'Not quite there yet!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You scored {score}/{totalQuestions} correct answers
              {score >= (totalQuestions * 0.8) ? ' and have earned the skills from this course!' : '.'}
            </p>
            <Progress 
              value={(score / totalQuestions) * 100} 
              className="w-full h-4 mb-2"
              indicatorClassName={score >= (totalQuestions * 0.8) ? "bg-green-500" : "bg-amber-500"}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {quiz.questions.map((question: Question, index: number) => (
            <div key={question.id} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg question-card opacity-0">
              <h3 className="text-lg font-medium mb-4">
                {index + 1}. {question.text}
              </h3>
              
              {question.type === 'visual' && question.imageUrl && (
                <div className="mb-4">
                  <img 
                    src={question.imageUrl} 
                    alt="Question diagram" 
                    className="rounded-lg max-w-full max-h-64 mx-auto"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div 
                    key={option} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAnswers[question.id] === option
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      onAnswerSelect(question.id, option);
                      animateSelection(document.activeElement as HTMLElement);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && !submitted && (
        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => {
              // Animate button press
              anime({
                targets: '.submit-button',
                scale: [1, 0.95, 1],
                duration: 300,
                easing: 'easeInOutQuad'
              });
              onSubmit();
            }}
            disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
            className="px-6 submit-button"
          >
            Submit Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export default ModuleQuiz;
