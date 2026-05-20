import { create } from "zustand";
import type { CertificateTemplate } from "../backend.d";

interface TemplateStore {
  templates: CertificateTemplate[];
  setTemplates: (templates: CertificateTemplate[]) => void;
  addTemplate: (template: CertificateTemplate) => void;
  updateTemplate: (template: CertificateTemplate) => void;
  removeTemplate: (id: string) => void;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [],
  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) =>
    set((state) => ({ templates: [...state.templates, template] })),
  updateTemplate: (template) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === template.id ? template : t,
      ),
    })),
  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),
}));
