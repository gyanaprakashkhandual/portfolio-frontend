import reactjsFileMap from "./filemap/react.file.map";

export type FileMapEntry = { fileName: string; filePath: string };
export type FileMap = Record<string, FileMapEntry>;

const fileMap: Record<string, FileMap> = {
  reactjs: reactjsFileMap,
};

export default fileMap;
