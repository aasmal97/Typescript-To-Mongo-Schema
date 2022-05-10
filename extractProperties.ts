import { ts } from "ts-morph";
import { isGetAccessor, isIntersectionTypeNode, isPropertySignature, isTypeAliasDeclaration, isUnionTypeNode } from "typescript";
import grabSubNodes from "./grabSubNodes";
type ExtractProps = {
  imports: { [key: string]: string };
  ids: { [key: string]: ts.Node };
  node: ts.TypeAliasDeclaration;
};
function extractProperties({ imports, ids, node }: ExtractProps) {
    //categories nodes
    const unionNodes = grabSubNodes(
        node,
        (n) => isUnionTypeNode(n)
    )  
    const intersectionNodes = grabSubNodes(
        node, 
        (n) => isIntersectionTypeNode(n)
    ) 
    const propNodes = grabSubNodes(
        node, 
        (n) => isPropertySignature(n) 
    )
    
}
export default extractProperties;
