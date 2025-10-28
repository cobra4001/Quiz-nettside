export interface IQuiz {
    id: number;
    title: string;
    questions: IQuestion[];
    description: string;
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

export interface QuizListProps {
    // Function for navigating on click (used by react-router-dom's useNavigate)
    onQuizSelect?: (quizId: number) => void;
}

// Interface for the QuizTaker component
export interface QuizTakerProps {
    // No props are needed anymore, as quizId is fetched via useParams
}
