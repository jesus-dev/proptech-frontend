"use client";
import Image from 'next/image';
import React from "react";
import { PropertyFormData, PropertyFormErrors } from "../../hooks/usePropertyForm";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface MediaStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  removeFeaturedImage: () => void;
  errors: PropertyFormErrors;
}

export default function MediaStep({ 
  formData, 
  handleChange, 
  handleFileChange, 
  removeImage, 
  removeFeaturedImage, 
  errors 
}: MediaStepProps) {
  return (
    <div className="space-y-6">
      {/* Featured Image */}
      <div>
        <label
          htmlFor="featuredImage"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Imagen Destacada
        </label>
        
        {formData.featuredImage ? (
          <div className="relative group">
            <img
              src={formData.featuredImage}
              alt="Imagen destacada"
              className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={removeFeaturedImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-brand-500 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Haz clic para subir una imagen destacada
            </p>
            <input
              type="file"
              id="featuredImage"
              name="featuredImage"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="featuredImage"
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600 cursor-pointer"
            >
              Seleccionar Imagen
            </label>
          </div>
        )}
        
        {errors.featuredImage && (
          <p className="mt-1 text-sm text-red-500">{errors.featuredImage}</p>
        )}
      </div>

      {/* Gallery Images */}
      <div>
        <label
          htmlFor="images"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Galería de Imágenes
        </label>
        
        {/* Image Preview Grid */}
        {formData.images && formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-brand-500 transition-colors">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Arrastra imágenes aquí o haz clic para seleccionar
          </p>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="images"
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-500 hover:bg-brand-600 cursor-pointer"
          >
            Seleccionar Imágenes
          </label>
        </div>
        
        {errors.images && (
          <p className="mt-1 text-sm text-red-500">{errors.images}</p>
        )}
      </div>

      {/* Video URL */}
      <div>
        <label
          htmlFor="videoUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          URL del Video
        </label>
        <input
          type="url"
          id="videoUrl"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="https://www.youtube.com/watch?v=..."
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.videoUrl ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.videoUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.videoUrl}</p>
        )}
      </div>

      {/* Virtual Tour URL */}
      <div>
        <label
          htmlFor="virtualTourUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          URL del Tour Virtual
        </label>
        <input
          type="url"
          id="virtualTourUrl"
          name="virtualTourUrl"
          value={formData.virtualTourUrl}
          onChange={handleChange}
          placeholder="https://..."
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.virtualTourUrl ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.virtualTourUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.virtualTourUrl}</p>
        )}
      </div>

      {/* Private Files */}
      <div>
        <label
          htmlFor="privateFiles"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Archivos Privados
        </label>
        <input
          type="file"
          id="privateFiles"
          name="privateFiles"
          multiple
          onChange={handleFileChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.privateFiles ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.privateFiles && (
          <p className="mt-1 text-sm text-red-500">{errors.privateFiles}</p>
        )}
      </div>
    </div>
  );
} 