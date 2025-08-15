"use client";

import { useRouter } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import RequestForm from "@/components/RequestForm";

export default function RegisterPage() {
  const router = useRouter();
  const { formData, setFormData } = useFormContext();

  const handleFormSubmit = (data: {
    category: string;
    title: string;
    background: string;
    industry: string;
    businessDescription: string;
    university: string[];
    researchField: string;
    researcherLevel: string[];
    deadline: string;
  }) => {
    setFormData(data);
    router.push("/register/confirm");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-4">新規案件を登録する</h1>
      <RequestForm onSubmit={handleFormSubmit} />
    </div>
  );
}
