"use client";

import React from "react";

import Link from "next/link";
import KanbanBoard from "./components/KanbanBoard";
import { KanbanColumn } from "./components/types";
import { propertyService } from "@/app/(proptech)/properties/services/propertyService";

const getProperty = (id: string) => {
  // Retornar null para evitar llamadas al API que pueden fallar
  return null;
};

const VisitsPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Main Content */}
      <div className="w-full max-w-full mx-auto px-0 py-0">
        <KanbanBoard sampleProperties={[]} getProperty={getProperty} />
      </div>
    </div>
  );
};

export default VisitsPage; 