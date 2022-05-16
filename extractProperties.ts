import { ts } from "ts-morph";
import { isIdentifier, isInterfaceDeclaration } from "typescript";
import findParentTypeAlias from "./findParentTypeNode";
import mergeProps from "./mergeProps";
import parseProperties from "./parseStatements/parseProperties";
import { generateSchema } from "./";
import mergeObj from "./mergeObj";
import path from "path";
import convertValue from "./convertPropValues";

export type ExtractProps = {
  imports: { [key: string]: string };
  ids: { [key: string]: ts.Node };
  node: ts.Node;
  props: { [key: string]: any };
  paths: {
    configPath: string;
    filePath: string;
    identifier: string;
  };
};

function extractProperties({ imports, ids, node, paths, props }: ExtractProps) {
  switch (ts.SyntaxKind[node.kind]) {
    case "IntersectionType":
      props = mergeObj({ node, imports, ids, paths, props });
      break;
    case "TypeLiteral":
      props = mergeProps({ node, imports, ids, paths, props });
      break;
    case "InterfaceDeclaration":
      props = mergeProps({ node, imports, ids, paths, props });
      break;
    case "TypeAliasDeclaration":
      props = mergeObj({ node, imports, ids, paths, props });
      break;
    case "UnionType":
      props = {
        anyOf: [],
      };
      node.forEachChild((n) => {
        props.anyOf.push({
          ...extractProperties({ imports, ids, node: n, paths, props: {} }),
        });
      });
      break;
    case "PropertySignature":
      props = parseProperties({ imports, ids, node, paths, props });
      break;
    case "TypeReference":
      node.forEachChild((node) => {
        if (isIdentifier(node)) {
          const nodeName = node.escapedText.toString();
          switch (true) {
            //built in types
            case nodeName === "Date":
              props = { bsonType: "date" };
              break;
            case nodeName === "ObjectId":
              props = { bsonType: "objectId" };
              break;
            //lookup node in ids, and recurse back to find props
            case nodeName in ids:
              const idParent = findParentTypeAlias(ids[nodeName].parent);
              if (!idParent) return props;
              if (isInterfaceDeclaration(idParent))
                props = mergeProps({
                  node: idParent,
                  imports,
                  ids,
                  paths,
                  props,
                });
              else
                props = mergeObj({
                  node: idParent,
                  imports,
                  ids,
                  paths,
                  props,
                });
              break;
            case nodeName in imports:
              /*
                  1. lookup node in imports, and find file. 
                  2. Then find id, and recurse back to find props
              */
              const importRelative = imports[nodeName].substring(
                1,
                imports[nodeName].length - 1
              );
              const newPathRelative = importRelative + ".tsx";
              const parsedRelative = newPathRelative.split(path.posix.sep);
              let newFilePath = paths.filePath;
              for (let segment of parsedRelative) {
                let newSegment = segment;
                if (segment === ".") newSegment = "..";
                else if (segment === "..") newSegment = "../../";
                newFilePath = path.resolve(newFilePath, newSegment);
              }
              props = {
                ...props,
                ...generateSchema({
                  configPath: paths.configPath,
                  filePath: newFilePath,
                  identifier: nodeName,
                }),
              };
              break;
            default:
              break;
          }
        }
      });
      break;
    default:
      const newProps = convertValue(node);
      if (newProps && typeof newProps !== "string") props = newProps;
      break;
  }
  return props;
}
export default extractProperties;
