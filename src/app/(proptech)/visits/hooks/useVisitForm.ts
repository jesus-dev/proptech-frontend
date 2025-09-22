import { useState, useCallback } from "react";
import { Visit } from "../components/types";
import { visitService } from "../services/visitService";

export interface VisitFormData {
  id?: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: "pending" | "completed" | "cancelled" | "confirmed" | "rescheduled";
  assignedTo: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  visitType: "property" | "development" | "office";
  reminders: string[];
  developmentId?: string;
  propertyId?: string;
  notes?: string;
}

type FormErrors = { [K in keyof VisitFormData]?: string } & { submit?: string };

export const useVisitForm = (initialData?: Visit, initialDate?: string) => {
  const initialFormData: VisitFormData = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    date: initialData?.date || initialDate || "",
    startTime: (initialData as any)?.startTime || "",
    endTime: (initialData as any)?.endTime || "",
    location: (initialData as any)?.location || "",
    status: (initialData as any)?.status || "pending",
    assignedTo: (initialData as any)?.assignedTo || "",
    visitorName: initialData?.visitorName || "",
    visitorPhone: (initialData as any)?.visitorPhone || "",
    visitorEmail: (initialData as any)?.visitorEmail || "",
    visitType: initialData?.visitType || "property",
    reminders: (initialData as any)?.reminders || [],
    developmentId: (initialData as any)?.developmentId || undefined,
    propertyId: initialData?.propertyId || undefined,
    notes: initialData?.notes || "",
  };

  const [formData, setFormData] = useState<VisitFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, [initialFormData]);

  const validate = useCallback((fieldsToValidate?: (keyof VisitFormData)[]) => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const fields = fieldsToValidate || Object.keys(formData) as (keyof VisitFormData)[];

    fields.forEach(field => {
      switch (field) {
        case 'title':
          if (!formData.title.trim()) {
            newErrors.title = "El título es requerido.";
            isValid = false;
          }
          break;
        case 'description':
          if (!formData.description.trim()) {
            newErrors.description = "La descripción es requerida.";
            isValid = false;
          }
          break;
        case 'date':
          if (!formData.date) {
            newErrors.date = "La fecha es requerida.";
            isValid = false;
          }
          break;
        case 'startTime':
          if (!formData.startTime) {
            newErrors.startTime = "La hora de inicio es requerida.";
            isValid = false;
          }
          break;
        case 'endTime':
          if (!formData.endTime) {
            newErrors.endTime = "La hora de fin es requerida.";
            isValid = false;
          } else if (formData.startTime && formData.endTime <= formData.startTime) {
            newErrors.endTime = "La hora de fin debe ser posterior a la hora de inicio.";
            isValid = false;
          }
          break;
        case 'location':
          if (!formData.location.trim()) {
            newErrors.location = "La ubicación es requerida.";
            isValid = false;
          }
          break;
        case 'status':
          if (!formData.status) {
            newErrors.status = "El estado es requerido.";
            isValid = false;
          }
          break;
        case 'assignedTo':
          if (!formData.assignedTo.trim()) {
            newErrors.assignedTo = "La persona asignada es requerida.";
            isValid = false;
          }
          break;
        case 'visitorName':
          if (!formData.visitorName.trim()) {
            newErrors.visitorName = "El nombre del visitante es requerido.";
            isValid = false;
          }
          break;
        case 'visitorPhone':
          if (!formData.visitorPhone.trim()) {
            newErrors.visitorPhone = "El teléfono del visitante es requerido.";
            isValid = false;
          }
          break;
        case 'visitorEmail':
          if (!formData.visitorEmail.trim()) {
            newErrors.visitorEmail = "El email del visitante es requerido.";
            isValid = false;
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.visitorEmail)) {
            newErrors.visitorEmail = "El email no es válido.";
            isValid = false;
          }
          break;
        case 'visitType':
          if (!formData.visitType) {
            newErrors.visitType = "El tipo de visita es requerido.";
            isValid = false;
          }
          break;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined })); // Clear error on change
  }, []);

  const handleReminderChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newReminders = [...prev.reminders];
      newReminders[index] = value;
      return { ...prev, reminders: newReminders };
    });
  }, []);

  const addReminder = useCallback(() => {
    setFormData(prev => ({ ...prev, reminders: [...prev.reminders, ""] }));
  }, []);

  const removeReminder = useCallback((indexToRemove: number) => {
    setFormData(prev => ({ ...prev, reminders: prev.reminders.filter((_, index) => index !== indexToRemove) }));
  }, []);

  function normalizeDate(date: string): string {
    if (!date) return "";
    // Si ya está en formato YYYY-MM-DD, regresa igual
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Si viene en otro formato, intenta convertirlo
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return date;
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const allFieldsToValidate: (keyof VisitFormData)[] = [
      'title', 'description', 'date', 'startTime', 'endTime', 'location', 'status', 'assignedTo', 'visitorName', 'visitorPhone', 'visitorEmail', 'visitType'
    ];

    if (!validate(allFieldsToValidate)) {
      console.error("Form has validation errors.", errors);
      return false;
    }

    try {
      const normalizedFormData = {
        ...formData,
        date: normalizeDate(formData.date),
      };
      if (initialData?.id) {
        await visitService.updateVisit(initialData.id, normalizedFormData as any);
      } else {
        await visitService.createVisit(normalizedFormData as any);
      }
      resetForm();
      return true;
    } catch (err) {
      console.error("Error submitting form:", err);
      setErrors(prev => ({
        ...prev,
        submit: "Error al guardar la visita.",
      }));
      return false;
    }
  }, [formData, initialData, validate, resetForm]);

  return {
    formData,
    errors,
    handleChange,
    handleReminderChange,
    addReminder,
    removeReminder,
    handleSubmit,
    resetForm,
    validate,
  };
}; 