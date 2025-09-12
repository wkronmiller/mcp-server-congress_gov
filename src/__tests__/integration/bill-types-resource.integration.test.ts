import { handleBillTypesResource } from "../../resourceHandlers.js";
import { BillTypesResponse } from "../../types/index.js";

describe("Bill Types Resource Integration", () => {
  describe("handleBillTypesResource", () => {
    it("should return complete list of bill types", async () => {
      const result = await handleBillTypesResource("congress-gov://bill-types");

      expect(result).toBeDefined();
      expect(result.contents).toBeDefined();
      expect(result.contents).toHaveLength(1);

      const content = result.contents[0];
      expect(content.uri).toBe("congress-gov://bill-types");
      expect(content.mimeType).toBe("application/json");

      const data: BillTypesResponse = JSON.parse(content.text);

      // Verify structure
      expect(data.billTypes).toBeDefined();
      expect(data.count).toBe(8);
      expect(data.metadata).toBeDefined();
      expect(data.metadata.description).toContain("bill types");
      expect(data.metadata.lastUpdated).toBeDefined();

      // Verify all expected bill types are present
      const billTypeCodes = data.billTypes.map((bt) => bt.code);
      expect(billTypeCodes).toEqual(
        expect.arrayContaining([
          "hr",
          "s",
          "hjres",
          "sjres",
          "hconres",
          "sconres",
          "hres",
          "sres",
        ])
      );

      // Verify each bill type has required fields
      data.billTypes.forEach((billType) => {
        expect(billType.code).toBeDefined();
        expect(billType.name).toBeDefined();
        expect(billType.description).toBeDefined();
        expect(billType.examples).toBeDefined();
        expect(billType.examples.length).toBeGreaterThan(0);
        expect(billType.chamber).toMatch(/^(house|senate|both)$/);
      });

      // Verify specific bill types
      const houseBill = data.billTypes.find((bt) => bt.code === "hr");
      expect(houseBill).toBeDefined();
      expect(houseBill!.name).toBe("House Bill");
      expect(houseBill!.chamber).toBe("house");
      expect(houseBill!.examples).toContain("H.R. 1");

      const senateBill = data.billTypes.find((bt) => bt.code === "s");
      expect(senateBill).toBeDefined();
      expect(senateBill!.name).toBe("Senate Bill");
      expect(senateBill!.chamber).toBe("senate");
      expect(senateBill!.examples).toContain("S. 25");
    });

    it("should throw error for invalid URI", async () => {
      await expect(
        handleBillTypesResource("congress-gov://invalid-resource")
      ).rejects.toThrow("Invalid bill types resource URI");
    });

    it("should throw error for incorrect URI format", async () => {
      await expect(
        handleBillTypesResource("congress-gov://bill-types/extra")
      ).rejects.toThrow("Invalid bill types resource URI");
    });
  });
});
