import { ContractTemplate, TemplateFormData } from "../types";
import { templateApi } from "../../../../../lib/api";
import { sampleTemplates } from "../data/sampleTemplates";

// Almacenamiento local temporal para plantillas creadas/editadas
const localTemplates: ContractTemplate[] = [...sampleTemplates];

export const templateService = {
  async getAllTemplates(): Promise<ContractTemplate[]> {
    try {
      console.log('🔍 TemplateService: Fetching all templates from API');
      const response = await templateApi.getAll();
      const data = response.data;
      const templates = Array.isArray(data) ? data : (data?.content || []);
      console.log('✅ TemplateService: Successfully fetched', templates.length, 'templates');
      // Convertir IDs de number a string para compatibilidad
      return templates.map((template: any) => ({
        ...template,
        id: template.id?.toString() || template.id
      }));
    } catch (error) {
      console.log('⚠️ TemplateService: API not available, using local data');
      return localTemplates;
    }
  },

  async getTemplateById(id: string): Promise<ContractTemplate | undefined> {
    try {
      console.log('🔍 TemplateService: Fetching template by ID:', id);
      const response = await templateApi.getById(id);
      console.log('✅ TemplateService: Successfully fetched template:', response.data);
      // Convertir el ID de number a string para compatibilidad
      if (response.data) {
        return {
          ...response.data,
          id: response.data.id?.toString() || id
        };
      }
      return response.data;
    } catch (error) {
      console.log('⚠️ TemplateService: API not available, using local data');
      return localTemplates.find(t => t.id === id);
    }
  },

  async createTemplate(templateData: TemplateFormData): Promise<ContractTemplate> {
    try {
      console.log('🔍 TemplateService: Creating new template:', templateData);
      const response = await templateApi.create(templateData);
      console.log('✅ TemplateService: Successfully created template:', response.data);
      // Convertir el ID de number a string para compatibilidad
      if (response.data) {
        return {
          ...response.data,
          id: response.data.id?.toString() || response.data.id
        };
      }
      return response.data;
    } catch (error) {
      console.log('⚠️ TemplateService: API not available, creating local template');
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
      console.log('🔍 TemplateService: Updating template with ID:', id, 'Data:', templateData);
      const response = await templateApi.update(id, templateData);
      console.log('✅ TemplateService: Successfully updated template:', response.data);
      return response.data;
    } catch (error) {
      console.log('⚠️ TemplateService: API not available, updating local template');
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
      console.log('🔍 TemplateService: Deleting template with ID:', id);
      await templateApi.delete(id);
      console.log('✅ TemplateService: Successfully deleted template');
      return true;
    } catch (error) {
      console.log('⚠️ TemplateService: API not available, deleting local template');
      const index = localTemplates.findIndex(t => t.id === id);
      if (index === -1) return false;
      
      localTemplates.splice(index, 1);
      return true;
    }
  },

  async getTemplatesByType(type: string): Promise<ContractTemplate[]> {
    try {
      console.log('🔍 TemplateService: Fetching templates by type:', type);
      const response = await templateApi.getAll({ type });
      const data = response.data;
      const templates = Array.isArray(data) ? data : (data?.content || []);
      console.log('✅ TemplateService: Successfully fetched', templates.length, 'templates by type');
      return templates;
    } catch (error) {
      console.log('⚠️ TemplateService: API not available, using local data');
      return localTemplates.filter(t => t.type === type);
    }
  },

  async getDefaultTemplate(type: string): Promise<ContractTemplate | undefined> {
    try {
      console.log('🔍 TemplateService: Fetching default template for type:', type);
      const response = await templateApi.getAll({ type, isDefault: true });
      const data = response.data;
      const templates = Array.isArray(data) ? data : (data?.content || []);
      console.log('✅ TemplateService: Successfully fetched default template:', templates[0]);
      return templates[0];
    } catch (error) {
      console.log('⚠️ TemplateService: API not available, using local data');
      return localTemplates.find(t => t.type === type && t.isDefault);
    }
  },

  async setDefaultTemplate(id: string): Promise<ContractTemplate | undefined> {
    try {
      console.log('🔍 TemplateService: Setting default template with ID:', id);
      const response = await templateApi.update(id, { isDefault: true });
      console.log('✅ TemplateService: Successfully set default template:', response.data);
      return response.data;
    } catch (error) {
      console.log('⚠️ TemplateService: API not available, updating local template');
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
      console.log('🔍 TemplateService: Generating contract from template:', templateId, 'Data:', data);
      const response = await templateApi.generateContract(templateId, data);
      console.log('✅ TemplateService: Successfully generated contract from template');
      return response.data || '';
    } catch (error) {
      console.log('⚠️ TemplateService: API not available, generating local contract');
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
      console.log('🔍 TemplateService: Duplicating template with ID:', id, 'New name:', newName);
      const response = await templateApi.duplicate(id, newName);
      console.log('✅ TemplateService: Successfully duplicated template:', response.data);
      return response.data;
    } catch (error) {
      console.log('⚠️ TemplateService: API not available, creating local duplicate');
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