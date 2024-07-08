import { Dropdown } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

interface DropDownProps {
  checkboxOptions: string[];
  selectedCheckboxes: string[];
  setSelectedCheckboxes: React.Dispatch<React.SetStateAction<string[]>>;
  label: string;
}
export const DropDown: React.FC<DropDownProps> = ({
  checkboxOptions,
  selectedCheckboxes,
  setSelectedCheckboxes,
  label,
}) => {
  const { t } = useTranslation();

  const handleMultiCheckbox = (
    selectedCheckboxes: string[],
    setSelectedCheckboxes: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) => {
    let checked = [...selectedCheckboxes];
    const findIndex = checked.findIndex(
      (item: string): boolean => item === value,
    );

    if (!selectedCheckboxes.includes(value)) {
      checked = [...selectedCheckboxes, value];
    } else {
      checked = selectedCheckboxes.filter(
        (_, index: number) => index !== findIndex,
      );
    }
    setSelectedCheckboxes(checked);
  };

  return (
    <Dropdown>
      <Dropdown.Trigger
        label={label}
        badgeContent={selectedCheckboxes.length || 0}
      />
      <Dropdown.Menu>
        <Dropdown.Item
          key={`all-selected-${label}`}
          onClick={() =>
            selectedCheckboxes.length === checkboxOptions.length
              ? setSelectedCheckboxes([])
              : setSelectedCheckboxes(checkboxOptions)
          }
        >
          {selectedCheckboxes.length === checkboxOptions.length
            ? t("mediacentre.combo.deselectAll")
            : t("mediacentre.combo.selectAll")}
        </Dropdown.Item>
        <Dropdown.Separator />
        {checkboxOptions.map((option, index) => (
          <Dropdown.CheckboxItem
            key={index}
            value={option}
            model={selectedCheckboxes}
            onChange={() =>
              handleMultiCheckbox(
                selectedCheckboxes,
                setSelectedCheckboxes,
                option,
              )
            }
          >
            {option}
          </Dropdown.CheckboxItem>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
