import { Project, ts } from "ts-morph";
import grabSubNodes from "./grabSubNodes";
import categorizeNodes from "./categorizeNodes";
import extractProperties from "./extractProperties";
import { isExportSpecifier, isInterfaceDeclaration } from "typescript";
import findParentTypeAlias from "./findParentTypeNode";
import * as fs from "fs";
import path from "path";
type GenerateSchema = {
  configPath: string;
  identifier: string;
  filePath: string;
};

export const generateSchema = ({
  configPath,
  filePath,
  identifier,
}: GenerateSchema) => {
  const project = new Project({
    tsConfigFilePath: configPath,
  });
  const file = project.getSourceFileOrThrow(filePath);
  const statements = file.compilerNode.statements;
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
  if (!idParent) return {};
  const properties = extractProperties({
    imports: imports,
    ids: identifiers,
    node: idParent,
    paths: {
      configPath,
      filePath,
      identifier
    },
    props: {}
  });
  return properties;
};

//seperate file
const projectPath = "../Documenting Ukraine/Documentating Ukraine";
const configPath = projectPath + "/tsconfig.json";
const filePath = projectPath + "/src/types/dataTypes/WarCrimes.tsx";

const jsonSchema = generateSchema({
  configPath: configPath,
  identifier: "WarCrimes",
  filePath: filePath,
});
const currDirectory = path.join(__dirname, "/jsonSchema.json");
fs.writeFile(
  currDirectory,
  JSON.stringify(jsonSchema),
  { flag: "w+" },
  (err) => {}
);
