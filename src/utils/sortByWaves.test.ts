import { describe, expect, it } from "vitest";
import { sortByWaves, type Script } from "./sortByWaves";

describe("sortByWaves - test diff scenarios", () => {
  it("handles linear chain", () => {
    const data = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [1] },
      { scriptId: 3, dependencies: [2] },
      { scriptId: 4, dependencies: [3] },
      { scriptId: 5, dependencies: [4] },
    ];

    const result = sortByWaves(data);

    expect(result.waves).toHaveLength(5);
    expect(result.waves).toEqual([[1], [2], [3], [4], [5]]);
  });

  it("handles paralel dependency", () => {
    const data = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [1] },
      { scriptId: 3, dependencies: [1] },
      { scriptId: 4, dependencies: [2, 3] },
    ];

    const result = sortByWaves(data);

    expect(result.waves).toEqual([[1], [2, 3], [4]]);
  });

  it("handles multiple disconnected components", () => {
    const data = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [1] },
      { scriptId: 10, dependencies: [] },
      { scriptId: 11, dependencies: [10] },
    ];

    const result = sortByWaves(data);

    expect(result.waves[0]).toContain(1);
    expect(result.waves[0]).toContain(10);
    expect(result.waves[1]).toContain(2);
    expect(result.waves[1]).toContain(11);
  });

  it("handles complex branching", () => {
    const data = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [] },
      { scriptId: 3, dependencies: [1] },
      { scriptId: 4, dependencies: [1] },
      { scriptId: 5, dependencies: [2] },
      { scriptId: 6, dependencies: [3, 4, 5] },
    ];

    const result = sortByWaves(data);

    expect(result.waves[0]).toEqual(expect.arrayContaining([1, 2]));
    expect(result.waves[1]).toEqual(expect.arrayContaining([3, 4, 5]));
    expect(result.waves[2]).toEqual(expect.arrayContaining([6]));
  });

  it("handles mixed valid scripts and missed deps", () => {
    const data = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [1, 999] },
      { scriptId: 3, dependencies: [1] },
    ];

    const result = sortByWaves(data);

    expect(result.waves).toEqual([[1], [3]]);
    expect(result.warnings[0]).toContain(
      "Script 2 depends on missing script 999",
    );
  });

  it("verif high efficiency on massive parallel tasks", () => {
    const data: Script[] = [];
    const count = 10000;
    const chains = 10;
    const chainLength = count / chains;

    for (let c = 0; c < chains; c++) {
      for (let i = 0; i < chainLength; i++) {
        const id = c * chainLength + i;
        data.push({
          scriptId: id,
          dependencies: i === 0 ? [] : [id - 1],
        });
      }
    }

    const startTime = performance.now();
    const result = sortByWaves(data);
    const endTime = performance.now();

    expect(result.waves).toHaveLength(chainLength);
    expect(result.waves[0]).toHaveLength(chains);
    expect(result.warnings).toHaveLength(0);
    expect(result.efficiency).toBeGreaterThanOrEqual(0.8);

    console.log(
      `Processed ${count} scripts in ${(endTime - startTime).toFixed(2)}ms`,
    );
  });

  it("handles scripts with multiple deps in diff waves", () => {
    const data = [
      { scriptId: 1, dependencies: [] },
      { scriptId: 2, dependencies: [1] },
      { scriptId: 3, dependencies: [1, 2] },
    ];
    const result = sortByWaves(data);

    expect(result.waves).toEqual([[1], [2], [3]]);
  });
});
