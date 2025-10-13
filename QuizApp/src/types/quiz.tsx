export interface IQuiz {
    id: number;
    title: string;
    questions: IQuestion[];
    description: string;
}

export interface IAnswerOption {
    id: number;
    text: string;
    
}

export interface IQuestion {
    id: number;
    questionText: string;
    points: number;
    answerOptions: IAnswerOption[];
    correctOptionId: number; 
}

export interface QuizListProps {
    // Funksjon for å navigere ved klikk (brukes av react-router-dom sin useNavigate)
    onQuizSelect?: (quizId: number) => void;
}

// Grensesnitt for QuizTaker-komponenten
export interface QuizTakerProps {
    // Ingen props trengs lenger, da quizId hentes via useParams
}
