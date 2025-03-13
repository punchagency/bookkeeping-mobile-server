import { VerificationMethod } from "../domain/entities/user";

/**
 * Validates if the input is an email or phone number and returns the type
 * @param input - The string to validate
 * @returns Object containing isValid and the type of input (EMAIL or PHONE_NUMBER)
 */
export const validateContactInput = (
  input: string
): {
  isValid: boolean;
  type: VerificationMethod | null;
} => {
  // Email regex pattern
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Phone number regex pattern - International format with country code
  // Format: +CountryCode followed by the number
  // Country codes are 1-3 digits, followed by 6-12 digits for the phone number
  const phonePattern = /^\+[1-9]\d{0,2}[1-9]\d{5,11}$/;

  if (emailPattern.test(input)) {
    return {
      isValid: true,
      type: VerificationMethod.EMAIL,
    };
  }

  // Remove any spaces, dashes, and parentheses for phone validation
  const cleanPhone = input.replace(/[\s\-\(\)]/g, "");

  if (phonePattern.test(cleanPhone)) {
    return {
      isValid: true,
      type: VerificationMethod.PHONE,
    };
  }

  return {
    isValid: false,
    type: null,
  };
};
