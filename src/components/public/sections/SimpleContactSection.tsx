// @ts-nocheck
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline";

const SimpleContactSection = () => {
  return (
    <section id="contact" className="py-20 bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 relative overflow-hidden w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      {/* Patrón de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            ¿Necesitas <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ayuda?</span>
          </h2>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
            Nuestro equipo de expertos está disponible 24/7 para ayudarte a encontrar la propiedad perfecta en Paraguay
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: PhoneIcon,
              title: "Teléfono",
              subtitle: "Llámanos ahora",
              value: "+595 985 940797",
              action: "tel:+595985940797",
              color: "from-emerald-500 to-teal-600"
            },
            {
              icon: EnvelopeIcon,
              title: "Email",
              subtitle: "Escríbenos",
              value: "info@proptech.com.py",
              action: "mailto:info@proptech.com.py",
              color: "from-blue-500 to-cyan-600"
            },
            {
              icon: MapPinIcon,
              title: "Ubicación",
              subtitle: "Visítanos",
              value: "Ciudad del Este, Paraguay",
              action: "#",
              color: "from-purple-500 to-indigo-600"
            }
          ].map((contact, index) => (
            <motion.div
              key={contact.title}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className={`w-16 h-16 bg-gradient-to-r ${contact.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <contact.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {contact.title}
                </h3>
                <p className="text-cyan-200 text-sm mb-4 font-medium">
                  {contact.subtitle}
                </p>
                
                <a
                  href={contact.action}
                  className="inline-block text-lg font-semibold text-cyan-300 hover:text-white transition-colors duration-300 hover:underline"
                >
                  {contact.value}
                </a>
                
                {/* Efecto hover brillante */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105">
            Agenda una Consulta Gratuita
          </button>
          <p className="text-cyan-200 text-sm mt-4">
            Respuesta garantizada en menos de 2 horas
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SimpleContactSection;


