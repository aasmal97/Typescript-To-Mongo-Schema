import { ts } from "ts-morph";
import { isTypeAliasDeclaration } from "typescript";
const findParentTypeAlias = (
  node: ts.Node
): ts.TypeAliasDeclaration | undefined => {
  if (!node) return undefined;
  let typeNode: ts.TypeAliasDeclaration | undefined;
  if (isTypeAliasDeclaration(node)) typeNode = node;
  else typeNode = findParentTypeAlias(node.parent);
  return typeNode;
};
export default findParentTypeAlias