
import React from 'react';
import { Quiz, Question } from '@/types';
import { Button } from '@/components/ui/button';

interface ModuleQuizProps {
  quiz: Quiz;
  selectedAnswers: Record<string, string>;
  onAnswerSelect: (questionId: string, answer: string) => void;
  onSubmit: () => void;
}

const ModuleQuiz = ({
  quiz,
  selectedAnswers,
  onAnswerSelect,
  onSubmit
}: ModuleQuizProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Module Quiz</h2>
      
      <div className="space-y-8">
        {quiz.questions.map((question: Question, index: number) => (
          <div key={question.id} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {index + 1}. {question.text}
            </h3>
            
            {question.type === 'visual' && (
              <div className="mb-4">
                <img 
                  src="https://placehold.co/600x400/3b82f6/ffffff.jpg?text=Question+Diagram" 
                  alt="Question diagram" 
                  className="rounded-lg"
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
                  onClick={() => onAnswerSelect(question.id, option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  );
};

export default ModuleQuiz;
