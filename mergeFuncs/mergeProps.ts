import extractProperties, { ExtractProps } from "../extractProperties";
import { isIdentifier } from "typescript";
function mergeProps({ node, imports, ids, paths, props, resolveCustomGenerics }: ExtractProps) {
  const mergedProps: {
    bsonType: string;
    properties: { [key: string]: any };
    required: string[];
  } = {
    bsonType: "object",
    properties: {},
    required: [],
  };
  node.forEachChild((n) => {
    if (isIdentifier(n)) return 
    const extracted = extractProperties({
      imports,
      ids,
      node: n,
      paths,
      props,
      resolveCustomGenerics
    });
    for (const [key, value] of Object.entries(extracted)) {
      if (value.required) mergedProps.required.push(key);
      mergedProps.properties[key] = value.value;
    }
  });
  return mergedProps;
}
export default mergeProps;
