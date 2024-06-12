import { useQuery } from "@tanstack/react-query";
import { IAction } from "edifice-ts-client";

import { sessionHasWorkflowRights } from "../api";
import { workflows } from "~/config";

/**
 * useActions query
 * set actions correctly with workflow rights
 * @returns actions data
 */
// const { actions } = getAppParams();
export const useActions = () => {
  const { signets } = workflows;

  return useQuery<Record<string, boolean>, Error, IAction[]>({
    queryKey: ["actions"],
    queryFn: async () => {
      const availableRights = await sessionHasWorkflowRights([signets]);
      return availableRights;
    },
    select: (data) => {
      const actions: any[] = [
        {
          id: "signets",
          workflow: signets,
        },
      ];
      return actions.map((action) => ({
        ...action,
        available: data[action.workflow],
      }));
    },
  });
};
