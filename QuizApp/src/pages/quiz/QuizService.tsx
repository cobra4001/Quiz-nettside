const API_URL = import.meta.env.VITE_API_URL;

const headers = {
    'Content-Type': 'application/json',
};

const handleResponse = async (response: Response) => {
    if (response.ok) {
        if (response.status === 204) {
            return null; // No content to return
    }     return response.json();
    } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
    }
};

export const fetchQuizzes = async () => {
    const response = await fetch(`${API_URL}/api/quizapi/quizlist`);
    return handleResponse(response);
};

export const createQuiz = async (quiz: any) => {
    const response = await fetch(`${API_URL}/api/quizapi/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(quiz),
    });
    return handleResponse(response);
};

//eventuelt delete