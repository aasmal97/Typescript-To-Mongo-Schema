import { isIdentifier, isInterfaceDeclaration } from "typescript";
import generateNewFilePath from "../utilityFuncs/generateNewFilePath";
import findParentTypeAlias from "../../src/searchNodeFunc/findParentTypeNode";
import mergeObj from "../mergeFuncs/mergeObj";
import mergeProps from "../mergeFuncs/mergeProps";
import { generateSchema } from "../generateSchema";
import { ExtractProps } from "../extractProperties";
const parseTypeRef = ({
  node,
  props,
  ids,
  imports,
  paths,
  resolveCustomGenerics,
  extension,
}: ExtractProps) => {
  let newProps = { ...props };
  node.forEachChild((n) => {
    if (isIdentifier(n)) {
      const nodeName = n.escapedText.toString();
      switch (true) {
        //built in types
        case nodeName === "Date":
          newProps = { bsonType: "date" };
          break;
        case nodeName === "ObjectId":
          newProps = { bsonType: "objectId" };
          break;
        //lookup node in ids, and recurse back to find props
        case nodeName in ids:
          const idParent = findParentTypeAlias(ids[nodeName].parent);
          if (!idParent) return newProps;
          else if (isInterfaceDeclaration(idParent))
            newProps = mergeProps({
              node: idParent,
              imports,
              ids,
              paths,
              props: newProps,
              resolveCustomGenerics,
              extension,
            });
          else
            newProps = mergeObj({
              node: idParent,
              imports,
              ids,
              paths,
              props: newProps,
              resolveCustomGenerics,
              extension,
            });
          break;
        case nodeName in imports:
          /*
            1. lookup node in imports, and find file. 
            2. Then find id, and recurse back to find props
        */
          const newFilePath = generateNewFilePath({
            imports,
            paths,
            name: nodeName,
            extension,
          });
          newProps = {
            ...props,
            ...generateSchema({
              configPath: paths.configPath,
              filePath: newFilePath,
              identifier: nodeName,
              resolveCustomGenerics,
              extension,
            }),
          };
          break;
        default:
          break;
      }
    }
  });
  return newProps;
};
export default parseTypeRef;
