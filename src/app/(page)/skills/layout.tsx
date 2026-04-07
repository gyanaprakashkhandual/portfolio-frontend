"use client";

import { useState, createContext, useContext } from "react";
import SkillsSidebar, { ISkill } from "./Skill.sidebar";

interface SkillsContextType {
  skills: ISkill[];
  loading: boolean;
  selectedKey: string;
  setSkillsData: (data: ISkill[], key: string, loading: boolean) => void;
  onKeyChange: (key: string) => void;
}

export const SkillsContext = createContext<SkillsContextType>({
  skills: [],
  loading: true,
  selectedKey: "web/backend",
  setSkillsData: () => {},
  onKeyChange: () => {},
});

export function useSkillsContext() {
  return useContext(SkillsContext);
}

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [skills, setSkills] = useState<ISkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState("web/backend");

  function setSkillsData(data: ISkill[], _key: string, isLoading: boolean) {
    setSkills(data);
    setLoading(isLoading);
  }

  return (
    <SkillsContext.Provider
      value={{
        skills,
        loading,
        selectedKey,
        setSkillsData,
        onKeyChange: setSelectedKey,
      }}
    >
      <div className="flex h-[calc(100vh-56px)] bg-white overflow-hidden dark:bg-gray-950">
        <SkillsSidebar
          onSelect={setSkillsData}
          selectedKey={selectedKey}
          onKeyChange={setSelectedKey}
        />
        <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>
      </div>
    </SkillsContext.Provider>
  );
}
