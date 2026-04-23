export type Wave = number[];

export interface Script {
  scriptId: number;
  dependencies: number[];
}

export interface ExecutionPlan {
  waves: Wave[];
  warnings: string[];
  efficiency: number;
}

export interface GraphNode {
  id: number;
  degree: number;
  dependsOn: number[];
}

export const sortByWaves = (data: Script[]): ExecutionPlan => {
  let ops = 0;
  const plan: ExecutionPlan = {
    waves: [],
    warnings: [],
    efficiency: 0,
  };

  if (!data.length) return plan;

  const adjacencyList = new Map<number, number[]>();
  const nodeMap = new Map<number, GraphNode>();
  const readyScripts: GraphNode[] = [];

  data.forEach((script) => {
    const node: GraphNode = {
      id: script.scriptId,
      degree: script.dependencies.length,
      dependsOn: script.dependencies,
    };

    nodeMap.set(node.id, node);

    if (node.degree === 0) {
      readyScripts.push(node);
    }

    script.dependencies.forEach((depId) => {
      if (!adjacencyList.has(depId)) {
        adjacencyList.set(depId, []);
      }
      adjacencyList.get(depId)!.push(node.id);
    });
  });

  while (readyScripts.length > 0) {
    const currWave = [...readyScripts];
    readyScripts.length = 0;
    plan.waves.push(currWave.map((n) => n.id));

    currWave.forEach((wave) => {
      const dependents = adjacencyList.get(wave.id);
      ops++;

      if (dependents) {
        dependents.forEach((dependentId) => {
          const depNode = nodeMap.get(dependentId);
          ops++;
          if (depNode && depNode.degree > 0) {
            depNode.degree--;
            if (depNode.degree === 0) {
              readyScripts.push(depNode);
            }
          }
        });
      }
    });
  }

  nodeMap.forEach((node) => {
    if (node.degree > 0) {
      const missDeps = node.dependsOn.filter((depId) => !nodeMap.has(depId));
      if (missDeps.length > 0) {
        plan.warnings.push(
          `Script ${node.id} depends on missing script ${missDeps.join(", ")}`,
        );
      }
    }
  });

  const E = data.reduce((sum, s) => sum + (s.dependencies.length || 0), 0);
  const theoreticalMin = data.length + E;
  plan.efficiency = Number(Math.min(1, theoreticalMin / (ops || 1)).toFixed(2));

  return plan;
};
