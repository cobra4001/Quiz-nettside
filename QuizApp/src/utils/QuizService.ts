const API_URL = import.meta.env.VITE_API_URL;
const API_URL_BASE = import.meta.env.VITE_API_URL_BASE_PATH || "/api";

// Response handler
const handleResponse = async (response: Response) => {
    if (response.ok) {
        if (response.status === 204) return null;
       
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }
    // Trying to find errors that occurred earlier in the phase
    try {
        const errorData = await response.json();
        throw new Error(errorData.message || JSON.stringify(errorData));
    } catch {
        throw new Error(`Request failed (${response.status}) ${response.statusText}`);
    }
};

// Builds autorization headers dynamically to always get the latest token
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
    const response = await fetch(`${API_URL}${API_URL_BASE}/Quiz`, {
        headers: buildHeaders(),
    });
    return handleResponse(response);
};

// GET /api/Quiz/my
export const fetchMyQuizzes = async () => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Quiz/my`, {
        headers: buildHeaders(),
    });
    return handleResponse(response);
};

// GET /api/Quiz/{id}
export const fetchQuizById = async (id: number) => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Quiz/${id}`, {
        headers: buildHeaders(),
    });
    return handleResponse(response);
};

// POST /api/Quiz/create
export const createQuiz = async (quizDto: any) => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Quiz/create`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(quizDto),
    });
    return handleResponse(response);
};

//Submit quiz answers
export const submitQuiz = async (submission: { quizId: number; selectedAnswers: Record<number, number>; }) => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Quiz/submit`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
            quizId: submission.quizId,
            selectedAnswers: submission.selectedAnswers
        }),
    });
    return handleResponse(response);
};

// GET /api/Quiz/{id}/edit - Fetch quiz for editing with all details
export const fetchQuizForEdit = async (id: number) => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Quiz/${id}/edit`, {
        headers: buildHeaders(),
    });
    return handleResponse(response);
};

// PUT /api/Quiz/{id} - Update quiz by ID
export const updateQuiz = async (id: number, quizDto: any) => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Quiz/${id}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(quizDto),
    });
    return handleResponse(response);
};

// DELETE quiz by ID
export const deleteQuiz = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Quiz/${id}`, {
        method: 'DELETE',
        headers: buildHeaders(),
    });

    if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Failed to delete quiz: ${msg}`);
    }
};

// Get quiz results by quiz ID and user ID
export const fetchMyScores = async () => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Quiz/myscores`, {
        headers: buildHeaders(),
    });
    return handleResponse(response);
};


