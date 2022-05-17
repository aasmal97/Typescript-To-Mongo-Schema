import { ts } from "ts-morph";

function grabSubNodes(
  node: ts.Node | undefined,
  condition: (node: ts.Node) => boolean
) {
  if (!node) return [];
  let array: ts.Node[] = [];
  if (condition(node)) array.push(node);
  node.forEachChild((node) => {
    if (condition(node)) array.push(node);
    array = [...array, ...grabSubNodes(node, condition)];
  });
  return array;
}
export default grabSubNodes;
