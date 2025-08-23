"use client";

import { useState } from "react";
import RequestForm from "@/components/RequestForm";

export default function RegisterPage() {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg mt-10">
      {!isProcessing && (
        <h1 className="text-3xl font-bold mb-4">案件を登録する</h1>
      )}
      <RequestForm onStatusChange={setIsProcessing} />
    </div>
  );
}
