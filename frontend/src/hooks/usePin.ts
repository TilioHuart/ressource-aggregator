import { useGetPinsQuery } from "../services/api/pin.service";

export const usePin = (idStructure: string) => {
  const {
    data: pins,
    error,
    isLoading,
    refetch: refetchPins,
  } = useGetPinsQuery(idStructure);

  return {
    pins,
    refetchPins,
    error,
    isLoading,
  };
};
