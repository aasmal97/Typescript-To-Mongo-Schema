import { ExtractProps } from "./extractProperties";
import extractProperties from "./extractProperties";
function mergeProps({ node, imports, ids, paths, props }: ExtractProps) {
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
    const extracted = extractProperties({
      imports,
      ids,
      node: n,
      paths,
      props,
    });
    for (const [key, value] of Object.entries(extracted)) {
      if (value.required) mergedProps.required.push(key);
      mergedProps.properties[key] = value.value;
    }
  });
  return mergedProps;
}
export default mergeProps;
