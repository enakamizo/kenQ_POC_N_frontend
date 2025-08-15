"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// フォームの型定義
type FormDataType = {
  category: string;
  title: string;
  background: string;
  industry: string; // ← 追加
  businessDescription: string; // ← 追加
  university: string[]; // ← 追加
  researchField: string;
  researcherLevel: string[];
  deadline: string;
};

// Context の型定義
type FormContextType = {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
};

// Context を null 可能にする
const FormContext = createContext<FormContextType | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormDataType>({
    category: "",
    title: "",
    background: "",
    industry: "",             // ✅ 追加
    businessDescription: "",  // ✅ 追加
    university: [],           // ✅ 追加
    researchField: "",
    researcherLevel: [],
    deadline: "",
  });

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext(): FormContextType {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
