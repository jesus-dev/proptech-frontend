"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, ArrowLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ContractTemplate, TemplateFormData, TemplateVariable } from "../../types";
import { templateService } from "../../services/templateService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import dynamic from "next/dynamic";

// Importar el editor de forma dinámica para evitar problemas con SSR
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <p>Cargando editor...</p>,
});

export default function TemplateEditPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    description: "",
    type: "SALE",
    content: "",
    variables: [],
    isDefault: false,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const templateId = params?.id as string;

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const data = await templateService.getTemplateById(templateId);
      if (data) {
        setTemplate(data);
        setFormData({
          name: data.name,
          description: data.description,
          type: data.type,
          content: data.content,
          variables: data.variables || [],
          isDefault: data.isDefault,
          isActive: data.isActive,
        });
      } else {
        setError("Plantilla no encontrada");
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      setError("Error al cargar la plantilla");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TemplateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleVariableChange = (index: number, field: keyof TemplateVariable, value: any) => {
    const updatedVariables = [...formData.variables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    setFormData(prev => ({ ...prev, variables: updatedVariables }));
  };

  const addVariable = () => {
    const newVariable: TemplateVariable = {
      name: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      description: "",
    };
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, newVariable],
    }));
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (!formData.content.trim()) {
      newErrors.content = "El contenido es requerido";
    }

    // Validar variables
    formData.variables.forEach((variable, index) => {
      if (!variable.name.trim()) {
        newErrors[`variable_${index}_name`] = "El nombre de la variable es requerido";
      }
      if (!variable.label.trim()) {
        newErrors[`variable_${index}_label`] = "La etiqueta de la variable es requerida";
      }
      if (variable.type === "select" && (!variable.options || variable.options.length === 0)) {
        newErrors[`variable_${index}_options`] = "Debe agregar al menos una opción";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setSaving(true);
        await templateService.updateTemplate(templateId, formData);
        router.push("/contracts/templates");
      } catch (error) {
        console.error("Error updating template:", error);
        setError("Error al actualizar la plantilla");
      } finally {
        setSaving(false);
      }
    }
  };

  const getSampleContent = (type: string) => {
    switch (type) {
      case "SALE":
        return `CONTRATO DE COMPRAVENTA DE INMUEBLE

Entre los suscritos, a saber:

VENDEDOR: {{vendedor_nombre}}, identificado con {{vendedor_documento}}, de nacionalidad {{vendedor_nacionalidad}}, mayor de edad, domiciliado en {{vendedor_direccion}}, a quien en adelante se le denominará "EL VENDEDOR";

COMPRADOR: {{comprador_nombre}}, identificado con {{comprador_documento}}, de nacionalidad {{comprador_nacionalidad}}, mayor de edad, domiciliado en {{comprador_direccion}}, a quien en adelante se le denominará "EL COMPRADOR";

Se ha convenido celebrar el presente contrato de compraventa, que se regirá por las siguientes cláusulas:

PRIMERA: OBJETO DEL CONTRATO
El VENDEDOR transfiere al COMPRADOR la propiedad del inmueble ubicado en {{inmueble_direccion}}, identificado con matrícula inmobiliaria {{matricula_inmobiliaria}}.

SEGUNDA: PRECIO Y FORMA DE PAGO
El precio de venta es de {{precio_venta}} ({{precio_letras}}), que será cancelado de la siguiente forma:
- Entrada: {{entrada}}
- Saldo: {{saldo}} en {{plazo_pago}} cuotas de {{valor_cuota}} cada una.

TERCERA: ENTREGA DEL INMUEBLE
La entrega del inmueble se realizará el día {{fecha_entrega}}.

CUARTA: GASTOS
Los gastos de escrituración y registro correrán por cuenta del COMPRADOR.

En fe de lo cual se firma el presente contrato en {{lugar_firma}} el día {{fecha_firma}}.

VENDEDOR: _________________
COMPRADOR: _________________`;

      case "RENT":
        return `CONTRATO DE ARRENDAMIENTO

Entre los suscritos, a saber:

ARRENDADOR: {{arrendador_nombre}}, identificado con {{arrendador_documento}}, domiciliado en {{arrendador_direccion}}, a quien en adelante se le denominará "EL ARRENDADOR";

ARRENDATARIO: {{arrendatario_nombre}}, identificado con {{arrendatario_documento}}, domiciliado en {{arrendatario_direccion}}, a quien en adelante se le denominará "EL ARRENDATARIO";

Se ha convenido celebrar el presente contrato de arrendamiento, que se regirá por las siguientes cláusulas:

PRIMERA: OBJETO DEL CONTRATO
El ARRENDADOR cede en arrendamiento al ARRENDATARIO el inmueble ubicado en {{inmueble_direccion}}, por el término de {{plazo_arrendamiento}} meses.

SEGUNDA: CANON DE ARRENDAMIENTO
El canon de arrendamiento mensual es de {{canon_mensual}} ({{canon_letras}}), que deberá ser cancelado dentro de los primeros {{dias_pago}} días de cada mes.

TERCERA: DEPÓSITO DE GARANTÍA
El ARRENDATARIO consigna como depósito de garantía la suma de {{deposito_garantia}} ({{deposito_letras}}).

CUARTA: OBLIGACIONES DEL ARRENDATARIO
- Pagar puntualmente el canon de arrendamiento
- Mantener el inmueble en buen estado
- No subarrendar sin autorización escrita

En fe de lo cual se firma el presente contrato en {{lugar_firma}} el día {{fecha_firma}}.

ARRENDADOR: _________________
ARRENDATARIO: _________________`;

      case "BROKERAGE":
        return `CONTRATO DE CORRETAJE INMOBILIARIO

Entre los suscritos, a saber:

PROPIETARIO: {{propietario_nombre}}, identificado con {{propietario_documento}}, domiciliado en {{propietario_direccion}}, a quien en adelante se le denominará "EL PROPIETARIO";

CORREDOR: {{corredor_nombre}}, identificado con {{corredor_documento}}, domiciliado en {{corredor_direccion}}, a quien en adelante se le denominará "EL CORREDOR";

Se ha convenido celebrar el presente contrato de corretaje inmobiliario, que se regirá por las siguientes cláusulas:

PRIMERA: OBJETO DEL CONTRATO
El PROPIETARIO encomienda al CORREDOR la gestión de {{tipo_operacion}} del inmueble ubicado en {{inmueble_direccion}}, identificado con matrícula inmobiliaria {{matricula_inmobiliaria}}.

SEGUNDA: COMISIÓN
El CORREDOR tendrá derecho a una comisión del {{porcentaje_comision}}% sobre el valor de la operación, que será pagada al momento de la firma del contrato definitivo.

TERCERA: DURACIÓN
El presente contrato tendrá una duración de {{duracion_contrato}} meses, contados desde la fecha de firma.

CUARTA: OBLIGACIONES DEL CORREDOR
- Promocionar el inmueble
- Gestionar visitas de potenciales clientes
- Negociar las mejores condiciones para el PROPIETARIO

En fe de lo cual se firma el presente contrato en {{lugar_firma}} el día {{fecha_firma}}.

PROPIETARIO: _________________
CORREDOR: _________________`;

      default:
        return "";
    }
  };

  const handleBack = () => {
    router.push("/contracts/templates");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "Plantilla no encontrada"}
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700"
          >
            <ArrowLeftIcon className="w-6 h-6 mr-2" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-6 h-6 mr-2" />
            Volver a Plantillas
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Editar Plantilla: {template.name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Modifica los detalles y contenido de la plantilla
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                template.type === "SALE" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                template.type === "RENT" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" :
                "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
              }`}>
                {template.type === "SALE" ? "Venta" : 
                 template.type === "RENT" ? "Alquiler" : "Corretaje"}
              </span>
              {template.isDefault && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  Predeterminada
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Información Básica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la plantilla *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ej: Contrato de venta estándar"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de contrato *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="SALE">Venta</option>
                  <option value="RENT">Alquiler</option>
                  <option value="BROKERAGE">Corretaje</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe el propósito y características de esta plantilla"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>

          {/* Variables */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Variables del Contrato
              </h2>
              <button
                type="button"
                onClick={addVariable}
                className="inline-flex items-center px-3 py-1 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                <PlusIcon className="w-6 h-6 mr-1" />
                Agregar Variable
              </button>
            </div>

            {formData.variables.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No hay variables definidas</p>
                <p className="text-sm">Agrega variables para personalizar el contrato</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.variables.map((variable, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Variable {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeVariable(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Nombre de la variable *
                        </label>
                        <input
                          type="text"
                          value={variable.name}
                          onChange={(e) => handleVariableChange(index, "name", e.target.value)}
                          className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors[`variable_${index}_name`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Ej: vendedor_nombre"
                        />
                        {errors[`variable_${index}_name`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`variable_${index}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Etiqueta *
                        </label>
                        <input
                          type="text"
                          value={variable.label}
                          onChange={(e) => handleVariableChange(index, "label", e.target.value)}
                          className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors[`variable_${index}_label`] ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Ej: Nombre del vendedor"
                        />
                        {errors[`variable_${index}_label`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`variable_${index}_label`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Tipo
                        </label>
                        <select
                          value={variable.type}
                          onChange={(e) => handleVariableChange(index, "type", e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="date">Fecha</option>
                          <option value="select">Selección</option>
                          <option value="textarea">Área de texto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Requerido
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={variable.required}
                            onChange={(e) => handleVariableChange(index, "required", e.target.checked)}
                            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">Sí</span>
                        </div>
                      </div>

                      {variable.type === "select" && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Opciones (una por línea)
                          </label>
                          <textarea
                            value={variable.options?.join("\n") || ""}
                            onChange={(e) => handleVariableChange(index, "options", e.target.value.split("\n").filter(Boolean))}
                            rows={3}
                            className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors[`variable_${index}_options`] ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
                          />
                          {errors[`variable_${index}_options`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`variable_${index}_options`]}</p>
                          )}
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={variable.placeholder || ""}
                          onChange={(e) => handleVariableChange(index, "placeholder", e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Texto de ayuda para el usuario"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contenido del contrato */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Contenido del Contrato
              </h2>
              <button
                type="button"
                onClick={() => handleInputChange("content", getSampleContent(formData.type))}
                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Cargar plantilla de ejemplo
              </button>
            </div>
            <Editor
              value={formData.content}
              onChange={(value) => handleInputChange("content", value)}
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Usa dobles llaves para insertar variables: {'{{nombre_variable}}'}
            </p>
          </div>

          {/* Opciones */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Opciones
            </h2>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => handleInputChange("isDefault", e.target.checked)}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Plantilla predeterminada
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Activa
                </label>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 