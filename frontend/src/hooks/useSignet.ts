import { useEffect, useState } from "react";

import { useUser } from "@edifice-ui/react";

import { Signet } from "./../model/Signet.model";
import {
  useGetPublishedSignetsQuery,
  useGetMySignetsQuery,
} from "./../services/api/signet.service";

export const useSignet = () => {
  const { user } = useUser();
  const {
    data: publicSignets,
    error: publicSignetError,
    isLoading: publicSignetIsLoading,
  } = useGetPublishedSignetsQuery(null);
  const {
    data: mySignets,
    error: mySignetError,
    isLoading: mySignetIsLoading,
  } = useGetMySignetsQuery(null);
  const [homeSignets, setHomeSignets] = useState<Signet[]>([]);

  useEffect(() => {
    const publicSignetsData = publicSignets?.data?.signets?.resources ?? [];
    const mySignetsData = mySignets
      ? mySignets.filter((signet: Signet) => signet.owner_id != user?.userId)
      : [];
    const updatedPublicSignetsData = publicSignetsData.map(
      (signet: Signet) => ({
        ...signet,
        orientation: signet.document_types.some((type) =>
          type.toLowerCase().includes("orientation"),
        ),
      }),
    );
    setHomeSignets([...updatedPublicSignetsData, ...mySignetsData]);
  }, [publicSignets, mySignets, user?.userId]);

  return {
    homeSignets,
    publicSignetError,
    publicSignetIsLoading,
    mySignetError,
    mySignetIsLoading,
  };
};
