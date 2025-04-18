export interface Node {
  id: string;
  label: string;
  grid: boolean;
  loadData?: number[];
}

export interface Link {
  source: string;
  target: string;
}

export interface Graph {
  nodes: Node[];
  edges: Link[];
}
