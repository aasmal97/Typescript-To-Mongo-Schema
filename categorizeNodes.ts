import {
  isIdentifier,
  isImportDeclaration,
  isInterfaceDeclaration,
  isTypeAliasDeclaration,
  isVariableDeclaration,
} from "typescript";
import { ts } from "ts-morph";
import grabSubNodes from "./grabSubNodes";

function categorizeNodes(nodes: ts.Node[]) {
  const imports: { [key: string]: string } = {};
  const identifiers: { [key: string]: ts.Node } = {};
  for (const node of nodes) {
    //create a map of all unique Types Declarations for O(1) look up
    if (
      isIdentifier(node) &&
      (isTypeAliasDeclaration(node.parent) ||
        isInterfaceDeclaration(node.parent) ||
        isVariableDeclaration(node.parent))
    )
      identifiers[node.escapedText.toString()] = node;
    //create a map for all import names and paths
    else if (isImportDeclaration(node)) {
      const importClause = grabSubNodes(
        node.importClause?.namedBindings,
        (node) => isIdentifier(node)
      );
      for (const identifier of importClause) {
        //store import name with import file location
        if (isIdentifier(identifier)) {
          const text = identifier.escapedText.toString();
          imports[text] = node.moduleSpecifier.getText();
        }
      }
    }
  }
  return { imports, identifiers };
}
export default categorizeNodes;
