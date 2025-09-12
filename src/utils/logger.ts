/**
 * Simple structured logger utility that writes JSON to stderr.
 */

// Define log levels (optional, could use strings directly)
enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

// Define log level hierarchy for filtering
const LOG_LEVEL_HIERARCHY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

// Get the configured log level from environment variable
function getConfiguredLogLevel(): LogLevel {
  const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
  if (
    envLogLevel &&
    Object.values(LogLevel).includes(envLogLevel as LogLevel)
  ) {
    return envLogLevel as LogLevel;
  }
  return LogLevel.INFO; // Default to INFO level
}

const CONFIGURED_LOG_LEVEL = getConfiguredLogLevel();

// Check if a log level should be output based on configuration
function shouldLog(level: LogLevel): boolean {
  return (
    LOG_LEVEL_HIERARCHY[level] >= LOG_LEVEL_HIERARCHY[CONFIGURED_LOG_LEVEL]
  );
}

// Interface for the structured log entry
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>; // For additional structured data
  error?: {
    message: string;
    stack?: string;
    details?: any; // Include details from custom errors if available
  };
}

/**
 * Writes a structured log entry as JSON to stderr.
 * @param level - The log level.
 * @param message - The main log message.
 * @param context - Optional structured context object.
 * @param error - Optional error object for ERROR level logs.
 */
function writeLog(
  level: LogLevel,
  message: string,
  context?: Record<string, any>,
  error?: unknown
) {
  const logEntry: Partial<LogEntry> = {
    // Use Partial initially
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context && Object.keys(context).length > 0) {
    logEntry.context = context;
  }

  if (level === LogLevel.ERROR && error) {
    if (error instanceof Error) {
      logEntry.error = {
        message: error.message,
        stack: error.stack,
        // Attempt to include details from our custom BaseError
        details: (error as any).details,
      };
    } else {
      logEntry.error = {
        message: "Non-error object thrown",
        details: error,
      };
    }
  }

  // Use console.error to write to stderr
  console.error(JSON.stringify(logEntry));
}

// Logger object with methods for different levels
export const logger = {
  debug: (message: string, context?: Record<string, any>): void => {
    if (shouldLog(LogLevel.DEBUG)) {
      writeLog(LogLevel.DEBUG, message, context);
    }
  },
  info: (message: string, context?: Record<string, any>): void => {
    if (shouldLog(LogLevel.INFO)) {
      writeLog(LogLevel.INFO, message, context);
    }
  },
  warn: (message: string, context?: Record<string, any>): void => {
    if (shouldLog(LogLevel.WARN)) {
      writeLog(LogLevel.WARN, message, context);
    }
  },
  error: (
    message: string,
    error?: unknown,
    context?: Record<string, any>
  ): void => {
    if (shouldLog(LogLevel.ERROR)) {
      // Pass error object to writeLog for structured error logging
      writeLog(LogLevel.ERROR, message, context, error);
    }
  },
};

// Example Usage (will be replaced in other files):
// logger.info('Server started', { port: 8080 });
// logger.error('API request failed', new Error('Timeout'), { endpoint: '/bill' });
