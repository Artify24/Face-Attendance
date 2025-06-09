"use client";
import AuthPage from "@/components/AuthPage";
import React from "react";

const page = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-blue-50">
      <div className="w-full max-w-md">
        <AuthPage />
      </div>
    </main>
  );
};

export default page;
