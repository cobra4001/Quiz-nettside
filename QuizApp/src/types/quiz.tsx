export interface IQuiz {
    title: string;
    questions: IQuestion[];
    anwserOptions: IAnswerOption[];
}

export interface IAnswerOption {
    id: number;
    text: string;
    isCorrect: boolean;
}

export interface IQuestion {
    id: number;
    questionText: string;
    points: number;
    answerOptions: IAnswerOption[];
}