import { ts } from "ts-morph";
import { isIdentifier, isLiteralTypeNode, isNumericLiteral, isStringLiteral } from "typescript";

function convertValue(node: ts.Node):
  | string
  | undefined
  | {
      [key: string]: any;
      bsonType: string;
    } {
  if (isIdentifier(node)) return node.escapedText.toString();
  if (isLiteralTypeNode(node)) return convertValue(node.literal)
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
