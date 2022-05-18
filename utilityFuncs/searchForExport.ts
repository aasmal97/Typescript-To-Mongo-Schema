import generateNewFilePath, {
  GenerateFilePathProps,
} from "../utilityFuncs/generateNewFilePath";
import initalizeNewFile from "./initializeNewFile";

const searchForExport = ({ name, imports, paths }: GenerateFilePathProps) => {
  const newFilePath = generateNewFilePath({ name, imports, paths });
  const { idParent } = initalizeNewFile({
    configPath: paths.configPath,
    filePath: newFilePath,
    identifier: name,
  });
  return idParent;
};
export default searchForExport;
