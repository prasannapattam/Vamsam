import { HierarchyNode } from 'd3-hierarchy';

declare module 'd3-hierarchy' {
  interface HierarchyNode<Datum> {
    x: number;
    y: number;
    width: number;
  }
}
