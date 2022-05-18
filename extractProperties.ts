import { ts } from "ts-morph";
import { isTypeReferenceNode } from "typescript";
import mergeProps from "./mergeFuncs/mergeProps";
import parseProperties from "./parseStatements/parseProperties";
import mergeObj from "./mergeFuncs/mergeObj";
import convertValue from "./parseStatements/parsePropValues";
import parseGenerics from "./parseStatements/parseGenerics";
import parseTypeRef from "./parseStatements/parseTypeRefs";
export type ResolveCustomParams = {
  propertiesPerArg?: any[];
  combinedProperties?: { [key: string]: any };
};
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
  resolveCustomGenerics?: {
    [key: string]: (params: ResolveCustomParams) => any;
  };
};
function extractProperties({
  imports,
  ids,
  node,
  paths,
  props,
  resolveCustomGenerics,
}: ExtractProps) {
  switch (ts.SyntaxKind[node.kind]) {
    case "IntersectionType":
      props = mergeObj({
        node,
        imports,
        ids,
        paths,
        props,
        resolveCustomGenerics,
      });
      break;
    case "TypeLiteral":
      props = mergeProps({
        node,
        imports,
        ids,
        paths,
        props,
        resolveCustomGenerics,
      });
      break;
    case "InterfaceDeclaration":
      props = mergeProps({
        node,
        imports,
        ids,
        paths,
        props,
        resolveCustomGenerics,
      });
      break;
    case "TypeAliasDeclaration":
      props = mergeObj({
        node,
        imports,
        ids,
        paths,
        props,
        resolveCustomGenerics,
      });
      break;
    case "UnionType":
      props = {
        anyOf: [],
      };
      node.forEachChild((n) => {
        props.anyOf.push({
          ...extractProperties({
            imports,
            ids,
            node: n,
            paths,
            props: {},
            resolveCustomGenerics,
          }),
        });
      });
      break;
    case "PropertySignature":
      props = parseProperties({
        imports,
        ids,
        node,
        paths,
        props,
        resolveCustomGenerics,
      });
      break;
    case "TypeReference":
      //parse generics
      if (isTypeReferenceNode(node) && node.typeArguments) {
        props = parseGenerics({
          node,
          props,
          ids,
          imports,
          paths,
          resolveCustomGenerics,
        });
      } else
        props = parseTypeRef({
          node,
          props,
          ids,
          imports,
          paths,
          resolveCustomGenerics,
        });

      break;
    default:
      const newProps = convertValue({
        node: node,
        ids,
        imports,
        paths,
        props,
        resolveCustomGenerics,
      });
      if (newProps && typeof newProps !== "string") props = newProps;
      break;
  }
  return props;
}
export default extractProperties;
