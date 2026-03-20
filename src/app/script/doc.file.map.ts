import reactjsFileMap from "./fileMaps/react.file.map";
import seleniumFileMap from "./fileMaps/selenium.file.map";

export type FileMapEntry = { fileName: string; filePath: string };
export type FileMap = Record<string, FileMapEntry>;

const fileMap: Record<string, FileMap> = {
  reactjs: reactjsFileMap,
  selenium: seleniumFileMap
};

export default fileMap;
