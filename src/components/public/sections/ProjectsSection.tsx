"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProjectsSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Proyectos Inmobiliarios</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Esta sección se alimentará desde el backend cuando estén disponibles los proyectos.
          </p>
        </motion.div>

        <div className="text-center py-20">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No hay proyectos disponibles</h3>
          <p className="text-gray-600 mb-8">Aún no hay proyectos publicados para mostrar.</p>
          <Link
            href="/propiedades"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Ver propiedades
          </Link>
        </div>
      </div>
    </section>
  );
}


