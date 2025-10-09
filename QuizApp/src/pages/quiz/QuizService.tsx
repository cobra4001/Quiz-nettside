const API_URL = import.meta.env.VITE_API_URL;

// Vanlig responsbehandler
const handleResponse = async (response: Response) => {
    if (response.ok) {
        if (response.status === 204) return null;
       
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }
    // Prøver å finne feil som fant sted tidligere i fasen
    try {
        const errorData = await response.json();
        throw new Error(errorData.message || JSON.stringify(errorData));
    } catch {
        throw new Error(`Request failed (${response.status}) ${response.statusText}`);
    }
};

// Bygg autorisasjonshoder dynamisk slik at vi alltid får det nyeste tokenet
const buildHeaders = (extra: Record<string, string> = {}) => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
};

// GET /api/Quiz
export const fetchQuizzes = async () => {
    const response = await fetch(`${API_URL}/api/Quiz`, {
        headers: buildHeaders(),
    });
    return handleResponse(response);
};

// GET /api/Quiz/{id}
export const fetchQuizById = async (id: number) => {
    const response = await fetch(`${API_URL}/api/Quiz/${id}`, {
        headers: buildHeaders(),
    });
    return handleResponse(response);
};

// POST /api/Quiz/create

export const createQuiz = async (quizDto: any) => {
    const response = await fetch(`${API_URL}/api/Quiz/create`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(quizDto),
    });
    return handleResponse(response);
};

//Videre legg inn retserende CRUD, med update og remove
export const submitQuiz = async (submission: { quizId: number; selectedAnswers: Record<number, number>; }) => {
    const response = await fetch(`${API_URL}/api/Quiz/submit`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
            quizId: submission.quizId,
            selectedAnswers: submission.selectedAnswers
        }),
    });
    return handleResponse(response);
};


// PUT update quiz
export const updateQuiz = async (id: number, quizDto: any) => {
    const response = await fetch(`${API_URL}/api/Quiz/${id}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(quizDto),
    });
    return handleResponse(response);
};


// DELETE quiz by ID
export const deleteQuiz = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/api/Quiz/${id}`, {
        method: 'DELETE',
        headers: buildHeaders(),
    });

    if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Failed to delete quiz: ${msg}`);
    }
};
