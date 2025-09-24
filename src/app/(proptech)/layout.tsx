"use client";

import { ReactNode } from 'react';
import { useSidebar } from "@/context/SidebarContext";
import AppHeaderCRM from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import AuthGuard from '@/components/AuthGuard';

export default function ProptechLayout({ children }: any) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <>
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen xl:flex">
          {/* Sidebar and Backdrop */}
          <AppSidebar />
          <Backdrop />
          {/* Main Content Area */}
          <div
            className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
          >
            {/* Header */}
            <AppHeaderCRM />
            {/* Page Content */}
            <div className="p-2 mx-auto max-w-(--breakpoint-2xl) md:p-4">
              {children}
            </div>
          </div>
        </div>
      </AuthGuard>
      
      {/* Footer sticky con flecha y Powered by OnTech */}
      <footer className="sticky bottom-0 left-0 right-0 z-30 h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6">
        <div className="text-sm text-gray-500">
          Powered by <a href="https://ontech.com.py" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer">OnTech</a>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </footer>
    </>
  );
};