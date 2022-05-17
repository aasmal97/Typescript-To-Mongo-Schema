import { ts } from "ts-morph";
import { isInterfaceDeclaration, isTypeAliasDeclaration } from "typescript";
const findParentTypeAlias = (
  node: ts.Node
): ts.TypeAliasDeclaration | ts.InterfaceDeclaration | undefined => {
  if (!node) return undefined;
  let typeNode: ts.TypeAliasDeclaration | ts.InterfaceDeclaration | undefined;
  if (isTypeAliasDeclaration(node) || isInterfaceDeclaration(node))
    typeNode = node;
  else typeNode = findParentTypeAlias(node.parent);
  return typeNode;
};
export default findParentTypeAlias;
