"use client";

import RequestForm from "@/components/RequestForm";
import Header from "@/components/Header";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg mt-10">
        <h1 className="text-3xl font-bold mb-4">新規案件を登録する</h1>
        <RequestForm />
      </div>
    </>
  );
}
