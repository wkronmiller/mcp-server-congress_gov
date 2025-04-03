import { z } from 'zod';

export const TOOL_NAME = "congress_getSubResource";

export const TOOL_DESCRIPTION = `Fetches related data lists (sub-resources like 'actions', 'cosponsors', 'text') for a specific parent Congress.gov entity. **!!! ABSOLUTE PREREQUISITE !!!** You **MUST** provide the exact, complete MCP URI of the parent entity in 'parentUri' (e.g., 'congress-gov://member/K000393'). This URI **MUST** be obtained from a prior 'congress_search' or known identifier; guessing will **FAIL**. You **MUST** also provide a 'subResource' name that is **STRICTLY VALID** for the parent entity's type (check the list below!). **!!! PROVIDING AN INVALID 'parentUri' OR 'subResource' COMBINATION WILL GUARANTEE AN ERROR !!!**`;

// Define allowed sub-resource types based on API documentation, grouped by parent type
const SubResourceTypeEnum = z.enum([
    // === Bill Sub-Resources ===
    'actions',                 // Bill actions
    'amendments',              // Amendments TO the Bill
    'committees',              // Committees associated with the Bill
    'cosponsors',              // Cosponsors of the Bill
    'relatedbills',            // Bills related to the Bill
    'subjects',                // Subjects of the Bill
    'summaries',               // Summaries of the Bill
    'text',                    // Text versions of the Bill
    'titles',                  // Titles of the Bill

    // === Member Sub-Resources ===
    'sponsored-legislation',   // Legislation sponsored BY the Member
    'cosponsored-legislation', // Legislation cosponsored BY the Member

    // === Committee Sub-Resources ===
    'reports',                 // Committee Reports FROM the Committee
    'nominations',             // Nominations referred TO the Committee
    'house-communication',     // House Communications referred TO the Committee
    'senate-communication',    // Senate Communications referred TO the Committee
    'bills',                   // Bills referred TO the Committee

    // === Amendment Sub-Resources ===
    // 'actions', // Covered above
    // 'cosponsors', // Covered above
    // 'amendments', // Use 'amendments' for amendments TO this amendment
    // 'text', // Covered above

    // === Nomination Sub-Resources ===
    // 'actions', // Covered above
    // 'committees', // Covered above
    'hearings',                // Hearings related TO the Nomination

    // === Treaty Sub-Resources ===
    // 'actions', // Covered above
    // 'committees' // Covered above

]).describe(`REQUIRED: The type of related information (sub-resource) to retrieve for the parent entity specified in 'parentUri'.

**Valid Parent URI Types & Their Sub-Resources:**
*   **Bill ('congress-gov://bill/...'):** actions, amendments, committees, cosponsors, relatedbills, subjects, summaries, text, titles
*   **Member ('congress-gov://member/...'):** sponsored-legislation, cosponsored-legislation
*   **Committee ('congress-gov://committee/...'):** reports, nominations, house-communication, senate-communication, bills
*   **Amendment ('congress-gov://amendment/...'):** actions, amendments (to this amendment), cosponsors, text
*   **Nomination ('congress-gov://nomination/...'):** actions, committees, hearings
*   **Treaty ('congress-gov://treaty/...'):** actions, committees

**IMPORTANT:** You MUST provide a 'subResource' value that is valid for the type of entity specified in 'parentUri'.`);

// Define the main sub-resource parameters schema
export const TOOL_PARAMS = {
    parentUri: z.string().url()
        .startsWith('congress-gov://', { message: "Parent URI must start with 'congress-gov://'" })
        .describe("REQUIRED: The full MCP resource URI of the parent entity. Example: 'congress-gov://bill/117/hr/3076' or 'congress-gov://member/P000197'."),
    subResource: SubResourceTypeEnum,
    limit: z.number().int().min(1).max(250).optional()
        .describe("OPTIONAL: Max results per page for list sub-resources. Default 20, Max 250."),
    offset: z.number().int().min(0).optional()
        .describe("OPTIONAL: Starting record number for pagination (0-based).")
};

// Define the input type for the tool's handler function for type safety
export type CongressGetSubResourceParams = z.infer<z.ZodObject<typeof TOOL_PARAMS>>;
