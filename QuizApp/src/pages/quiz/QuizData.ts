import type { IQuiz } from '../../types/quiz';

export const AllQuizzes: IQuiz[] = [
    {
        id: 1,
        title: "General Knowledge Quiz",
        description: "Test your fundamental knowledge of the world.",
        questions: [
            { 
                id: 1, 
                questionText: "What is the capital of France?", 
                points: 10, 
                answerOptions: [
                    { id: 1, text: "Berlin", isCorrect: false },
                    { id: 2, text: "Madrid", isCorrect: false },
                    { id: 3, text: "Paris", isCorrect: true },
                    { id: 4, text: "Rome", isCorrect: false },
                ],
            },
            { 
                id: 2, 
                questionText: "Which planet is known as the Red Planet?", 
                points: 15, 
                answerOptions: [
                    { id: 1, text: "Earth", isCorrect: false },
                    { id: 2, text: "Mars", isCorrect: true },
                    { id: 3, text: "Jupiter", isCorrect: false },
                    { id: 4, text: "Saturn", isCorrect: false },
                ],
            },
            { 
                id: 3, 
                questionText: "In which year did the Titanic sink?", 
                points: 5, 
                answerOptions: [
                    { id: 1, text: "1910", isCorrect: false },
                    { id: 2, text: "1912", isCorrect: true },
                    { id: 3, text: "1914", isCorrect: false },
                    { id: 4, text: "1916", isCorrect: false },
                ],
            },
        ],
    },
    {
        id: 2,
        title: "Programming Fundamentals",
        description: "A quick test on basic concepts in software development.",
        questions: [
            { 
                id: 1, 
                questionText: "What does 'OOP' stand for?", 
                points: 10, 
                answerOptions: [
                    { id: 1, text: "Object-Oriented Programming", isCorrect: true },
                    { id: 2, text: "Optimal Output Protocol", isCorrect: false },
                    { id: 3, text: "Online Order Placement", isCorrect: false },
                ],
            },
            { 
                id: 2, 
                questionText: "Which language runs in a web browser?", 
                points: 10, 
                answerOptions: [
                    { id: 1, text: "Python", isCorrect: false },
                    { id: 2, text: "Java", isCorrect: false },
                    { id: 3, text: "JavaScript", isCorrect: true },
                ],
            },
            { 
                id: 3, 
                questionText: "What is the main purpose of a database?", 
                points: 15, 
                answerOptions: [
                    { id: 1, text: "Store and retrieve data efficiently", isCorrect: true },
                    { id: 2, text: "Create user interfaces", isCorrect: false },
                    { id: 3, text: "Compile source code", isCorrect: false },
                ],
            },
            { 
                id: 4, 
                questionText: "What is a React Hook?", 
                points: 15, 
                answerOptions: [
                    { id: 1, text: "A lifecycle method", isCorrect: false },
                    { id: 2, text: "A function that lets you use state and other React features in functional components", isCorrect: true },
                    { id: 3, text: "A component decorator", isCorrect: false },
                ],
            },
        ],
    },
    {
        id: 3,
        title: "World Geography Challenge",
        description: "Do you know your continents and oceans?",
        questions: [
            { 
                id: 1, 
                questionText: "Largest country by area?", 
                points: 10, 
                answerOptions: [
                    { id: 1, text: "Canada", isCorrect: false },
                    { id: 2, text: "China", isCorrect: false },
                    { id: 3, text: "Russia", isCorrect: true },
                    { id: 4, text: "USA", isCorrect: false },
                ],
            },
            { 
                id: 2, 
                questionText: "Highest mountain peak?", 
                points: 10, 
                answerOptions: [
                    { id: 1, text: "Mount Everest", isCorrect: true },
                    { id: 2, text: "K2", isCorrect: false },
                    { id: 3, text: "Mount Fuji", isCorrect: false },
                ],
            },
        ],
    },
];

// Re-eksporterer den første quizen for kompatibilitet med andre komponenter
export const QuizTestData = AllQuizzes[0];

export const getQuizById = (id: number): IQuiz | undefined => {
    return AllQuizzes.find(quiz => quiz.id === id);
};