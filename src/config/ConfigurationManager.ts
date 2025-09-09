// Import config types for services as they are added
import {
  ExampleServiceConfig,
  RateLimitConfig,
  CongressGovConfig,
} from "../types/index.js";

// Define the structure for all configurations managed
interface ManagedConfigs {
  exampleService: Required<ExampleServiceConfig>;
  rateLimit: Required<RateLimitConfig>;
  congressGov: Required<CongressGovConfig>;
  // Add other service config types here:
  // yourService: Required<YourServiceConfig>;
}

/**
 * Centralized configuration management for all services.
 * Implements singleton pattern to ensure consistent configuration.
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager | null = null;
  private static instanceLock = false;

  private config: ManagedConfigs;

  private constructor() {
    // Initialize with default configurations
    this.config = {
      exampleService: {
        // Define defaults for ExampleService
        greeting: "Hello",
        enableDetailedLogs: false,
      },
      rateLimit: {
        // Defaults based on Feature Spec
        maxRequests: 5000,
        perHours: 1,
        enableBackoff: true, // Default to true
      },
      congressGov: {
        // Defaults based on Feature Spec, corrected Base URL
        apiKey: "", // Loaded from env var
        baseUrl: "https://api.congress.gov/v3", // Corrected Base URL
        timeout: 30000, // 30 seconds
      },
      // Initialize other service configs with defaults:
      // yourService: {
      //   someSetting: 'default value',
      //   retryCount: 3,
      // },
    };

    // Optional: Load overrides from environment variables or config files here
    this.loadEnvironmentOverrides();
  }

  /**
   * Get the singleton instance of ConfigurationManager.
   * Basic lock to prevent race conditions during initial creation.
   */
  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      if (!ConfigurationManager.instanceLock) {
        ConfigurationManager.instanceLock = true; // Lock
        try {
          ConfigurationManager.instance = new ConfigurationManager();
        } finally {
          ConfigurationManager.instanceLock = false; // Unlock
        }
      } else {
        // Basic busy wait if locked (consider a more robust async lock if high contention is expected)
        while (ConfigurationManager.instanceLock) {
          // Small delay to avoid busy waiting
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
        // Re-check instance after wait
        if (!ConfigurationManager.instance) {
          // This path is less likely but handles edge cases if lock logic needs refinement
          return ConfigurationManager.getInstance();
        }
      }
    }
    return ConfigurationManager.instance;
  }

  // --- Getters for specific configurations ---

  public getExampleServiceConfig(): Required<ExampleServiceConfig> {
    // Return a copy to prevent accidental modification of the internal state
    return { ...this.config.exampleService };
  }

  public getRateLimitConfig(): Required<RateLimitConfig> {
    return { ...this.config.rateLimit };
  }

  public getCongressGovConfig(): Required<CongressGovConfig> {
    // Ensure API key is loaded before returning
    if (!this.config.congressGov.apiKey) {
      this.loadCongressGovApiKey(); // Load specifically if missed
    }
    return { ...this.config.congressGov };
  }

  // Add getters for other service configs:
  // public getYourServiceConfig(): Required<YourServiceConfig> {
  //   return { ...this.config.yourService };
  // }

  // --- Updaters for specific configurations (if runtime updates are needed) ---

  public updateExampleServiceConfig(
    update: Partial<ExampleServiceConfig>
  ): void {
    this.config.exampleService = {
      ...this.config.exampleService,
      ...update,
    };
    // Optional: Notify relevant services about the config change
  }

  // Add updaters for other service configs:
  // public updateYourServiceConfig(update: Partial<YourServiceConfig>): void {
  //   this.config.yourService = {
  //     ...this.config.yourService,
  //     ...update,
  //   };
  // }

  /**
   * Example method to load configuration overrides from environment variables.
   * Call this in the constructor.
   */
  private loadEnvironmentOverrides(): void {
    // Example for ExampleService
    if (process.env.EXAMPLE_GREETING) {
      this.config.exampleService.greeting = process.env.EXAMPLE_GREETING;
    }
    if (process.env.EXAMPLE_ENABLE_LOGS) {
      this.config.exampleService.enableDetailedLogs =
        process.env.EXAMPLE_ENABLE_LOGS.toLowerCase() === "true";
    }

    // --- Rate Limit Overrides ---
    if (process.env.RATE_LIMIT_MAX_REQUESTS) {
      const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10);
      if (!isNaN(maxRequests) && maxRequests > 0) {
        this.config.rateLimit.maxRequests = maxRequests;
      }
    }
    if (process.env.RATE_LIMIT_PER_HOURS) {
      const perHours = parseInt(process.env.RATE_LIMIT_PER_HOURS, 10);
      if (!isNaN(perHours) && perHours > 0) {
        this.config.rateLimit.perHours = perHours;
      }
    }
    if (process.env.ENABLE_BACKOFF) {
      this.config.rateLimit.enableBackoff =
        process.env.ENABLE_BACKOFF.toLowerCase() === "true";
    }

    // --- Congress.gov API Overrides ---
    this.loadCongressGovApiKey(); // Load API key separately for clarity

    // Allow overriding the corrected base URL via env var if needed
    if (process.env.CONGRESS_GOV_API_URL) {
      this.config.congressGov.baseUrl = process.env.CONGRESS_GOV_API_URL;
    }
    if (process.env.CONGRESS_GOV_API_TIMEOUT) {
      const timeout = parseInt(process.env.CONGRESS_GOV_API_TIMEOUT, 10);
      if (!isNaN(timeout) && timeout > 0) {
        this.config.congressGov.timeout = timeout;
      }
    }

    // Add logic for other services based on their environment variables
    // if (process.env.YOUR_SERVICE_RETRY_COUNT) {
    //   const retryCount = parseInt(process.env.YOUR_SERVICE_RETRY_COUNT, 10);
    //   if (!isNaN(retryCount)) {
    //     this.config.yourService.retryCount = retryCount;
    //   }
    // }
  }

  /** Loads just the Congress.gov API key from environment variables. */
  private loadCongressGovApiKey(): void {
    if (process.env.CONGRESS_GOV_API_KEY) {
      this.config.congressGov.apiKey = process.env.CONGRESS_GOV_API_KEY;
    }
    // Log warning if still missing after trying to load? Handled by service constructor.
  }
}
