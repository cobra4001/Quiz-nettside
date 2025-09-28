import type { IQuiz } from '../../types/quiz';

export const QuizTestData: IQuiz = {
    title: "General Knowledge Quiz", // Tittel på quizen
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
    ],
    anwserOptions: []
};
