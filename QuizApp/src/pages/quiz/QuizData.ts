import type { IQuiz } from '../../types/quiz';

export const AllQuizzes: IQuiz[] = [
    {
        id: 1,
        title: "General Knowledge Quiz",
        description: "Test din allmennkunnskap med dette settet av spørsmål.",
        questions: [
            {
                id: 101,
                questionText: "Hva er hovedstaden i Norge?",
                answerOptions: [
                    { id: 1, text: "Bergen" },
                    { id: 2, text: "Trondheim" },
                    { id: 3, text: "Oslo" },
                    { id: 4, text: "Stavanger" },
                    { id: 5, text: "Kristiansand" }, // Det femte alternativet du la til
                ],
                correctOptionId: 3,
                points: 10,
            },
            {
                id: 102,
                questionText: "Hvilken planet er kjent som 'Den røde planeten'?",
                answerOptions: [
                    { id: 1, text: "Jupiter" },
                    { id: 2, text: "Mars" },
                    { id: 3, text: "Venus" },
                    { id: 4, text: "Saturn" },
                ],
                correctOptionId: 2,
                points: 10,
            },
        ],
    },
    {
        id: 2,
        title: "Programming Fundamentals",
        description: "En quiz for å teste din grunnleggende forståelse av programmering.",
        questions: [
            {
                id: 201,
                questionText: "Hvilket språk brukes primært for webutvikling på klientsiden?",
                answerOptions: [
                    { id: 1, text: "Python" },
                    { id: 2, text: "Java" },
                    { id: 3, text: "JavaScript" },
                    { id: 4, text: "C#" },
                ],
                correctOptionId: 3,
                points: 15,
            },
            {
                id: 202,
                questionText: "Hva står akronymet 'API' for?",
                answerOptions: [
                    { id: 1, text: "Application Programming Instruction" },
                    { id: 2, text: "Advanced Protocol Interface" },
                    { id: 3, text: "Application Programming Interface" },
                    { id: 4, text: "Automated Program Integration" },
                ],
                correctOptionId: 3,
                points: 15,
            },
        ],
    },
];

/**
 * Hjelpefunksjon for å finne en quiz basert på ID.
 * @param id Quiz ID.
 * @returns IQuiz-objektet, eller undefined hvis ikke funnet.
 */
export const getQuizById = (id: number): IQuiz | undefined => {
    return AllQuizzes.find(quiz => quiz.id === id);
};
