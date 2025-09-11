import { z } from "zod";

export const TOOL_NAME = "congress_search";

export const TOOL_DESCRIPTION = `Searches or lists items within a specified Congress.gov collection (e.g., 'bill', 'member'). **!!! CRITICAL WORKFLOW STEP !!!** This tool is **REQUIRED** as the **FIRST STEP** to locate specific entities and retrieve their unique identifiers (like memberId, bill number/type/congress). These identifiers are **ESSENTIAL** inputs for other tools like 'congress_getSubResource'. **FAILURE TO USE THIS FIRST WILL LIKELY CAUSE SUBSEQUENT OPERATIONS TO FAIL.** Returns a list; be prepared to handle multiple results and extract the specific ID needed. 

**!!! CRITICAL API LIMITATION !!!** Filtering by 'congress' using the 'filters' parameter is **COMPLETELY UNSUPPORTED** by the underlying Congress.gov API for general collection searches (e.g., /v3/bill, /v3/member) and will be **REJECTED** with an error. This is a fundamental limitation of the API architecture:
- ❌ Does NOT work: /v3/bill?congress=117 
- ✅ Works instead: /v3/bill/117 (specific congress endpoint)

Congress-specific filtering requires using dedicated API paths (e.g., /v3/bill/117) which this search tool cannot construct. To find items from a specific congress, use this tool without congress filters and then manually filter the results by the 'congress' field in the response data.`;

// Define allowed collections based on API documentation
const SearchableCollectionEnum = z
  .enum([
    "bill",
    "amendment",
    "committee-report",
    "committee",
    "committee-print",
    "congressional-record",
    "daily-congressional-record",
    "bound-congressional-record",
    "house-communication",
    "senate-communication",
    "nomination",
    "treaty",
    "member", // Added member based on API docs
  ])
  .describe(
    "REQUIRED: The specific collection within Congress.gov to search (e.g., 'bill', 'member', 'committee'). Determines the API endpoint used (e.g., /v3/bill, /v3/member)."
  );

// Define allowed sort orders
const SortOrderEnum = z
  .enum(["updateDate+asc", "updateDate+desc"])
  .describe(
    "OPTIONAL: Specifies the sort order based on the update date. 'updateDate+asc' for ascending (oldest first), 'updateDate+desc' for descending (newest first). If omitted, API default sorting applies (usually descending)."
  );

// Define optional filters (can be expanded based on API capabilities per collection)
// *** CRITICAL API LIMITATION ***
// Filtering by 'congress' using this filter object is COMPLETELY UNSUPPORTED by the underlying Congress.gov API
// for base collection searches (e.g., /v3/bill, /v3/member). The API architecture requires congress-specific
// paths (e.g., /v3/bill/117) rather than query parameters for congress filtering.
// Any attempt to add 'congress' as a filter will be REJECTED by the strict Zod schema below.
// This limitation is intentional and reflects the underlying API design.
const SearchFiltersSchema = z
  .object({
    type: z
      .string()
      .optional()
      .describe(
        "OPTIONAL: Filter by a specific type within the collection (e.g., for 'bill' collection, use 'hr', 's', 'hres'; for 'committee-report', use 'hrpt', 'srpt'). Check API docs for valid types per collection."
      ),
    fromDateTime: z
      .string()
      .datetime({
        message:
          "Must be a valid ISO 8601 datetime string, e.g., YYYY-MM-DDTHH:MM:SSZ",
      })
      .optional()
      .describe(
        "OPTIONAL: Filter results updated *after* this timestamp (inclusive). Format: YYYY-MM-DDTHH:MM:SSZ (e.g., '2023-01-01T00:00:00Z'). Check API docs for which collections support this filter."
      ),
    toDateTime: z
      .string()
      .datetime({
        message:
          "Must be a valid ISO 8601 datetime string, e.g., YYYY-MM-DDTHH:MM:SSZ",
      })
      .optional()
      .describe(
        "OPTIONAL: Filter results updated *before* this timestamp (inclusive). Format: YYYY-MM-DDTHH:MM:SSZ (e.g., '2023-12-31T23:59:59Z'). Check API docs for which collections support this filter."
      ),
  })
  .strict() // This strict() call ensures 'congress' filters are rejected with clear error messages
  .describe(
    "OPTIONAL: An object containing specific filters to apply to the search. Availability of filters depends on the selected 'collection'. **IMPORTANT:** 'congress' filtering is NOT supported here - see tool description for details. Check Congress.gov API documentation for supported filters per collection."
  );

// Define the main search parameters schema
export const TOOL_PARAMS = {
  collection: SearchableCollectionEnum,
  query: z
    .string()
    .min(1)
    .optional()
    .describe(
      "OPTIONAL: The search keyword(s) or query string. If omitted, typically returns a list of all items in the collection, subject to filters and pagination."
    ),
  filters: SearchFiltersSchema.optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(250)
    .optional()
    .describe(
      "OPTIONAL: The maximum number of results to return per page. Default is usually 20, maximum is 250. Example: 50"
    ),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      "OPTIONAL: The starting record number for pagination. 0 is the first record. Use with 'limit' to page through results. Example: 100 (to get the third page if limit is 50)"
    ),
  sort: SortOrderEnum.optional(),
};

// Define the input type for the tool's handler function for type safety
export type CongressSearchParams = z.infer<z.ZodObject<typeof TOOL_PARAMS>>;
