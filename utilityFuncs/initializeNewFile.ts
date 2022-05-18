import { GenerateSchema } from "../";
import { Project, ts } from "ts-morph";
import grabSubNodes from "../searchNodeFunc/findSubNode";
import { isExportSpecifier } from "typescript";
import findParentTypeAlias from "../searchNodeFunc/findParentTypeNode";
import categorizeNodes from "../categorizeNodes";

const initalizeNewFile = ({
  configPath,
  filePath,
  identifier,
}: GenerateSchema) => {
  const project = new Project({
    tsConfigFilePath: configPath,
  });
  const file = project.getSourceFileOrThrow(filePath);
  const node = file.compilerNode;
  const statements = node.statements;
  let nodes: ts.Node[] = [];
  for (const statement of statements) {
    nodes = [
      ...nodes,
      ...grabSubNodes(
        statement,
        (node: ts.Node) => !isExportSpecifier(node.parent)
      ),
    ];
  }
  const { imports, identifiers } = categorizeNodes(nodes);
  const idParent = findParentTypeAlias(identifiers[identifier].parent);
  return { idParent, imports, identifiers };
};
export default initalizeNewFile;
