import { z } from "zod";

export const TOOL_NAME = "congress_search";

export const TOOL_DESCRIPTION = `Searches or lists items within a specified Congress.gov collection (e.g., 'bill', 'member'). 

This tool helps you discover and explore congressional data when you need to find specific entities or browse collections. Use it to locate bills, members, committees, and other congressional documents when you don't have the exact identifiers.

**Example Workflow:**
1. Search for bills: collection='bill', filters={type: 'hr'} to find House Bills
2. Get bill details: Use returned URI like 'congress-gov://bill/117/hr/21' with resources or sub-resource tools
3. Get sub-resources: Use the URI with 'congress_getSubResource' tool for related data

**When to Use This Tool:**
- Finding bills by keyword or topic
- Discovering members of Congress
- Browsing committees or reports
- Exploring collections when exact identifiers are unknown

**Direct Access Alternative:** If you already know specific bill details (congress, type, number), you can directly access resources using URIs like 'congress-gov://bill/117/hr/21' without searching first.

Returns a list; be prepared to handle multiple results and extract the specific ID needed. 

**Note:** Filtering by 'congress' using the 'filters' parameter is not supported by the underlying API for general collection searches (e.g., /v3/bill) and will be ignored; congress-specific filtering requires using specific API paths not directly targeted by this tool.`;

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
    "REQUIRED: The specific collection within Congress.gov to search. Each collection contains different types of congressional data:\n" +
      "• 'bill' - Legislation including House Bills (H.R.), Senate Bills (S.), Joint Resolutions, Concurrent Resolutions, Simple Resolutions\n" +
      "• 'amendment' - Amendments to bills including House Amendments (HAMDT), Senate Amendments (SAMDT)\n" +
      "• 'member' - Current and former Members of Congress with biographical and legislative data\n" +
      "• 'committee' - Congressional committees from both chambers with reports and activities\n" +
      "• 'committee-report' - Official committee reports on legislation and oversight\n" +
      "• 'committee-print' - Committee publications and background materials\n" +
      "• 'congressional-record' - Official proceedings and debates of Congress\n" +
      "• 'nomination' - Presidential nominations requiring Senate confirmation\n" +
      "• 'treaty' - International treaties requiring Senate ratification\n" +
      "• 'house-communication' & 'senate-communication' - Official chamber communications\n" +
      "Determines the API endpoint used (e.g., /v3/bill, /v3/member, /v3/committee)."
  );

// Define allowed sort orders
const SortOrderEnum = z
  .enum(["updateDate+asc", "updateDate+desc"])
  .describe(
    "OPTIONAL: Specifies the sort order based on the update date. 'updateDate+asc' for ascending (oldest first), 'updateDate+desc' for descending (newest first). If omitted, API default sorting applies (usually descending)."
  );

// Define optional filters (can be expanded based on API capabilities per collection)
// NOTE: Filtering by 'congress' using this filter object is NOT supported by the underlying API for base collection searches (e.g., /v3/bill).
// The API ignores the 'congress' query parameter in these cases. Congress filtering typically happens via the URL path (e.g., /v3/bill/117), which this tool does not construct.
const SearchFiltersSchema = z
  .object({
    type: z
      .string()
      .optional()
      .describe(
        "OPTIONAL: Filter by a specific type within the collection. Type values determine the specific category of documents to return:\n\n" +
          "**For 'bill' collection:**\n" +
          "• 'hr' - House Bills (H.R. 1, H.R. 3076) - Regular legislation from House\n" +
          "• 's' - Senate Bills (S. 25, S. 1234) - Regular legislation from Senate\n" +
          "• 'hjres' - House Joint Resolutions (H.J.Res. 1) - Constitutional amendments, emergency declarations\n" +
          "• 'sjres' - Senate Joint Resolutions (S.J.Res. 5) - Constitutional amendments, emergency declarations\n" +
          "• 'hconres' - House Concurrent Resolutions (H.Con.Res. 10) - Budget resolutions, procedural matters\n" +
          "• 'sconres' - Senate Concurrent Resolutions (S.Con.Res. 3) - Budget resolutions, procedural matters\n" +
          "• 'hres' - House Simple Resolutions (H.Res. 100) - House rules, commemorative resolutions\n" +
          "• 'sres' - Senate Simple Resolutions (S.Res. 50) - Senate rules, commemorative resolutions\n\n" +
          "**For 'amendment' collection:**\n" +
          "• 'hamdt' - House Amendments - Amendments proposed in the House\n" +
          "• 'samdt' - Senate Amendments - Amendments proposed in the Senate\n" +
          "• 'suamdt' - Senate Unprinted Amendments - Senate amendments not yet printed\n\n" +
          "**For 'committee-report' collection:**\n" +
          "• 'hrpt' - House Reports - Official House committee reports\n" +
          "• 'srpt' - Senate Reports - Official Senate committee reports\n\n" +
          "**For 'committee-print' collection:**\n" +
          "• 'hprt' - House Prints - House committee publications\n" +
          "• 'sprt' - Senate Prints - Senate committee publications\n\n" +
          "Check API docs for additional type filters available for other collections."
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
  .strict()
  .describe(
    "OPTIONAL: An object containing specific filters to apply to the search. Availability of filters depends on the selected 'collection'. Check Congress.gov API documentation for supported filters per collection."
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
