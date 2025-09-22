"use client";
import Image from 'next/image';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { DevelopmentFormData } from "../../hooks/useDevelopmentForm";
interface MultimediaStepProps {
  formData: DevelopmentFormData;
  errors: Partial<Record<keyof DevelopmentFormData, string>>;
  addImages: (newFiles: File[]) => void;
  removeImage: (index: number) => void;
}

export default function MultimediaStep({ formData, errors, addImages, removeImage }: MultimediaStepProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addImages(acceptedFiles);
    },
    [addImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Imágenes
        </label>
        <div
          {...getRootProps()}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
            isDragActive ? "border-brand-500" : ""
          } ${errors.images ? "border-red-500" : ""}`}
        >
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                <span>Subir archivos</span>
                <input {...getInputProps()} className="sr-only" />
              </label>
              <p className="pl-1">o arrastrar y soltar</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF hasta 10MB
            </p>
          </div>
        </div>
        {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
      </div>

      {formData.images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {formData.images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Preview ${index + 1}`}
                className="h-24 w-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 