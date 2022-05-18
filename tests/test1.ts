import { generateSchema } from "../generateSchema";
import path from "path";
import * as fs from "fs";
import { ResolveCustomParams } from "../extractProperties";
//seperate file
const projectPath = "../../Documenting Ukraine/Documentating Ukraine";
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
