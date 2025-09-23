import React, { useState } from "react";
// Define the shape of our data with TypeScript interfaces
interface IAnswerOption {
    id: number;
    text: string;
    isCorrect: boolean;
}

interface IQuestion {
    id: number;
    questionText: string;
    points: number;
    answerOptions: IAnswerOption[];
}

const QuizCreationPage: React.FC = () => {
    // State for the quiz title
    const [quizTitle, setQuizTitle] = useState<string>('');
    
    // State to manage the list of questions
    const [questions, setQuestions] = useState<IQuestion[]>([
        // Start with one blank question to get the user started
        { 
            id: 1,
            questionText: '', 
            points: 10, 
            answerOptions: [
                { id: 1, text: '', isCorrect: false },
                { id: 2, text: '', isCorrect: false },
            ] 
        }
    ]);

    // Function to add a new, blank question to the state
    const handleAddQuestion = () => {
        const newQuestion: IQuestion = {
            id: questions.length + 1,
            questionText: '',
            points: 10,
            answerOptions: [
                { id: 1, text: '', isCorrect: false },
                { id: 2, text: '', isCorrect: false },
            ],
        };
        setQuestions([...questions, newQuestion]);
    };

    // Function to add a new answer option to a specific question
    const handleAddAnswerOption = (questionId: number) => {
        const newQuestions = questions.map(q => {
            if (q.id === questionId) {
                // Check to see if we've already reached the maximum of 4 answer options
                if (q.answerOptions.length >= 4) {
                    return q; // Return the question without making any changes
                }
                const newOption = {
                    id: q.answerOptions.length + 1,
                    text: '',
                    isCorrect: false
                };
                return { ...q, answerOptions: [...q.answerOptions, newOption] };
            }
            return q;
        });
        setQuestions(newQuestions);
    };

    return (
        // Main container with centered layout and light background
        <div className="container my-5">
            <div className="card shadow-lg border-0 rounded-4">
                <div className="card-body p-5">
                    <h1 className="card-title fw-bold fs-1 text-center mb-3">
                        Create a New Quiz
                    </h1>
                    <p className="card-text text-center text-muted mb-5">
                        Build your own quiz by adding questions and their correct answers.
                    </p>

                    <form>
                        {/* Quiz Title Input */}
                        <div className="mb-4">
                            <label htmlFor="quizTitle" className="form-label fw-bold">Quiz Title</label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg" 
                                id="quizTitle" 
                                placeholder="Write the name of your quiz here" 
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                            />
                        </div>

                        <hr className="my-5" />

                        {/* Dynamic Questions Section */}
                        <div className="mb-4">
                            <h2 className="fs-3 mb-4">Questions</h2>
                            {questions.map((question, index) => (
                                <div key={question.id} className="card mb-4 border-0 shadow-sm rounded-3">
                                    <div className="card-body">
                                        {/* Question Input */}
                                        <div className="mb-3">
                                            <label htmlFor={`question-${question.id}`} className="form-label fw-bold">Question {index + 1}</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id={`question-${question.id}`} 
                                                placeholder="Enter your question here" 
                                                // You would add an onChange handler here to update state
                                            />
                                        </div>
                                        {/* Points Input */}
                                        <div className="mb-3">
                                            <label htmlFor={`points-${question.id}`} className="form-label">Points</label>                                    
                                            <input 
                                                type="number" 
                                                className="form-control w-25" 
                                                id={`points-${question.id}`} 
                                                defaultValue={10} 
                                                min={1} 
                                                // You would add an onChange handler here to update state
                                            />                                            
                                        </div>
                                        <h6 className="mt-4 mb-2">Answer Options</h6>
                                        {/* Dynamic Answer Options */}
                                        {question.answerOptions.map(option => (
                                            <div key={option.id} className="input-group mb-2">
                                                <div className="input-group-text">
                                                    <input
                                                        className="form-check-input mt-0" 
                                                        type="radio" 
                                                        name={`correct-answer-${question.id}`} 
                                                        value={option.id}
                                                        // You would add an onChange handler here to update the correct answer
                                                    />
                                                     <label htmlFor={`correct-answer-${question.id}-${option.id}`} className="ms-2">Correct</label>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    placeholder={`Answer option ${option.id}`} 
                                                    // You would add an onChange handler here to update state
                                                />
                                            </div>
                                        ))}

                                        {/* Button to add another answer option */}
                                        {question.answerOptions.length < 4 && (
                                            <div className="d-grid mt-3">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => handleAddAnswerOption(question.id)}
                                                >
                                                    + Add Answer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Button to add another question */}
                        <div className="d-grid gap-2 mb-4">
                            <button 
                                type="button" 
                                className="btn btn-outline-primary btn-lg"
                                onClick={handleAddQuestion}
                            >
                                Add Question
                            </button>
                        </div>
                        
                        {/* Save Quiz Button */}
                        <div className="d-grid gap-2 mt-5">
                            <button type="submit" className="btn btn-primary btn-lg">
                                Save Quiz
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuizCreationPage;
