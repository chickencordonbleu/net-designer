import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNetworkProjects,
  getNetworkProject,
  createNetworkProject,
  updateNetworkProject,
  deleteNetworkProject,
} from "../api";

export const networkProjectQueryKeys = {
  all: ["networkProjects"],
  list: () => [...networkProjectQueryKeys.all, "list"],
  byId: (id: string) => [...networkProjectQueryKeys.all, id],
};

export function useNetworkProjects() {
  return useQuery({
    queryKey: networkProjectQueryKeys.list(),
    queryFn: getNetworkProjects,
  });
}

export function useNetworkProject(id: string | undefined) {
  return useQuery({
    queryKey: networkProjectQueryKeys.byId(id!),
    queryFn: () => getNetworkProject(id!),
    enabled: !!id, // Only run the query if an ID is provided
  });
}

export function useCreateNetworkProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNetworkProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: networkProjectQueryKeys.all,
      });
    },
  });
}

export function useUpdateNetworkProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNetworkProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: networkProjectQueryKeys.all,
      });
    },
  });
}

export function useDeleteNetworkProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNetworkProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: networkProjectQueryKeys.all,
      });
    },
  });
}
