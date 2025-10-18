"use client";

import React, { useState, useEffect } from 'react';
import { Agent, AgentSession } from '../types';
// import { validateSession, logoutAgent } from '../services/agentService'; // Funciones no implementadas
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AgentSessionStatusProps {
  onLogout: () => void;
}

export default function AgentSessionStatus({ onLogout }: AgentSessionStatusProps) {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [sessionInfo, setSessionInfo] = useState<AgentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Get current session token
  const getCurrentSessionToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessions = JSON.parse(localStorage.getItem('agent_sessions') || '[]');
      const currentSession = sessions.find((session: AgentSession) => {
        return new Date(session.expiresAt) > new Date();
      });
      return currentSession?.token || null;
    } catch (error) {
      return null;
    }
  };

  // Load current agent and session info
  useEffect(() => {
    const loadSessionInfo = async () => {
      try {
        const token = getCurrentSessionToken();
        if (token) {
          // const agent = await validateSession(token); // Función no implementada
          const agent = null; // Temporal
          if (agent) {
            setCurrentAgent(agent);
            
            // Get session info
            const sessions = JSON.parse(localStorage.getItem('agent_sessions') || '[]');
            const session = sessions.find((s: AgentSession) => s.token === token);
            setSessionInfo(session);
          }
        }
      } catch (error) {
        console.error('Error loading session info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionInfo();
  }, []);

  // Update time remaining
  useEffect(() => {
    if (!sessionInfo) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expiresAt = new Date(sessionInfo.expiresAt);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Sesión expirada');
        onLogout();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sessionInfo, onLogout]);

  const handleLogout = async () => {
    try {
      const token = getCurrentSessionToken();
      if (token) {
        // await logoutAgent(token); // Función no implementada
        // Temporal: solo limpiar localStorage
      }
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
      onLogout();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
        <div className="flex items-center space-x-2">
          <div className="flex justify-center items-center">
            <LoadingSpinner />
          </div>
          <span className="text-sm text-white">Cargando sesión...</span>
        </div>
      </div>
    );
  }

  if (!currentAgent) {
    return (
      <div className="bg-red-500/20 backdrop-blur-xl rounded-xl p-4 border border-red-500/30">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm text-red-300">Sesión no válida</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Agent Avatar */}
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {(currentAgent.nombre || currentAgent.firstName || '').charAt(0)}
              {(currentAgent.apellido || currentAgent.lastName || '').charAt(0)}
            </span>
          </div>
          
          {/* Agent Info */}
          <div>
            <h3 className="text-sm font-medium text-white">
              {currentAgent.firstName} {currentAgent.lastName}
            </h3>
            <p className="text-xs text-gray-300">{currentAgent.username}</p>
          </div>
        </div>

        {/* Session Status */}
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-300">Activo</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{timeRemaining}</p>
        </div>
      </div>

      {/* Last Login Info */}
      {currentAgent.lastLogin && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Último acceso:</span>
            <span>{new Date(currentAgent.lastLogin).toLocaleString('es-ES')}</span>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
} 