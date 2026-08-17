import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("scroll behavior", () => {
  it("resets the window position whenever the Wouter location changes", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

    expect(source).toContain("function ScrollToTop()");
    expect(source).toContain("const [location] = useLocation()");
    expect(source).toContain("window.scrollTo({ top: 0, left: 0, behavior: \"auto\" })");
    expect(source).toContain("}, [location]);");
    expect(styles).toContain("html { background: #0a0d10; scroll-behavior: auto; }");
    expect(styles).not.toContain("scroll-behavior: smooth");
  });
});
