import { ExtractProps } from "../extractProperties";
import { isIdentifier, isPropertySignature } from "typescript";
import convertValue from "./parsePropValues";
import extractProperties from "../extractProperties";

function parseProperties({
  node,
  imports,
  ids,
  paths,
  props,
  resolveCustomGenerics, 
  extension
}: ExtractProps) {
  const newProps: { [key: string]: { value: any; required?: boolean } } = {};
  let key: string | undefined = undefined;
  let keyProps: { [key: string]: any } | string | undefined = undefined;
  const isRequired = isPropertySignature(node) ? !node.questionToken : false;
  node.forEachChild((n) => {
    const value = convertValue({
      node: n,
      imports,
      paths,
      props,
      ids,
      resolveCustomGenerics,
      extension
    });
    if (isIdentifier(n) && typeof value === "string") key = value;
    else if (value !== undefined) keyProps = value;
    else
      keyProps = extractProperties({
        imports,
        ids,
        node: n,
        paths,
        props,
        resolveCustomGenerics,
        extension
      });
  });
  //assign all props extracted
  if (key && keyProps) newProps[key] = { value: keyProps };
  if (key && isRequired) newProps[key] = { ...newProps[key], required: true };
  return newProps;
}
export default parseProperties;
