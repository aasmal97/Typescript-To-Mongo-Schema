import { ts } from "ts-morph";
import { isIdentifier } from "typescript";
import findParentTypeAlias from "./findParentTypeNode";
import mergeProps from "./mergeProps";
import parseProperties from "./parseStatements/parseProperties";
import { generateSchema } from "./";
import mergeObj from "./mergeObj";
import path from "path";

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
        anyOf: []
      };
      node.forEachChild((n) => {
        props.anyOf.push(
            {...extractProperties({ imports, ids, node: n, paths, props: {} })}
        );
      });
      break;
    case "PropertySignature":
      props = parseProperties({ imports, ids, node, paths, props });
      break;
    case "TypeReference":
      node.forEachChild((node) => {
        if (isIdentifier(node)) {
          const nodeName = node.escapedText.toString();
          //lookup node in ids, and recurse back to find props
          if (nodeName in ids) {
            const idParent = findParentTypeAlias(ids[nodeName].parent);
            if (!idParent) return props;
            props = mergeObj({ node: idParent, imports, ids, paths, props });
          } else if (nodeName in imports) {
            /*
                1. lookup node in imports, and find file. 
                2. Then find id, and recurse back to find props
            */
            const importRelative = imports[nodeName].substring(1, imports[nodeName].length-1)
            const newPathRelative = importRelative + ".tsx"
            const parsedRelative = newPathRelative.split(path.posix.sep)
            let newFilePath = paths.filePath
              for (let segment of parsedRelative) {
                let newSegment = segment
                  if (segment === ".") newSegment = ".."
                else if(segment === "..") newSegment = "../../"
                newFilePath = path.resolve(
                    newFilePath,
                    newSegment
                );
            }
            props = {
              ...props,
              ...generateSchema({
                configPath: paths.configPath,
                filePath: newFilePath,
                identifier: nodeName,
              }),
            };
          }
        }
      });
      break;
    default:
      break;
  }
  //console.log(props, ts.SyntaxKind[node.kind]);
  return props;
}
export default extractProperties;
