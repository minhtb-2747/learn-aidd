import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL's auto-cleanup only registers when a global `afterEach` exists at import
// time, which is not guaranteed here — unmounting explicitly keeps one test's
// DOM (and its effects) from leaking into the next.
afterEach(cleanup);
