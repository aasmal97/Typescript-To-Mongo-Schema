import extractProperties from "./extractProperties";
import * as fs from "fs";
import path from "path";
import initalizeNewFile from "./utilityFuncs/initializeNewFile";
import { ResolveCustomParams } from "./extractProperties";
export type GenerateSchema = {
  configPath: string;
  identifier: string;
  filePath: string;
  resolveCustomGenerics?: { [key: string]: (params: any) => any }
};

export const generateSchema = ({
  configPath,
  filePath,
  identifier,
  resolveCustomGenerics,
}: GenerateSchema) => {
  const { idParent, imports, identifiers } = initalizeNewFile({
    configPath,
    filePath,
    identifier,
  });
  if (!idParent) return {};
  const properties = extractProperties({
    imports: imports,
    ids: identifiers,
    node: idParent,
    paths: {
      configPath,
      filePath,
      identifier,
    },
    props: {},
    resolveCustomGenerics: resolveCustomGenerics,
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
  resolveCustomGenerics: {
    ArrayOneOrMore: (props: ResolveCustomParams) => {
      return {
        bsonType: "array",
        items: props.combinedProperties,
        minItems: 1,
      };
    },
  },
});
const currDirectory = path.join(__dirname, "/jsonSchema.json");
fs.writeFile(
  currDirectory,
  JSON.stringify(jsonSchema),
  { flag: "w+" },
  (err) => {}
);
