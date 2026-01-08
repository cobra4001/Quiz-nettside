// Regex for email validation
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regex for Norwegian numbers
export const norwegianPhoneRegex = /^[49]\d{7}$/;

// Function to validate email format
export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

// Function to validate phone number format
export function isValidPhone(phone: string): boolean {
  return norwegianPhoneRegex.test(phone);
}