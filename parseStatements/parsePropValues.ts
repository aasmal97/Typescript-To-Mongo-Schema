import { ts } from "ts-morph";
import {
  isArrayTypeNode,
  isIdentifier,
  isLiteralTypeNode,
  isNumericLiteral,
  isStringLiteral,
} from "typescript";
import extractProperties from "../extractProperties";
import { ExtractProps } from "../extractProperties";
function convertValue({
  node,
  ids,
  imports,
  props,
  paths,
  resolveCustomGenerics,
  extension
}: ExtractProps):
  | string
  | undefined
  | {
      [key: string]: any;
      bsonType: string;
    } {
  if (isIdentifier(node)) {
    const name = node.escapedText.toString();
    if (name === "Date") return { bsonType: "date" };
    return name;
  }
  if (isLiteralTypeNode(node))
    return convertValue({
      node: node.literal,
      ids,
      imports,
      props,
      paths,
      resolveCustomGenerics,
      extension
    });
  if (isArrayTypeNode(node))
    return {
      bsonType: "array",
      items: {
        ...extractProperties({
          node: node.elementType,
          ids,
          imports,
          props,
          paths,
          resolveCustomGenerics,
          extension
        }),
      },
    };
  if (isStringLiteral(node))
    return {
      bsonType: "string",
      enum: [node.text],
    };
  if (isNumericLiteral(node))
    return {
      bsonType: "double",
      enum: [node.text],
    };
  switch (ts.SyntaxKind[node.kind]) {
    case "StringKeyword":
      return { bsonType: "string" };
    case "BooleanKeyword":
      return { bsonType: "bool" };
    case "NumberKeyword":
      return { bsonType: "double" };
    case "TrueKeyword":
      return { bsonType: "bool", enum: [true] };
    case "FalseKeyword":
      return { bsonType: "bool", enum: [false] };
    default:
      return undefined;
  }
}
export default convertValue;
