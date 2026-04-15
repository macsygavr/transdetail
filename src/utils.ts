import { useMemo } from "react";

export function useEntityMap<T extends { id: string }>(data?: T[]) {
  return useMemo<Record<string, T>>(() => {
    if (!data) {
      return {};
    }
    return Object.fromEntries(data.map((item) => [item.id, item]));
  }, [data]);
}
