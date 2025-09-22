"use client";

import React from 'react';
import { GitBranch, GitCommit, Calendar } from 'lucide-react';

interface VersionInfoProps {
  className?: string;
  showDetails?: boolean;
}

const VersionInfo: React.FC<VersionInfoProps> = ({ 
  className = "", 
  showDetails = false 
}) => {
  // Información de versión (en producción esto vendría del backend)
  const versionInfo = {
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    build: process.env.NEXT_PUBLIC_BUILD_ID || 'dev',
    commit: process.env.NEXT_PUBLIC_GIT_COMMIT || 'local',
    branch: process.env.NEXT_PUBLIC_GIT_BRANCH || 'main',
    date: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0]
  };

  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      {showDetails ? (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="font-medium">v{versionInfo.version}</span>
            <span className="text-gray-400">•</span>
            <span>build {versionInfo.build}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              <span>{versionInfo.branch}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitCommit className="w-3 h-3" />
              <span>{versionInfo.commit.substring(0, 7)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{versionInfo.date}</span>
            </div>
          </div>
        </div>
      ) : (
        <span>v{versionInfo.version}</span>
      )}
    </div>
  );
};

export default React.memo(VersionInfo); 