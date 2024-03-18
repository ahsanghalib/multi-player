import { beforeEach, expect, afterEach } from "vitest";
import "vitest-dom/extend-expect";
import * as domMatchers from "vitest-dom/matchers";

expect.extend(domMatchers);

beforeEach(() => {
  vi.spyOn(console, "error");
  vi.spyOn(console, "log");
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
