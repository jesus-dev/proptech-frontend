"use client";

import React, { useState } from "react";
import { X, Upload, Image as ImageIcon, Loader2, GripVertical } from "lucide-react";
import { processImageFiles, isHeicFile } from "@/lib/image-utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const MAX_DEFAULT = 5;

export type PostMultimediaItem = { id: string; url: string; file?: File };

interface PostMultimediaStepCreateProps {
  mode?: "create";
  files: File[];
  previewUrls: string[];
  maxCount?: number;
  onFilesChange: (files: File[], previewUrls: string[]) => void;
  getFullUrl?: (path: string) => string;
  className?: string;
}

interface PostMultimediaStepEditProps {
  mode: "edit";
  /** Lista unificada: existentes (url = path servidor, sin file) + nuevos (url = blob, file) */
  items: PostMultimediaItem[];
  maxCount?: number;
  getFullUrl: (path: string) => string;
  onItemsChange: (items: PostMultimediaItem[]) => void;
  className?: string;
}

type PostMultimediaStepProps = PostMultimediaStepCreateProps | PostMultimediaStepEditProps;

function SortablePostImage({
  id,
  previewUrl,
  file,
  index,
  onRemove,
  getFullUrl,
}: {
  id: string;
  previewUrl: string;
  file?: File;
  index: number;
  onRemove: () => void;
  getFullUrl?: (path: string) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const [loaded, setLoaded] = useState(false);
  const isHeic = file ? isHeicFile(file) : false;
  const displayUrl = getFullUrl && !previewUrl.startsWith("blob:") ? getFullUrl(previewUrl) : previewUrl;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl overflow-hidden border-2 shadow-md transition-all duration-200 ${
        isDragging
          ? "border-blue-400 dark:border-blue-500 shadow-lg scale-[1.02] z-30"
          : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg"
      }`}
    >
      {/* Número de orden */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
        <div
          {...attributes}
          {...listeners}
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-700 dark:text-gray-200 rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing shadow-md border border-gray-200/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700"
          title="Arrastra para reordenar"
        >
          <GripVertical className="h-4 w-4 shrink-0" aria-hidden />
        </div>
        <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-md px-2 py-1 min-w-[1.25rem] text-center">
          {index + 1}
        </span>
      </div>

      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
        {isHeic ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-gray-500 dark:text-gray-400 text-xs">
            <ImageIcon className="w-10 h-10 mb-2 opacity-70 text-blue-500/70" />
            <span className="font-medium">HEIC</span>
            <span className="text-[10px] mt-0.5">→ JPG al publicar</span>
          </div>
        ) : (
          <>
            {/* Skeleton mientras carga */}
            {!loaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            <img
              src={displayUrl}
              alt={`Preview ${index + 1}`}
              className={`relative w-full h-full object-cover transition-all duration-300 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
              onLoad={() => setLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onRemove();
        }}
        className="absolute top-2 right-2 w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 hover:scale-110 border-2 border-white dark:border-gray-800"
        title="Eliminar"
      >
        <X className="h-4 w-4 stroke-[2.5]" />
      </button>
    </div>
  );
}

export default function PostMultimediaStep(props: PostMultimediaStepProps) {
  const { maxCount = MAX_DEFAULT, className = "" } = props;
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isEdit = props.mode === "edit";
  const items = isEdit ? props.items : props.files.map((file, i) => ({ id: `post-img-${i}`, url: props.previewUrls[i] ?? "", file }));
  const count = items.length;
  const canAdd = count < maxCount;

  const handleFileSelect = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const spaceLeft = maxCount - count;
    if (spaceLeft <= 0) return;

    const toProcess = Array.from(fileList).slice(0, spaceLeft);
    const heicCount = toProcess.filter((f) => isHeicFile(f)).length;
    if (heicCount > 0) console.log(`🔄 Convirtiendo ${heicCount} archivo(s) HEIC a JPG...`);

    setUploading(true);
    try {
      const processed = await processImageFiles(toProcess);
      const newItems: PostMultimediaItem[] = processed.map((f, i) => ({
        id: `new-${Date.now()}-${i}`,
        url: URL.createObjectURL(f),
        file: f,
      }));
      if (isEdit) {
        props.onItemsChange([...props.items, ...newItems]);
      } else {
        props.onFilesChange([...props.files, ...processed], [...props.previewUrls, ...newItems.map((x) => x.url)]);
      }
    } catch (err) {
      console.error("Error procesando imágenes:", err);
      alert("Error al procesar las imágenes. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.target.value = "";
  };

  const remove = (index: number) => {
    const item = items[index];
    if (item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
    if (isEdit) {
      props.onItemsChange(items.filter((_, i) => i !== index));
    } else {
      const newFiles = props.files.filter((_, i) => i !== index);
      const newPreviews = props.previewUrls.filter((_, i) => i !== index);
      props.onFilesChange(newFiles, newPreviews);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => it.id === active.id);
    const newIndex = items.findIndex((it) => it.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(items, oldIndex, newIndex);
    if (isEdit) {
      props.onItemsChange(reordered);
    } else {
      const newFiles = reordered.map((it) => it.file!);
      const newPreviews = reordered.map((it) => it.url);
      props.onFilesChange(newFiles, newPreviews);
    }
  };

  const getFullUrl = isEdit ? props.getFullUrl : props.getFullUrl;
  const ids = items.map((it) => it.id);

  return (
    <div className={className}>
      {uploading && (
        <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center shrink-0">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Procesando imágenes</p>
            <p className="text-xs text-blue-600 dark:text-blue-300">Convirtiendo y preparando…</p>
          </div>
        </div>
      )}

      {count > 0 && (
        <div className="mb-3 flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
            {count} de {maxCount}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Arrastra para reordenar</span>
        </div>
      )}

      {count > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {items.map((item, index) => (
                <SortablePostImage
                  key={item.id}
                  id={item.id}
                  previewUrl={item.url}
                  file={item.file}
                  index={index}
                  onRemove={() => remove(index)}
                  getFullUrl={getFullUrl}
                />
              ))}
              {canAdd && (
                <label
                  className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 min-h-[100px] ${
                    isDragActive
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 scale-[1.02]"
                      : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50/50 dark:hover:from-gray-700/50 dark:hover:to-blue-900/10"
                  } ${uploading ? "pointer-events-none opacity-60" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragActive(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragActive(false);
                    handleFileSelect(e.dataTransfer.files);
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-2">
                    <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 text-center px-2">
                    {count === 0 ? "Agregar fotos" : "Agregar más"}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">o arrastra aquí</span>
                  <input
                    type="file"
                    accept="image/*,.heic,.heif,.hif"
                    multiple
                    className="sr-only"
                    onChange={handleInputChange}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
            isDragActive
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 scale-[1.01]"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-br hover:from-gray-50/80 hover:to-blue-50/30 dark:hover:from-gray-800/50 dark:hover:to-blue-900/10"
          } ${uploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center mb-4 shadow-inner">
            <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {uploading ? "Procesando imágenes..." : "Arrastra fotos aquí o haz clic para elegir"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">PNG, JPG, HEIC. Máx. {maxCount} fotos.</p>
          <input
            type="file"
            accept="image/*,.heic,.heif,.hif"
            multiple
            className="sr-only"
            id="post-multimedia-input"
            onChange={handleInputChange}
            disabled={uploading}
          />
          <label
            htmlFor="post-multimedia-input"
            className={`mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 ${
              uploading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Procesando..." : "Seleccionar imágenes"}
          </label>
        </div>
      )}
    </div>
  );
}
