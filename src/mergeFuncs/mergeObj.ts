import extractProperties, { ExtractProps } from "../extractProperties";
function mergeObj({
  node,
  imports,
  ids,
  paths,
  props,
  resolveCustomGenerics,
  extension,
}: ExtractProps) {
  let mergedProps: {
    [key: string]: any;
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
      resolveCustomGenerics,
      extension,
    });
    if (extracted.properties && extracted.required)
      mergedProps = {
        ...mergedProps,
        properties: {
          ...mergedProps.properties,
          ...extracted.properties,
        },
        required: [...extracted.required, ...mergedProps.required],
      };
    else if (extracted.anyOf) {
      if (extracted.anyOf.length > 1)
        mergedProps = { ...mergedProps, ...extracted };
    }
  });
  return mergedProps;
}
export default mergeObj;
