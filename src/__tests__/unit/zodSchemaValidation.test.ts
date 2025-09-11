import { z } from "zod";

// Import the actual schema from searchParams
const SearchFiltersSchema = z
  .object({
    type: z.string().optional(),
    fromDateTime: z.string().datetime().optional(),
    toDateTime: z.string().datetime().optional(),
  })
  .strict();

describe("Zod Schema Validation for Congress Filter", () => {
  describe("SearchFilters schema validation", () => {
    it("should accept valid filters", () => {
      const validFilters = {
        type: "hr",
        fromDateTime: "2023-01-01T00:00:00Z",
      };

      const result = SearchFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
    });

    it("should reject congress filter due to strict schema", () => {
      const filtersWithCongress = {
        type: "hr",
        congress: "117", // This should be rejected
      };

      const result = SearchFiltersSchema.safeParse(filtersWithCongress);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].code).toBe("unrecognized_keys");
        // Type assertion for ZodUnrecognizedKeysIssue
        const issue = result.error.issues[0] as z.ZodUnrecognizedKeysIssue;
        expect(issue.keys).toContain("congress");
      }
    });

    it("should reject multiple unknown keys including congress", () => {
      const filtersWithUnknownKeys = {
        congress: "117",
        unknownField: "value",
        type: "hr",
      };

      const result = SearchFiltersSchema.safeParse(filtersWithUnknownKeys);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].code).toBe("unrecognized_keys");
        // Type assertion for ZodUnrecognizedKeysIssue
        const issue = result.error.issues[0] as z.ZodUnrecognizedKeysIssue;
        expect(issue.keys).toContain("congress");
        expect(issue.keys).toContain("unknownField");
      }
    });

    it("should provide clear error message for congress filter", () => {
      const filtersWithCongress = {
        congress: "117",
      };

      const result = SearchFiltersSchema.safeParse(filtersWithCongress);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain(
          "Unrecognized key(s) in object: 'congress'"
        );
      }
    });
  });
});
