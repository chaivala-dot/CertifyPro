import { useQuery } from "@tanstack/react-query";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export function useListBatches() {
  return useQuery({
    queryKey: ["batches"],
    queryFn: async () => apiFetch<any[]>("/api/batches"),
  });
}
