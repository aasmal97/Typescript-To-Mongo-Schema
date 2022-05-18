import generateNewFilePath, {
  GenerateFilePathProps,
} from "../utilityFuncs/generateNewFilePath";
import initalizeNewFile from "./initializeNewFile";

const searchForExport = ({ name, imports, paths, extension }: GenerateFilePathProps) => {
  const newFilePath = generateNewFilePath({ name, imports, paths, extension });
  const { idParent } = initalizeNewFile({
    configPath: paths.configPath,
    filePath: newFilePath,
    identifier: name,
    extension
  });
  return idParent;
};
export default searchForExport;
