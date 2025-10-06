const API_URL = import.meta.env.VITE_API_URL;

// Common response handler
const handleResponse = async (response: Response) => {
    if (response.ok) {
        if (response.status === 204) return null;
        // Some endpoints might not return JSON
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }
    // Try to parse JSON error; fall back to status text
    try {
        const errorData = await response.json();
        throw new Error(errorData.message || JSON.stringify(errorData));
    } catch {
        throw new Error(`Request failed (${response.status}) ${response.statusText}`);
    }
};

// Build auth headers dynamically so we always get the latest token
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
// quizDto must match backend QuizCreationDto structure
export const createQuiz = async (quizDto: any) => {
    const response = await fetch(`${API_URL}/api/Quiz/create`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(quizDto),
    });
    return handleResponse(response);
};

// Future: export deleteQuiz, updateQuiz, submitQuiz, etc.