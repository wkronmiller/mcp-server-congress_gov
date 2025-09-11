import { Response } from "express";
import { 
  ApiError, 
  NotFoundError, 
  RateLimitError, 
  ValidationError,
  InvalidParameterError,
  ResourceNotFoundError,
  ResourceError 
} from "../../utils/errors.js";
import { logger } from "../../utils/index.js";

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Creates a success response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates an error response
 */
export function createErrorResponse(
  code: string, 
  message: string, 
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Handles errors and sends appropriate HTTP response
 */
export function handleApiError(res: Response, error: unknown, context?: string): void {
  logger.error("API error occurred", error, { context });

  if (error instanceof NotFoundError || error instanceof ResourceNotFoundError) {
    res.status(404).json(createErrorResponse(
      "NOT_FOUND",
      error.message
    ));
  } else if (error instanceof ValidationError || error instanceof InvalidParameterError) {
    res.status(400).json(createErrorResponse(
      "VALIDATION_ERROR", 
      error.message,
      (error as any).details
    ));
  } else if (error instanceof RateLimitError) {
    res.status(429).json(createErrorResponse(
      "RATE_LIMIT_EXCEEDED",
      error.message
    ));
  } else if (error instanceof ApiError) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(createErrorResponse(
      "API_ERROR",
      error.message,
      error.details
    ));
  } else if (error instanceof ResourceError) {
    res.status(400).json(createErrorResponse(
      "RESOURCE_ERROR",
      error.message,
      (error as any).details
    ));
  } else if (error instanceof Error) {
    res.status(500).json(createErrorResponse(
      "INTERNAL_ERROR",
      "An internal server error occurred",
      process.env.NODE_ENV === "development" ? error.stack : undefined
    ));
  } else {
    res.status(500).json(createErrorResponse(
      "UNKNOWN_ERROR", 
      "An unknown error occurred"
    ));
  }
}

/**
 * Sends a successful API response
 */
export function sendSuccessResponse<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json(createSuccessResponse(data));
}