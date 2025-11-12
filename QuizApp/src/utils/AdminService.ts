const API_URL = import.meta.env.VITE_API_URL;
const API_URL_BASE = import.meta.env.VITE_API_URL_BASE_PATH || "/api";

interface UserDto {
  id: string;
  userName: string;
  email: string | null;
  phoneNumber: string | null;
  role: string | null;
}

async function handleResponse(response: Response): Promise<any> {
    const text = await response.text();
    let parsed: any = null;
    if (text) {
        try {
            parsed = JSON.parse(text);
        } catch {
            parsed = text; // keep raw text if not JSON
        }
    }

    if (!response.ok) {
        // Attempt to extract any error text
        if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed)) throw new Error(parsed.join(', '));
            if (parsed.Errors && Array.isArray(parsed.Errors)) throw new Error(parsed.Errors.join(', '));
            if (parsed.message) throw new Error(parsed.message);
        }
        throw new Error(typeof parsed === 'string' && parsed ? parsed : `Request failed (${response.status})`);
    }

    return parsed ?? null;
}

export const fetchUsers = async (token: string | null): Promise<UserDto[]> => {
    if (!token) {
        throw new Error("Authentication token is missing.");
    }

    const res = await fetch(`${API_URL}${API_URL_BASE}/Auth/users`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const statusError =
            res.status === 403
                ? "Access Denied. You may not have the necessary permissions."
                : "Failed to fetch users.";
        throw new Error(statusError);
    }

    const data: UserDto[] = await res.json();

    // Remove duplicates
    const uniqueUsers = data.filter(
        (user, index, self) => index === self.findIndex((u) => u.id === user.id)
    );

    return uniqueUsers;
};

export const deleteUser = async (userID: string | undefined, token: string | null) => {
    const res = await fetch(`${API_URL}${API_URL_BASE}/Auth/user/${userID}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res)
      return handleResponse(res);
}

export const createMockUser = async (token: string | null) => {
    if (!token) {
        throw new Error("Authentication token is missing.");
    }

    const randomId = Math.floor(Math.random() * 10000);
    const mockUser = {
        userName: `mockuser${randomId}`,
        email: `mockuser${randomId}@example.com`,
        phoneNumber: `41234567`,
        password: "MockPassword123!",
        confirmPassword: "MockPassword123!",
        role: "User"
    };

    const res = await fetch(`${API_URL}${API_URL_BASE}/Auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mockUser),
    });

    return handleResponse(res);
};