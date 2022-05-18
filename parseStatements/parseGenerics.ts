import { ts } from "ts-morph";
import { isIdentifier} from "typescript";
import { ExtractProps } from "../extractProperties";
import extractProperties from "../extractProperties";
const parseGenerics = ({
  node,
  ids,
  imports,
  props,
  paths,
  resolveCustomGenerics,
  extension
}: Omit<ExtractProps, "node"> & { node: ts.TypeReferenceNode }) => {
  let name: string = "";
  node.forEachChild((n) => {
    if (isIdentifier(n)) name = n.escapedText.toString();
  });
  if (name === "") return { ...props };
  const typeArgs = node.typeArguments;
  if (!typeArgs || !resolveCustomGenerics) return { ...props };
  const resolvingFunc = resolveCustomGenerics[name];
  let argProps: { [key: string]: any } = {};
  const propsPerArg: { [key: string]: any }[] = [];
  for (const arg of typeArgs) {
    argProps = extractProperties({
      node: arg,
      imports,
      ids,
      resolveCustomGenerics,
      paths,
      props: argProps,
      extension
    });
  }
  const newProps = resolvingFunc({
    propertiesPerArg: propsPerArg,
    combinedProperties: argProps,
  });
  return newProps;
};
export default parseGenerics;
//   let genericNode:
//     | ts.TypeAliasDeclaration
//     | ts.InterfaceDeclaration
//     | undefined;
//   const newNode = ids[name]?.parent;
//   if (
//     name in ids &&
//     (isTypeAliasDeclaration(newNode) || isInterfaceDeclaration(newNode))
//   )
//     genericNode = newNode;
//   else if (name in imports)
//     genericNode = searchForExport({ imports, paths, name });
//   else return { ...props };
//   if (!genericNode) return { ...props };
//  const typeParams = genericNode.typeParameters

/*
    // const extracted = extractProperties({
    //   imports,
    //   ids,
    //   node: arg,
    //   paths,
    //   props,
    //   resolveCustomGenerics,
    // });
    // propsPerArg.push(extracted);
    // if (isInterfaceDeclaration(arg))
    //   argProps = mergeProps({
    //     node: arg,
    //     imports,
    //     ids,
    //     paths,
    //     props: argProps,
    //     resolveCustomGenerics,
    //   });
    // else
    //   argProps = mergeObj({
    //     node: arg,
    //     imports,
    //     ids,
    //     paths,
    //     props: argProps,
    //     resolveCustomGenerics,
    //   });
*/
