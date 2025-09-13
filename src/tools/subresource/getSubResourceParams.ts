import { z } from "zod";

export const TOOL_NAME = "congress_getSubResource";

export const TOOL_DESCRIPTION = `Fetches related data lists (sub-resources like 'actions', 'cosponsors', 'text') for a specific parent Congress.gov entity. 

**URI Requirements:** You must provide the exact, complete MCP URI of the parent entity in 'parentUri'. This URI can be obtained from:
- Prior 'congress_search' results
- Known bill/member/committee identifiers (if you have them)
- Direct construction using the formats shown below 

**Example URIs with Field Explanations:**

**Bill URI Format:** 'congress-gov://bill/{congress}/{billType}/{billNumber}'
- **congress**: The congressional session number (e.g., '117' for 117th Congress 2021-2022, '118' for 118th Congress 2023-2024)
- **billType**: The type of legislation (see bill types below)  
- **billNumber**: The sequential number assigned to the bill within its type (e.g., '21' for the 21st bill of that type)
- Example: 'congress-gov://bill/117/hr/21' = H.R. 21 from the 117th Congress

**Member URI Format:** 'congress-gov://member/{bioguideId}'
- **bioguideId**: Unique identifier from the Biographical Directory of Congress (e.g., 'K000393', 'P000197')
- Example: 'congress-gov://member/K000393' = Member with Bioguide ID K000393

**Committee URI Format:** 'congress-gov://committee/{chamber}/{committeeCode}'
- **chamber**: Either 'house' or 'senate'
- **committeeCode**: Official committee code (e.g., 'hsii00' for House Natural Resources)
- Example: 'congress-gov://committee/house/hsii00' = House Committee on Natural Resources

**Bill Types Explained:**
- **hr**: House Bill - Regular legislation originating in the House (e.g., H.R. 1, H.R. 3076)
- **s**: Senate Bill - Regular legislation originating in the Senate (e.g., S. 25, S. 1234)
- **hjres**: House Joint Resolution - Special resolutions from House (e.g., H.J.Res. 1)
- **sjres**: Senate Joint Resolution - Special resolutions from Senate (e.g., S.J.Res. 5)
- **hconres**: House Concurrent Resolution - House procedural resolutions (e.g., H.Con.Res. 10)
- **sconres**: Senate Concurrent Resolution - Senate procedural resolutions (e.g., S.Con.Res. 3)  
- **hres**: House Simple Resolution - House-only resolutions (e.g., H.Res. 100)
- **sres**: Senate Simple Resolution - Senate-only resolutions (e.g., S.Res. 50)

You **MUST** also provide a 'subResource' name that is **STRICTLY VALID** for the parent entity's type (check the list below!). **!!! PROVIDING AN INVALID 'parentUri' OR 'subResource' COMBINATION WILL GUARANTEE AN ERROR !!!**`;

// Define allowed sub-resource types based on API documentation, grouped by parent type
const SubResourceTypeEnum = z.enum([
  // === Bill Sub-Resources ===
  "actions", // Bill actions
  "amendments", // Amendments TO the Bill
  "committees", // Committees associated with the Bill
  "cosponsors", // Cosponsors of the Bill
  "relatedbills", // Bills related to the Bill
  "subjects", // Subjects of the Bill
  "summaries", // Summaries of the Bill
  "text", // Text versions of the Bill
  "titles", // Titles of the Bill

  // === Member Sub-Resources ===
  "sponsored-legislation", // Legislation sponsored BY the Member
  "cosponsored-legislation", // Legislation cosponsored BY the Member

  // === Committee Sub-Resources ===
  "reports", // Committee Reports FROM the Committee
  "nominations", // Nominations referred TO the Committee
  "house-communication", // House Communications referred TO the Committee
  "senate-communication", // Senate Communications referred TO the Committee
  "bills", // Bills referred TO the Committee

  // === Amendment Sub-Resources ===
  // 'actions', // Covered above
  // 'cosponsors', // Covered above
  // 'amendments', // Use 'amendments' for amendments TO this amendment
  // 'text', // Covered above

  // === Nomination Sub-Resources ===
  // 'actions', // Covered above
  // 'committees', // Covered above
  "hearings", // Hearings related TO the Nomination

  // === Treaty Sub-Resources ===
  // 'actions', // Covered above
  // 'committees' // Covered above
])
  .describe(`REQUIRED: The type of related information (sub-resource) to retrieve for the parent entity specified in 'parentUri'.

**Valid Parent URI Types & Their Sub-Resources:**

**Bill** ('congress-gov://bill/{congress}/{type}/{number}')
Example: 'congress-gov://bill/117/hr/21' (H.R. 21 from 117th Congress)
- actions: Legislative actions taken on the bill
- amendments: Amendments proposed to the bill
- committees: Committees that have considered the bill
- cosponsors: Members who have cosponsored the bill
- relatedbills: Bills related to this one
- subjects: Policy area subjects of the bill
- summaries: CRS summaries of the bill
- text: Full text versions of the bill
- titles: Official and short titles of the bill

**Member** ('congress-gov://member/{bioguideId}')
Example: 'congress-gov://member/P000197' (Nancy Pelosi)
- sponsored-legislation: Bills sponsored by the member
- cosponsored-legislation: Bills cosponsored by the member

**Committee** ('congress-gov://committee/{chamber}/{code}')
Example: 'congress-gov://committee/house/hsii00' (House Natural Resources)
- reports: Committee reports issued
- nominations: Nominations referred to the committee
- house-communication: House communications referred
- senate-communication: Senate communications referred
- bills: Bills referred to the committee

**Amendment** ('congress-gov://amendment/{congress}/{type}/{number}')
Example: 'congress-gov://amendment/117/samdt/2137' (Senate Amendment 2137)
- actions: Actions taken on the amendment
- amendments: Amendments to this amendment
- cosponsors: Cosponsors of the amendment
- text: Text of the amendment

**Nomination** ('congress-gov://nomination/{congress}/{number}')
Example: 'congress-gov://nomination/117/2381'
- actions: Actions taken on the nomination
- committees: Committees considering the nomination
- hearings: Hearings held on the nomination

**Treaty** ('congress-gov://treaty/{congress}/{number}')
Example: 'congress-gov://treaty/117/3'
- actions: Actions taken on the treaty
- committees: Committees considering the treaty

**IMPORTANT:** You MUST provide a 'subResource' value that is valid for the type of entity specified in 'parentUri'.`);

// Define the main sub-resource parameters schema
export const TOOL_PARAMS = {
  parentUri: z
    .string()
    .url()
    .startsWith("congress-gov://", {
      message: "Parent URI must start with 'congress-gov://'",
    })
    .describe(
      "REQUIRED: The full MCP resource URI of the parent entity. Format: 'congress-gov://bill/{congress}/{billType}/{billNumber}' where congress=session number (117, 118, etc.), billType=legislation type (hr, s, hjres, etc.), billNumber=sequential number (1, 21, 3076, etc.). Examples: 'congress-gov://bill/117/hr/3076' (House Bill 3076 from 117th Congress), 'congress-gov://bill/118/s/25' (Senate Bill 25 from 118th Congress), 'congress-gov://member/P000197' (Member with Bioguide ID P000197)."
    ),
  subResource: SubResourceTypeEnum,
  limit: z
    .number()
    .int()
    .min(1)
    .max(250)
    .optional()
    .describe(
      "OPTIONAL: Max results per page for list sub-resources. Default 20, Max 250."
    ),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("OPTIONAL: Starting record number for pagination (0-based)."),
};

// Define the input type for the tool's handler function for type safety
export type CongressGetSubResourceParams = z.infer<
  z.ZodObject<typeof TOOL_PARAMS>
>;
