export type TemplateType = "SALE" | "RENT" | "BROKERAGE";

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  content: string;
  variables: TemplateVariable[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  version?: number;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  required: boolean;
  defaultValue?: string;
  options?: string[]; // Para tipo select
  placeholder?: string;
  description?: string;
}

export interface TemplateFormData {
  name: string;
  description: string;
  type: TemplateType;
  content: string;
  variables: TemplateVariable[];
  isDefault: boolean;
  isActive: boolean;
}

export interface TemplatePreviewData {
  template: ContractTemplate;
  sampleData?: Record<string, string>;
} 