/**
 * Lógica común para detectar si una propiedad es terreno/lote.
 * Usar en edit, new, FloorPlansStep, AmenitiesStep, CharacteristicsStep, etc.
 */

export type FormDataWithType = {
  type?: string | null;
  propertyType?: string | null;
  propertyTypeLabel?: string | null;
  [k: string]: unknown;
};

/** Obtiene el nombre del tipo desde formData (edit puede tener type, new puede tener type, backend a veces propertyType/propertyTypeName) */
export function getTypeNameFromFormData(formData: FormDataWithType | null | undefined): string {
  if (!formData) return '';
  const raw =
    formData.type ??
    formData.propertyType ??
    formData.propertyTypeLabel ??
    (formData as any).propertyTypeName ??
    '';
  return String(raw).trim().toLowerCase();
}

/** true si la propiedad es terreno, lote o loteo (misma regla en todo el módulo) */
export function isPropertyTypeLand(formData: FormDataWithType | null | undefined): boolean {
  const typeName = getTypeNameFromFormData(formData);
  return (
    typeName.includes('terreno') ||
    typeName.includes('lote') ||
    typeName.includes('loteo')
  );
}
