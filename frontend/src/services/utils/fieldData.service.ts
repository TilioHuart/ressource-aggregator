import { FieldData } from "~/model/FieldData";

export const createEmptyFieldData = (): FieldData => {
  const fieldData: FieldData = {
    value: "",
    toJson: () => toJson(fieldData),
  };
  return fieldData;
};

export const toJson = (fieldData: FieldData): any => ({
  value: fieldData.value,
  ...(fieldData.comparator !== undefined && {
    comparator: fieldData.comparator,
  }),
});

export const isFieldData = (fieldData: FieldData): boolean => {
  return !!fieldData.value && !!fieldData.comparator;
};
