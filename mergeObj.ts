import { ExtractProps } from "./extractProperties";
import extractProperties from "./extractProperties";
import { isIdentifier } from "typescript";
function mergeObj({ node, imports, ids, paths, props }: ExtractProps) {
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
      props
    });
    //console.log(extracted);
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
          if(extracted.anyOf.length > 1) mergedProps = { ...mergedProps, ...extracted };
      }
  });
  return mergedProps;
}
export default mergeObj;
