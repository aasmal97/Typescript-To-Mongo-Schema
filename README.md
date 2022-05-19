## Introduction
This program allows the user to convert Typescript defined interfaces or type alias declarations, to MongoDB bson type schemas. This is achieved through the steps below 

## Program Logic
<details>
<summary>Click To Expand!</summary>
<br>
  
The program traverses all nodes that the interface or type depends on, according to the steps below.
1. Generate a file's AST through the [Typescript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
2. Recursively parse through each AST node to either:
    - Extract the property types
    - Search another file for an imported module
4. Map the extracted AST property types to supported MongoDB bson types
5. Combine the property types into one large MongoDB bson schema

</details>

## Setup 
<details>
<summary>Click To Expand!</summary>
 <br>
  
```typescript
type GenerateSchema = {
  //Path to the tsconfig.json of the target project
  configPath: string;
  
  //Exact string name of type or interface declaration
  identifier: string;
  
  //Path to the file the identifier is located
  filePath: string;
  
  //typescript file extension
  extension: ".tsx" | ".ts";
  
  /* 
    Provide custom map that contains the name 
    of the custom generic as a string, and a 
    function that returns the bson schema value 
    of that generic
  */
  resolveCustomGenerics?: { [key: string]: (params: any) => any };
};
```
Example: 
```typescript
import { generateSchema } from "..";
import { ResolveCustomParams } from "..";
import * as fs from "fs";

//paths
const projectPath = "../../testProject";
const configPath = projectPath + "/tsconfig.json";
const filePath = projectPath + "/src/types/testFile.tsx";

const bsonSchema = generateSchema({
  configPath: configPath,
  identifier: "Person",
  filePath: filePath,
  extension: '.tsx',
});
```
</details>

## Error Management
<details>
<summary>Click To Expand!</summary>
<br>
  
If the program cannot parse the property type, an empty object will be returned in the property type's place. The user can then modify this manually, in the generated schema.
Example Typescript: 
```typescript
type ArrayOneOrMore<T> = {
  0: T;
} & Array<T>;

interface Person{
  name: string; 
  interests: ArrayOneOrMore<string>
}
```
BSON Schema Result: 
```typescript 
{
  bsonType: 'object'
  properties: {
    name: {bsonType: string}
    //empty object
    interests: {}
  }
  required: [
    name, 
    interests
  ]
}
```

#### Note:  
This will usually occur if the interface or type depends on a custom generic, or an imported type from a third-party library. If this is the case, please use    the resolveCustomGenerics function to provide a custom value. This outlined below.

</details>

## Providing Custom Values for Custom Generics
<details>
<summary>Click To Expand!</summary>
<br>

When the program returns too many empty objects for property values, there could be an unsupported custom generic that does not allow for the extraction of properties. However, that does not mean all hope is lost. 

Find the offending generics and pass in a map to help the program identify them, and parse them according to custom logic
```typescript
type ResolveCustomParams = {
  propertiesPerArg?: any[];
  combinedProperties?: { [key: string]: any };
};
const bsonSchema = generateSchema({
  configPath: configPath,
  identifier: "Person",
  filePath: filePath,
  extension: '.tsx',
  resolveCustomGenerics: {
    //the test file contains a custom generic declared as ArrayOneOrMore.
    //Therefore, the key is the name of the generic, and attached function 
    //returns the custom value for that generic
    ArrayOneOrMore: (props: ResolveCustomParams) => {
      return {
        bsonType: "array",
        items: props.combinedProperties,
        minItems: 1,
      };
    },
  },
});
```
  </details>
