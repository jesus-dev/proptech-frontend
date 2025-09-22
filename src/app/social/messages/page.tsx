'use client';

import React, { useState } from 'react';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  const conversations = [
    {
      id: 1,
      name: 'María González',
      avatar: 'M',
      lastMessage: 'Hola, me interesa la propiedad...',
      lastMessageTime: '12:30',
      unread: true
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      avatar: 'C',
      lastMessage: '¿Tienes más fotos de la casa?',
      lastMessageTime: 'Ayer',
      unread: false
    },
    {
      id: 3,
      name: 'Ana Rodríguez',
      avatar: 'A',
      lastMessage: 'Perfecto, me gusta mucho',
      lastMessageTime: '2 días',
      unread: false
    }
  ];

  const messages = {
    1: [
      { text: 'Hola, me interesa la propiedad que publicaste en Las Mercedes. ¿Podrías darme más detalles?', sent: false },
      { text: '¡Hola María! Por supuesto, es una hermosa casa de 3 habitaciones con vista al río. ¿Te gustaría que te envíe más fotos?', sent: true },
      { text: '¡Perfecto! Sí, me encantaría ver más fotos. ¿Cuál es el precio?', sent: false }
    ],
    2: [
      { text: '¿Tienes más fotos de la casa?', sent: false },
      { text: 'Claro Carlos, te envío un enlace con la galería completa', sent: true }
    ],
    3: [
      { text: 'Perfecto, me gusta mucho la propiedad', sent: false },
      { text: '¡Excelente Ana! ¿Te gustaría agendar una visita?', sent: true }
    ]
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setNewMessage('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex h-[calc(100vh-200px)]">
        {/* Lista de conversaciones */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Mensajes</h2>
            <p className="text-sm text-gray-600">Tus conversaciones</p>
          </div>
          
          <div className="overflow-y-auto h-full">
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conv.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium ${
                  conv.unread ? 'bg-orange-500' : 'bg-gray-400'
                }`}>
                  {conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate">{conv.name}</h5>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
                  {conv.unread && (
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat activo */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                    {conversations.find(c => c.id === selectedConversation)?.avatar}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {conversations.find(c => c.id === selectedConversation)?.name}
                    </h3>
                    <p className="text-sm text-gray-600">En línea</p>
                  </div>
                </div>
              </div>
              
              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages[selectedConversation as keyof typeof messages]?.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md px-4 py-2 rounded-lg ${
                      msg.sent 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button 
                    onClick={sendMessage}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Enviar
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
