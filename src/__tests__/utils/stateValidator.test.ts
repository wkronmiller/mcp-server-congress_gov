import {
  validateStateCode,
  validateDistrict,
  validateBioguideId,
  VALID_STATE_CODES,
} from "../../utils/stateValidator.js";
import { InvalidParameterError } from "../../utils/errors.js";

describe("State Validator", () => {
  describe("validateStateCode", () => {
    it("should validate correct state codes", () => {
      expect(validateStateCode("CA")).toBe("CA");
      expect(validateStateCode("ca")).toBe("CA");
      expect(validateStateCode("NY")).toBe("NY");
      expect(validateStateCode("ny")).toBe("NY");
    });

    it("should validate territory codes", () => {
      expect(validateStateCode("PR")).toBe("PR");
      expect(validateStateCode("VI")).toBe("VI");
      expect(validateStateCode("GU")).toBe("GU");
      expect(validateStateCode("DC")).toBe("DC");
    });

    it("should throw error for invalid state codes", () => {
      expect(() => validateStateCode("XX")).toThrow(InvalidParameterError);
      expect(() => validateStateCode("ZZ")).toThrow(InvalidParameterError);
      expect(() => validateStateCode("California")).toThrow(
        InvalidParameterError
      );
    });

    it("should throw error for empty or null state codes", () => {
      expect(() => validateStateCode("")).toThrow(InvalidParameterError);
      expect(() => validateStateCode(null as any)).toThrow(
        InvalidParameterError
      );
      expect(() => validateStateCode(undefined as any)).toThrow(
        InvalidParameterError
      );
    });

    it("should have all expected state codes", () => {
      const expectedStates = [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
        "DC",
        "PR",
        "VI",
        "GU",
        "AS",
        "MP",
      ];

      expectedStates.forEach((state) => {
        expect(VALID_STATE_CODES.has(state)).toBe(true);
      });

      expect(VALID_STATE_CODES.size).toBe(56);
    });
  });

  describe("validateDistrict", () => {
    it("should validate correct district numbers", () => {
      expect(validateDistrict("0")).toBe("0");
      expect(validateDistrict("1")).toBe("1");
      expect(validateDistrict("25")).toBe("25");
      expect(validateDistrict("53")).toBe("53");
    });

    it("should throw error for invalid district numbers", () => {
      expect(() => validateDistrict("-1")).toThrow(InvalidParameterError);
      expect(() => validateDistrict("54")).toThrow(InvalidParameterError);
      expect(() => validateDistrict("abc")).toThrow(InvalidParameterError);
      expect(() => validateDistrict("1.5")).toThrow(InvalidParameterError);
    });

    it("should throw error for empty or null district", () => {
      expect(() => validateDistrict("")).toThrow(InvalidParameterError);
      expect(() => validateDistrict(null as any)).toThrow(
        InvalidParameterError
      );
      expect(() => validateDistrict(undefined as any)).toThrow(
        InvalidParameterError
      );
    });
  });

  describe("validateBioguideId", () => {
    it("should validate correct BioguideId formats", () => {
      expect(validateBioguideId("P000197")).toBe("P000197");
      expect(validateBioguideId("A000370")).toBe("A000370");
      expect(validateBioguideId("S001165")).toBe("S001165");
    });

    it("should throw error for invalid BioguideId formats", () => {
      expect(() => validateBioguideId("P000")).toThrow(InvalidParameterError);
      expect(() => validateBioguideId("P0001977")).toThrow(
        InvalidParameterError
      );
      expect(() => validateBioguideId("p000197")).toThrow(
        InvalidParameterError
      );
      expect(() => validateBioguideId("PP000197")).toThrow(
        InvalidParameterError
      );
      expect(() => validateBioguideId("P00019A")).toThrow(
        InvalidParameterError
      );
    });

    it("should throw error for empty or null BioguideId", () => {
      expect(() => validateBioguideId("")).toThrow(InvalidParameterError);
      expect(() => validateBioguideId(null as any)).toThrow(
        InvalidParameterError
      );
      expect(() => validateBioguideId(undefined as any)).toThrow(
        InvalidParameterError
      );
    });
  });
});
