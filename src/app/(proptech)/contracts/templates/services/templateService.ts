import { ContractTemplate, TemplateFormData } from "../types";
import { templateApi } from "../../../../../lib/api";
import { sampleTemplates } from "../data/sampleTemplates";

// Almacenamiento local temporal para plantillas creadas/editadas
const localTemplates: ContractTemplate[] = [...sampleTemplates];

export const templateService = {
  async getAllTemplates(): Promise<ContractTemplate[]> {
    try {
      const response = await templateApi.getAll();
      const data = response.data;
      const templates = Array.isArray(data) ? data : (data?.content || []);
      // Convertir IDs de number a string para compatibilidad
      return templates.map((template: any) => ({
        ...template,
        id: template.id?.toString() || template.id
      }));
    } catch (error) {
      return localTemplates;
    }
  },

  async getTemplateById(id: string): Promise<ContractTemplate | undefined> {
    try {
      const response = await templateApi.getById(id);
      // Convertir el ID de number a string para compatibilidad
      if (response.data) {
        return {
          ...response.data,
          id: response.data.id?.toString() || id
        };
      }
      return response.data;
    } catch (error) {
      return localTemplates.find(t => t.id === id);
    }
  },

  async createTemplate(templateData: TemplateFormData): Promise<ContractTemplate> {
    try {
      const response = await templateApi.create(templateData);
      // Convertir el ID de number a string para compatibilidad
      if (response.data) {
        return {
          ...response.data,
          id: response.data.id?.toString() || response.data.id
        };
      }
      return response.data;
    } catch (error) {
      const newTemplate: ContractTemplate = {
        id: Date.now().toString(),
        name: templateData.name,
        description: templateData.description,
        type: templateData.type,
        content: templateData.content,
        variables: templateData.variables,
        isDefault: templateData.isDefault,
        isActive: templateData.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localTemplates.push(newTemplate);
      return newTemplate;
    }
  },

  async updateTemplate(id: string, templateData: Partial<TemplateFormData>): Promise<ContractTemplate | undefined> {
    try {
      const response = await templateApi.update(id, templateData);
      return response.data;
    } catch (error) {
      const index = localTemplates.findIndex(t => t.id === id);
      if (index === -1) return undefined;
      
      localTemplates[index] = {
        ...localTemplates[index],
        ...templateData,
        updatedAt: new Date().toISOString(),
      };
      return localTemplates[index];
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      await templateApi.delete(id);
      return true;
    } catch (error) {
      const index = localTemplates.findIndex(t => t.id === id);
      if (index === -1) return false;
      
      localTemplates.splice(index, 1);
      return true;
    }
  },

  async getTemplatesByType(type: string): Promise<ContractTemplate[]> {
    try {
      const response = await templateApi.getAll({ type });
      const data = response.data;
      const templates = Array.isArray(data) ? data : (data?.content || []);
      return templates;
    } catch (error) {
      return localTemplates.filter(t => t.type === type);
    }
  },

  async getDefaultTemplate(type: string): Promise<ContractTemplate | undefined> {
    try {
      const response = await templateApi.getAll({ type, isDefault: true });
      const data = response.data;
      const templates = Array.isArray(data) ? data : (data?.content || []);
      return templates[0];
    } catch (error) {
      return localTemplates.find(t => t.type === type && t.isDefault);
    }
  },

  async setDefaultTemplate(id: string): Promise<ContractTemplate | undefined> {
    try {
      const response = await templateApi.update(id, { isDefault: true });
      return response.data;
    } catch (error) {
      const index = localTemplates.findIndex(t => t.id === id);
      if (index === -1) return undefined;
      
      // Reset all templates of the same type to not default
      const template = localTemplates[index];
      localTemplates.forEach(t => {
        if (t.type === template.type) {
          t.isDefault = false;
        }
      });
      
      // Set the selected template as default
      localTemplates[index] = {
        ...localTemplates[index],
        isDefault: true,
        updatedAt: new Date().toISOString(),
      };
      
      return localTemplates[index];
    }
  },

  async generateContractFromTemplate(templateId: string, data: Record<string, string>): Promise<string> {
    try {
      const response = await templateApi.generateContract(templateId, data);
      return response.data || '';
    } catch (error) {
      const template = localTemplates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      
      let content = template.content;
      template.variables.forEach(variable => {
        const value = data[variable.name] || `[${variable.label}]`;
        const regex = new RegExp(`{{${variable.name}}}`, 'g');
        content = content.replace(regex, value);
      });
      
      return content;
    }
  },

  async duplicateTemplate(id: string, newName: string): Promise<ContractTemplate> {
    try {
      const response = await templateApi.duplicate(id, newName);
      return response.data;
    } catch (error) {
      const template = localTemplates.find(t => t.id === id);
      if (!template) {
        throw new Error('Template not found');
      }
      
      const newTemplate: ContractTemplate = {
        id: Date.now().toString(),
        name: newName,
        description: `${template.description} (Copia)`,
        type: template.type,
        content: template.content,
        variables: template.variables,
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      localTemplates.push(newTemplate);
      return newTemplate;
    }
  }
}; 