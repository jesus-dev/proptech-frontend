'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MessagingService, Conversation, Message } from '@/services/messagingService';

export default function MessagesPage() {
  const { isAuthenticated, user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Cargar conversaciones desde BD
  useEffect(() => {
    const loadConversations = async () => {
      if (!isAuthenticated) {
        setConversations([]);
        setLoadingConversations(false);
        return;
      }

      try {
        setLoadingConversations(true);
        console.log('📥 Cargando conversaciones desde BD...');
        const fetchedConversations = await MessagingService.getConversations();
        setConversations(fetchedConversations);
        console.log(`✅ ${fetchedConversations.length} conversaciones cargadas`);
      } catch (error) {
        console.error('Error loading conversations:', error);
        setConversations([]);
      } finally {
        setLoadingConversations(false);
      }
    };

    loadConversations();
  }, [isAuthenticated]);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) {
        setMessages([]);
        return;
      }

      try {
        setLoadingMessages(true);
        console.log(`📥 Cargando mensajes de conversación ${selectedConversation}...`);
        const fetchedMessages = await MessagingService.getMessages(selectedConversation);
        setMessages(fetchedMessages);
        console.log(`✅ ${fetchedMessages.length} mensajes cargados`);
        
        // Marcar como leída
        await MessagingService.markAsRead(selectedConversation);
        
        // Actualizar contador de no leídos en la conversación
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedConversation]);

  // Enviar mensaje
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const currentConv = conversations.find(c => c.id === selectedConversation);
    if (!currentConv) return;

    try {
      setSending(true);
      console.log('📤 Enviando mensaje...');
      
      const sentMessage = await MessagingService.sendMessage(
        currentConv.participantId,
        newMessage,
        'TEXT'
      );
      
      if (sentMessage) {
        // Agregar el mensaje a la lista local
        setMessages(prev => [...prev, sentMessage]);
        
        // Limpiar input
        setNewMessage('');
        
        // Actualizar la última mensaje en la lista de conversaciones
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation 
            ? { ...conv, lastMessage: newMessage, lastMessageTime: 'Ahora' }
            : conv
        ));
        
        console.log('✅ Mensaje enviado');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar mensaje. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  };

  // Mensaje de no autenticado
  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Inicia sesión para ver tus mensajes</h3>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para acceder a tus conversaciones y mensajes.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] md:h-[calc(100vh-200px)]">
        {/* Lista de conversaciones - Responsive */}
        <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-200`}>
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Mensajes</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {loadingConversations ? 'Cargando...' : `${conversations.length} conversaciones`}
            </p>
          </div>
          
          <div className="overflow-y-auto h-full">
            {loadingConversations ? (
              // Loading state
              <div className="space-y-2 p-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-4 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes conversaciones</h3>
                <p className="text-sm text-gray-600">
                  Tus conversaciones aparecerán aquí cuando alguien te contacte
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conv.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                {conv.participantPhoto ? (
                  <img 
                    src={conv.participantPhoto}
                    alt={conv.participantName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = `w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium ${
                          (conv.unreadCount || 0) > 0 ? 'bg-blue-600' : 'bg-gray-400'
                        }`;
                        fallback.textContent = conv.participantName?.charAt(0) || 'U';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium ${
                    (conv.unreadCount || 0) > 0 ? 'bg-blue-600' : 'bg-gray-400'
                  }`}>
                    {conv.participantName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate">{conv.participantName}</h5>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage || 'Sin mensajes'}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs text-gray-500">{conv.lastMessageTime || ''}</span>
                  {(conv.unreadCount || 0) > 0 && (
                    <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-600 rounded-full">
                      <span className="text-[10px] text-white font-bold">{conv.unreadCount}</span>
                    </div>
                  )}
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Chat activo - Responsive */}
        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col w-full`}>
          {selectedConversation ? (
            <>
              {/* Header del chat - Con botón volver en mobile */}
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Botón volver - Solo mobile */}
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {(() => {
                    const conv = conversations.find(c => c.id === selectedConversation);
                    if (!conv) return null;
                    
                    return (
                      <>
                        {conv.participantPhoto ? (
                          <img 
                            src={conv.participantPhoto}
                            alt={conv.participantName}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base">
                            {conv.participantName?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                            {conv.participantName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {conv.participantEmail || 'Agente inmobiliario'}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* Mensajes - Responsive */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {loadingMessages ? (
                  // Loading state
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className="max-w-md h-12 bg-gray-200 rounded-lg animate-pulse w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  // Empty state
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mensajes</h3>
                    <p className="text-sm text-gray-600">Inicia la conversación enviando un mensaje</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-md px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                        msg.senderId === user?.id
                          ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input - Responsive */}
              <div className="p-3 sm:p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
                    placeholder="Escribe un mensaje..."
                    disabled={sending}
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
                <p className="text-gray-600">Elige una conversación para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
