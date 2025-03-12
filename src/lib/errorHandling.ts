import { PostgrestError } from '@supabase/supabase-js';

/**
 * Error types that can occur in the application
 */
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  SERVER = 'server',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

/**
 * Standardized application error
 */
export class AppError extends Error {
  type: ErrorType;
  originalError?: unknown;
  
  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Classify Supabase PostgrestError by error type
 */
export function classifySupabaseError(error: PostgrestError): ErrorType {
  const { code, message } = error;
  
  // Authentication errors
  if (code === '42501' || message.includes('authentication')) {
    return ErrorType.AUTHENTICATION;
  }
  
  // Permission errors
  if (code === '42503' || message.includes('permission')) {
    return ErrorType.PERMISSION;
  }
  
  // Not found errors
  if (code === '22P02' || message.includes('not found')) {
    return ErrorType.NOT_FOUND;
  }
  
  // Validation errors
  if (
    code === '23502' || // not_null_violation
    code === '23503' || // foreign_key_violation
    code === '23505' || // unique_violation
    code === '23514'    // check_violation
  ) {
    return ErrorType.VALIDATION;
  }
  
  // Default to server error
  return ErrorType.SERVER;
}

/**
 * Convert any error to a standardized AppError
 */
export function handleError(error: unknown): AppError {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error;
  }
  
  // Handle PostgrestError from Supabase
  if (
    error && 
    typeof error === 'object' && 
    'code' in error && 
    'message' in error && 
    'details' in error
  ) {
    const pgError = error as PostgrestError;
    const errorType = classifySupabaseError(pgError);
    
    return new AppError(
      `Database error: ${pgError.message}`,
      errorType,
      pgError
    );
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return new AppError(
        `Network error: ${error.message}`,
        ErrorType.NETWORK,
        error
      );
    }
    
    return new AppError(error.message, ErrorType.UNKNOWN, error);
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return new AppError(error);
  }
  
  // Handle unknown errors
  return new AppError('An unknown error occurred');
}

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const appError = handleError(error);
  
  switch (appError.type) {
    case ErrorType.AUTHENTICATION:
      return 'Authentication error. Please log in again.';
    
    case ErrorType.PERMISSION:
      return 'You do not have permission to perform this action.';
    
    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    
    case ErrorType.VALIDATION:
      return 'Invalid input. Please check your data and try again.';
    
    case ErrorType.NETWORK:
      return 'Network connection issue. Please check your internet connection.';
    
    case ErrorType.SERVER:
      return 'Server error. Our team has been notified.';
    
    case ErrorType.UNKNOWN:
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
}

/**
 * Try to execute a function and handle any errors
 * @param fn The function to execute
 * @param errorHandler Optional custom error handler
 * @returns Result of the function execution or undefined if an error occurred
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    const appError = handleError(error);
    
    if (errorHandler) {
      errorHandler(appError);
    } else {
      console.error(appError);
    }
    
    return undefined;
  }
}
