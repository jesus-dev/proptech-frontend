'use client';

import { useVisitForm } from '../hooks/useVisitForm';
import { HomeIcon, BuildingOfficeIcon, UserIcon, MapPinIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Visit } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface VisitFormProps {
  initialData?: Visit;
  initialDate?: string;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export default function VisitForm({ initialData, initialDate, onSubmitSuccess, onCancel }: VisitFormProps) {
  const {
    formData,
    errors,
    handleChange,
    handleReminderChange,
    addReminder,
    removeReminder,
    handleSubmit,
  } = useVisitForm(initialData, initialDate);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit(e);
    if (success) {
      onSubmitSuccess();
    }
  };

  return (
    <div className="mx-auto" style={{ width: '70%' }}>
      <div className="bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Nueva Visita</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitType">Tipo de Visita</Label>
              <Select
                value={formData.visitType}
                onValueChange={(value) => handleChange({ target: { name: 'visitType', value } } as any)}
              >
                <SelectTrigger className={errors.visitType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="property">Propiedad</SelectItem>
                  <SelectItem value="development">Desarrollo</SelectItem>
                  <SelectItem value="office">Oficina</SelectItem>
                </SelectContent>
              </Select>
              {errors.visitType && <p className="text-sm text-red-500">{errors.visitType}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de Inicio</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ? "border-red-500" : ""}
              />
              {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Hora de Fin</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                className={errors.endTime ? "border-red-500" : ""}
              />
              {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visitorName">Nombre del Visitante</Label>
              <Input
                id="visitorName"
                name="visitorName"
                value={formData.visitorName}
                onChange={handleChange}
                className={errors.visitorName ? "border-red-500" : ""}
              />
              {errors.visitorName && <p className="text-sm text-red-500">{errors.visitorName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Asignado a</Label>
              <Input
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className={errors.assignedTo ? "border-red-500" : ""}
              />
              {errors.assignedTo && <p className="text-sm text-red-500">{errors.assignedTo}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visitorPhone">Teléfono</Label>
              <Input
                id="visitorPhone"
                name="visitorPhone"
                value={formData.visitorPhone}
                onChange={handleChange}
                placeholder="+595 981 123-456"
                className={errors.visitorPhone ? "border-red-500" : ""}
              />
              {errors.visitorPhone && <p className="text-sm text-red-500">{errors.visitorPhone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitorEmail">Email</Label>
              <Input
                id="visitorEmail"
                name="visitorEmail"
                type="email"
                value={formData.visitorEmail}
                onChange={handleChange}
                className={errors.visitorEmail ? "border-red-500" : ""}
              />
              {errors.visitorEmail && <p className="text-sm text-red-500">{errors.visitorEmail}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange({ target: { name: 'status', value } } as any)}
            >
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="rescheduled">Reprogramada</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Recordatorios</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addReminder}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Recordatorio
              </Button>
            </div>
            <div className="space-y-2">
              {formData.reminders.map((reminder, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={reminder}
                    onChange={(e) => handleReminderChange(index, e.target.value)}
                    placeholder="Recordatorio"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeReminder(index)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Actualizar' : 'Crear'} Visita
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 