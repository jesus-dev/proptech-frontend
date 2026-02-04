"use client";
import React, { useState, useEffect } from "react";
import { Square3Stack3DIcon, HomeIcon, TrashIcon, PlusIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { getFloorPlans, uploadFloorPlanImage, saveFloorPlans, getFloorPlanImageDisplayUrl } from '../../services/floorPlanService';
import { useToast } from "@/components/ui/use-toast";
import { isPropertyTypeLand } from "../../utils/propertyTypeUtils";

export type FloorPlanForm = {
  id?: number;
  title: string;
  bedrooms: number | undefined;
  bathrooms: number | undefined;
  price: number | string | undefined;
  priceSuffix: string;
  size: number | string | undefined;
  image?: string | null;
  description: string;
};

interface FloorPlansStepProps {
  propertyId?: string;
  formData?: { type?: string; propertyType?: string; [k: string]: unknown };
  initialPlans?: FloorPlanForm[];
  onDataChange?: (plans: FloorPlanForm[]) => void;
}

const toNum = (v: number | string | null | undefined): number | null => {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isNaN(n) ? null : n;
};

export default function FloorPlansStep({ propertyId, formData, initialPlans, onDataChange }: FloorPlansStepProps) {
  const { toast } = useToast();
  const [plans, setPlans] = useState<FloorPlanForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});

  // Lógica común: mismo criterio que AmenitiesStep y edit/new
  const isLand = isPropertyTypeLand(formData);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    if (isLand) {
      setPlans([]);
      onDataChange?.([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = propertyId
        ? await getFloorPlans(propertyId).then(arr => arr.map(p => ({
            id: p.id,
            title: p.title || '',
            bedrooms: p.bedrooms ?? undefined,
            bathrooms: p.bathrooms ?? undefined,
            price: p.price ?? undefined,
            priceSuffix: p.priceSuffix || '',
            size: p.size ?? undefined,
            image: p.image,
            description: p.description || ''
          })))
        : (initialPlans ?? []);
      setPlans(data);
      onDataChange?.(data);
    } catch (err) {
      console.error('Error loading floor plans:', err);
      const empty: FloorPlanForm[] = [];
      setPlans(empty);
      onDataChange?.(empty);
    } finally {
      setLoading(false);
    }
  };

  const syncAndSave = async (updated: FloorPlanForm[]) => {
    setPlans(updated);
    onDataChange?.(updated);
    if (propertyId) {
      try {
        await saveFloorPlans(propertyId, updated);
      } catch (e: any) {
        console.error('Error saving floor plans:', e);
        toast({
          variant: 'destructive',
          title: 'Error al guardar planos',
          description: e?.response?.data?.message || e?.message || 'No se pudieron guardar los planos.',
        });
      }
    }
  };

  const formatInt = (v: number | null | undefined) => (v == null ? '' : String(v));
  const formatDec = (v: number | string | null | undefined) => {
    if (v == null || v === '') return '';
    if (typeof v === 'string') return v;
    const s = String(v);
    return s.includes('.') ? s.replace('.', ',') : s;
  };

  const handleChange = (idx: number, field: keyof FloorPlanForm, value: any) => {
    const u = [...plans];
    u[idx] = { ...u[idx], [field]: value };
    syncAndSave(u);
  };

  const handleNumeric = (idx: number, field: keyof FloorPlanForm, raw: string, decimal: boolean) => {
    const s = raw.replace(/[^\d.,]/g, '');
    if (decimal && /[.,]$/.test(s)) {
      const u = [...plans];
      u[idx] = { ...u[idx], [field]: s };
      syncAndSave(u);
      return;
    }
    const parts = s.split(/[.,]/);
    const numStr = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : s.replace(/[.,]/g, '');
    const parsed = numStr === '' ? undefined : (decimal ? parseFloat(numStr) : parseInt(numStr, 10));
    const u = [...plans];
    u[idx] = { ...u[idx], [field]: Number.isNaN(parsed as number) ? undefined : parsed };
    syncAndSave(u);
  };

  const handleImage = async (idx: number, file: File | null) => {
    if (!file) return;
    setUploading(p => ({ ...p, [idx]: true }));
    try {
      let url = '';
      if (propertyId) {
        url = await uploadFloorPlanImage(propertyId, file);
      } else {
        url = URL.createObjectURL(file);
      }
      handleChange(idx, 'image', url);
    } catch (e) {
      console.error('Error uploading image:', e);
    } finally {
      setUploading(p => ({ ...p, [idx]: false }));
    }
  };

  const handleAdd = () => {
    syncAndSave([
      ...plans,
      { title: '', bedrooms: undefined, bathrooms: undefined, price: undefined, priceSuffix: '', size: undefined, image: undefined, description: '' }
    ]);
  };

  const handleRemove = async (idx: number) => {
    const u = plans.filter((_, i) => i !== idx);
    syncAndSave(u);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  // Para terrenos no mostramos planos de planta, solo mensaje (igual que AmenitiesStep)
  if (isLand) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-base font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          Planos de planta en terrenos
        </h3>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Para propiedades de tipo <strong>terreno / lote</strong> no se gestionan planos de planta.
          Los planos de planta aplican a casas, departamentos y propiedades con distribución interior.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Square3Stack3DIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Planos de Planta</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Agrega uno o más planos de planta para mostrar las opciones de distribución
        </p>
      </div>

      {plans.map((plan, idx) => (
        <div key={idx} className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plano {idx + 1}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configuración del plano</p>
              </div>
            </div>
            <button type="button" onClick={() => handleRemove(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                <input type="text" value={plan.title} onChange={e => handleChange(idx, 'title', e.target.value)} placeholder="Ej: Plano tipo A" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dormitorios</label>
                <input type="text" inputMode="numeric" value={formatInt(plan.bedrooms)} onChange={e => handleNumeric(idx, 'bedrooms', e.target.value, false)} placeholder="0" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Baños</label>
                <input type="text" inputMode="numeric" value={formatInt(plan.bathrooms)} onChange={e => handleNumeric(idx, 'bathrooms', e.target.value, false)} placeholder="0" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio</label>
                <input type="text" inputMode="decimal" value={formatDec(plan.price)} onChange={e => handleNumeric(idx, 'price', e.target.value, true)} placeholder="0" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sufijo precio</label>
                <input type="text" value={plan.priceSuffix} onChange={e => handleChange(idx, 'priceSuffix', e.target.value)} placeholder="/mes, /m²" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tamaño (m²)</label>
                <input type="text" inputMode="decimal" value={formatDec(plan.size)} onChange={e => handleNumeric(idx, 'size', e.target.value, true)} placeholder="Ej: 150,5" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen</label>
                <input type="file" accept="image/*" onChange={e => handleImage(idx, e.target.files?.[0] || null)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                {plan.image && (
                  <div className="mt-2">
                    <img src={getFloorPlanImageDisplayUrl(plan.image)} alt={`Plano ${idx + 1}`} className="w-32 h-32 object-cover rounded-lg border" />
                    {uploading[idx] && <span className="text-sm text-gray-500">Subiendo...</span>}
                  </div>
                )}
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <textarea value={plan.description} onChange={e => handleChange(idx, 'description', e.target.value)} rows={3} placeholder="Descripción del plano..." className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="text-center">
        <button type="button" onClick={handleAdd} className="inline-flex items-center gap-2 px-6 py-4 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-semibold">
          <PlusIcon className="w-5 h-5" />
          Agregar Plano
        </button>
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Square3Stack3DIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay planos. Haz clic en Agregar Plano para empezar.</p>
        </div>
      )}
    </div>
  );
}
