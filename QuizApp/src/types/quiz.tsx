export interface IQuiz {
    answerOptions: IAnswerOption[] | (() => IAnswerOption[]);
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

//interface for QuizForm
export interface QuizFormProps {
  initialTitle?: string;
  initialDescription?: string;
  initialQuestions?: IQuestion[];
  isUpdate?: boolean;
  onSubmit: (quizData: {
    title: string;
    description: string;
    questions: IQuestion[];
  }) => Promise<void>;
  isSubmitting: boolean;
}
