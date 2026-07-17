import { describe, expect, it } from "vitest";
import { hasRequiredPatientIdentifier } from "./patient-identification";

describe("hasRequiredPatientIdentifier", () => {
  it("requires an insurance number for statutory insurance", () => {
    expect(hasRequiredPatientIdentifier({ insuranceType: "statutory" })).toBe(false);
    expect(hasRequiredPatientIdentifier({ insuranceType: "statutory", insuranceNumber: "A123" })).toBe(true);
    expect(hasRequiredPatientIdentifier({ insuranceType: "statutory", insuranceNumber: "   " })).toBe(false);
  });

  it("requires a practice patient number for private and self-paying patients", () => {
    expect(hasRequiredPatientIdentifier({ insuranceType: "private", insuranceNumber: "A123" })).toBe(false);
    expect(hasRequiredPatientIdentifier({ insuranceType: "self_pay", practicePatientNumber: "P123" })).toBe(true);
    expect(hasRequiredPatientIdentifier({ insuranceType: "private", practicePatientNumber: "P123" })).toBe(true);
  });
});
