import { describe, it, expect } from "vitest";
import {
  AUDIT_LOG_PATH,
  AUDIT_LOG_PAGE_PATH,
} from "../constants/routes";

describe("Route constants — audit log", () => {
  it("sépare la route SPA de l'endpoint API", () => {
    expect(AUDIT_LOG_PATH).not.toBe(AUDIT_LOG_PAGE_PATH);
    expect(AUDIT_LOG_PATH).toBe("/api/audit-log");
    expect(AUDIT_LOG_PAGE_PATH).toBe("/audit-log");
  });
});