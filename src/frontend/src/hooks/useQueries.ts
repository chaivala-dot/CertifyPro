import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Recipient } from "../backend.d";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

// Query keys
const queryKeys = {
  certificate: (id: string) => ["certificate", id] as const,
  template: (id: string) => ["template", id] as const,
  templates: () => ["templates"] as const,
  batch: (id: string) => ["batch", id] as const,
  batches: () => ["batches"] as const,
};

export function useListTemplates() {
  return useQuery({
    queryKey: queryKeys.templates(),
    queryFn: async () => apiFetch<any[]>("/api/templates"),
  });
}

export function useListBatches() {
  return useQuery({
    queryKey: queryKeys.batches(),
    queryFn: async () => apiFetch<any[]>("/api/batches"),
  });
}

// Get Batch
export function useGetBatch(batchId: string) {
  return useQuery({
    queryKey: queryKeys.batch(batchId),
    queryFn: async () => {
      if (!batchId) throw new Error("No batch ID provided");
      return await apiFetch<any>(`/api/batches/${encodeURIComponent(batchId)}`);
    },
    enabled: !!batchId,
  });
}

// Verify Certificate
export function useVerifyCertificate() {
  return useMutation({
    mutationFn: async (code: string) => {
      return await apiFetch<any>("/api/certificates/verify", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    },
  });
}

// Get Certificate
export function useGetCertificate(certificateId: string) {
  return useQuery({
    queryKey: queryKeys.certificate(certificateId),
    queryFn: async () => {
      if (!certificateId) throw new Error("No certificate ID provided");
      return await apiFetch<any>(`/api/certificates/${encodeURIComponent(certificateId)}`);
    },
    enabled: !!certificateId,
  });
}

// Increment Download Count
export function useIncrementDownloadCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (certificateId: string): Promise<void> => {
      await apiFetch<any>(
        `/api/certificates/${encodeURIComponent(certificateId)}/increment-download`,
        { method: "POST" },
      );
    },
    onSuccess: (_, certificateId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.certificate(certificateId),
      });
    },
  });
}

// Get Template
export function useGetTemplate(templateId: string) {
  return useQuery({
    queryKey: queryKeys.template(templateId),
    queryFn: async () => {
      if (!templateId || templateId === "__prefetch__") {
        throw new Error("No template ID provided");
      }
      return await apiFetch<any>(`/api/templates/${encodeURIComponent(templateId)}`);
    },
    enabled: !!templateId && templateId !== "__prefetch__",
  });
}

// Create Template
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      backgroundUrl?: string | null;
      canvasStateJson?: unknown;
    }) => {
      return await apiFetch<any>("/api/templates", {
        method: "POST",
        body: JSON.stringify({
          name: params.name,
          backgroundUrl: params.backgroundUrl ?? null,
          canvasStateJson: params.canvasStateJson ?? {},
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates() });
    },
  });
}

// Update Template
export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      backgroundUrl?: string | null;
      canvasStateJson?: unknown;
    }) => {
      return await apiFetch<any>(`/api/templates/${encodeURIComponent(params.id)}`, {
        method: "PUT",
        body: JSON.stringify({
          name: params.name,
          backgroundUrl: params.backgroundUrl ?? null,
          canvasStateJson: params.canvasStateJson ?? {},
        }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.template(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates() });
    },
  });
}

// Delete Template
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string): Promise<void> => {
      await apiFetch<void>(`/api/templates/${encodeURIComponent(templateId)}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates() });
    },
  });
}

// Create Batch
export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      templateId: string;
      recipients: Recipient[];
    }) => {
      return await apiFetch<any>("/api/batches", {
        method: "POST",
        body: JSON.stringify({
          name: params.name,
          templateId: params.templateId,
          recipients: params.recipients.map((r) => ({
            name: r.name,
            email: r.email,
            customFields: r.fieldValues,
          })),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.batches() });
    },
  });
}

// Delete Batch
export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batchId: string): Promise<void> => {
      await apiFetch<void>(`/api/batches/${encodeURIComponent(batchId)}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.batches() });
    },
  });
}
