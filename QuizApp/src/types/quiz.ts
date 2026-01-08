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
export interface QuizTakerProps {
    // used for QuizTakingPage
}

export interface QuizListProps {
  quizzes: any[];
  loading: boolean;
  error: string | null;
  successMsg: string | null;
  onQuizDeleted: (quizId: number) => void;
  title: string;
  emptyMessage: string;
  showUpdateButton?: boolean;
  showDeleteButton?: boolean;
  showAdminDelete?: boolean;
  currentUserRole?: string;
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
