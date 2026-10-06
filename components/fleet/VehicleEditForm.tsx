"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import Card from "@/components/common/Card";
import Disclosure from "@/components/common/Disclosure";
import Heading from "@/components/common/Heading";
import Button from "@/components/form/Button";
import DeleteVehicleButton from "@/components/fleet/DeleteVehicleButton";
import ButtonLink from "@/components/form/ButtonLink";
import FormAlert from "@/components/form/FormAlert";
import Input from "@/components/form/Input";
import Select, { type SelectOption } from "@/components/form/Select";
import { EU_COUNTRY_CODES } from "@/lib/assumptions/eu-countries";
import { COOLING_UNIT_TYPES } from "@/lib/assumptions/types";
import { OPTIONAL_NUMBER_FIELDS } from "@/lib/calculator-form";
import { fleetVehicleApiPath } from "@/lib/fleet-api-paths";
import {
  isChilledVehicle,
  NO_COOLING_UNIT,
  toVehicleUpdate,
  VEHICLE_FORM_GROUPS,
  VEHICLE_TECHNICAL_FIELDS,
  vehicleEditFormSchema,
  type VehicleChoiceField,
  type VehicleEditFormValues,
  type VehicleNumberField,
} from "@/lib/vehicle-edit-form";
import { fleetVehiclesPath } from "@/lib/workspace-path";
import { VehicleType } from "@/app/generated/prisma/enums";

const ENGINE_TYPES = ["DIESEL", "PETROL", "ELECTRIC", "HYBRID"] as const;
const CHOICE_FIELD_VALUES: Record<VehicleChoiceField, readonly string[]> = {
  vehicleType: Object.values(VehicleType),
  engineType: ENGINE_TYPES,
  cargoType: ["REGULAR", "CHILLED", "PASSENGERS"],
  parkingType: ["DEPOT", "STREET", "CUSTOMER_SITE", "MIXED"],
  solarPanelPlacement: ["ROOF", "ALL_OVER", "SIDES", "BACK"],
};
const WHOLE_NUMBER_FIELDS: readonly VehicleNumberField[] = [
  "quantity",
  "operatingMonthsPerYear",
];
const OPTION_MESSAGE_NAMESPACE = "calculator.options";

interface VehicleEditFormProps {
  fleetId: string;
  fleetSlug: string;
  vehicleId: string;
  vehicleName: string;
  canDelete: boolean;
  initialValues: VehicleEditFormValues;
}

export default function VehicleEditForm({
  fleetId,
  fleetSlug,
  vehicleId,
  vehicleName,
  canDelete,
  initialValues,
}: VehicleEditFormProps) {
  const t = useTranslations("vehicles.edit");
  const tOptions = useTranslations(OPTION_MESSAGE_NAMESPACE);
  const tExactNumbers = useTranslations("calculator.exactNumbers");
  const tQuestions = useTranslations("calculator.questions");
  const locale = useLocale();
  const router = useRouter();
  const [hasSaveFailed, setHasSaveFailed] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VehicleEditFormValues>({
    resolver: zodResolver(vehicleEditFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });
  const vehiclesPath = fleetVehiclesPath(locale, fleetSlug);
  const countryNames = new Intl.DisplayNames([locale], { type: "region" });

  const choiceOptions = (field: VehicleChoiceField): SelectOption[] =>
    CHOICE_FIELD_VALUES[field].map((value) => ({
      value,
      label:
        field === "engineType"
          ? t(`engineTypes.${value}`)
          : tOptions(`${field}.${value}`),
    }));

  const countryOptions: SelectOption[] = [
    ...((EU_COUNTRY_CODES as readonly string[]).includes(initialValues.country)
      ? []
      : [{ value: initialValues.country, label: initialValues.country }]),
    ...EU_COUNTRY_CODES.map((code) => ({
      value: code,
      label: countryNames.of(code) ?? code,
    })),
  ];

  const coolingOptions: SelectOption[] = [
    { value: NO_COOLING_UNIT, label: t("noCoolingUnit") },
    ...COOLING_UNIT_TYPES.map((value) => ({
      value,
      label: tOptions(`coolingUnitType.${value}`),
    })),
  ];

  const fieldError = (field: keyof VehicleEditFormValues) =>
    errors[field] ? t("fieldError") : undefined;

  const renderField = (field: string) => {
    if (field in CHOICE_FIELD_VALUES) {
      const choiceField = field as VehicleChoiceField;
      return (
        <Select
          key={field}
          label={t(`fields.${field}`)}
          options={choiceOptions(choiceField)}
          {...register(choiceField)}
        />
      );
    }
    if (field === "country") {
      return (
        <Select
          key={field}
          label={t("fields.country")}
          options={countryOptions}
          {...register("country")}
        />
      );
    }
    if (field === "winterUsage") {
      return (
        <label
          key={field}
          className="flex min-h-14 items-center gap-3 text-[15px] font-semibold text-ink"
        >
          <input
            type="checkbox"
            className="size-5 accent-lime"
            {...register("winterUsage")}
          />
          {t("fields.winterUsage")}
        </label>
      );
    }
    const isNumber = !["name", "manufacturer", "model", "city"].includes(field);
    const typedField = field as keyof VehicleEditFormValues;
    const isExactNumber = (
      OPTIONAL_NUMBER_FIELDS as readonly string[]
    ).includes(field);
    const label = isExactNumber
      ? tExactNumbers(`${field}.label`)
      : t(`fields.${field}`);
    const hint = isExactNumber
      ? tExactNumbers(`${field}.hint`)
      : field === "name"
        ? t("fields.nameHint")
        : undefined;

    return (
      <Input
        key={field}
        label={label}
        error={fieldError(typedField)}
        hint={hint}
        {...(isNumber
          ? {
              type: "number",
              inputMode: "decimal" as const,
              step: WHOLE_NUMBER_FIELDS.includes(field as VehicleNumberField)
                ? 1
                : "any",
            }
          : { type: "text" })}
        {...register(typedField as never, { valueAsNumber: isNumber })}
      />
    );
  };

  const save = handleSubmit(async (values) => {
    setHasSaveFailed(false);
    const update = toVehicleUpdate(values, initialValues);

    if (Object.keys(update).length > 0) {
      const response = await fetch(fleetVehicleApiPath(fleetId, vehicleId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      }).catch(() => null);

      if (!response?.ok) {
        setHasSaveFailed(true);
        return;
      }
    }

    router.push(vehiclesPath);
    router.refresh();
  });

  const showCoolingUnit = isChilledVehicle({
    cargoType: useWatch({ control, name: "cargoType" }),
  });

  return (
    <form noValidate onSubmit={save} className="flex flex-col gap-6">
      <Heading level={1} size="display-s">
        {t("title", { vehicle: vehicleName })}
      </Heading>
      {VEHICLE_FORM_GROUPS.map(({ key, fields }) => (
        <Card as="section" key={key} title={t(`groups.${key}`)}>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => renderField(field))}
            {key === "vehicle" && showCoolingUnit && (
              <Select
                label={tQuestions("coolingUnitType")}
                options={coolingOptions}
                {...register("coolingUnitType")}
              />
            )}
          </div>
        </Card>
      ))}
      <Card as="section">
        <Disclosure summary={t("technical.summary")}>
          <div className="flex flex-col gap-4 pt-2">
            <p className="text-[15px] text-muted">{t("technical.text")}</p>
            <div className="grid gap-4 md:grid-cols-2">
              {VEHICLE_TECHNICAL_FIELDS.map((field) => renderField(field))}
            </div>
          </div>
        </Disclosure>
      </Card>
      {hasSaveFailed && <FormAlert>{t("saveFailed")}</FormAlert>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={isSubmitting}>
          {t("save")}
        </Button>
        <ButtonLink href={vehiclesPath} variant="secondary">
          {t("cancel")}
        </ButtonLink>
        {canDelete && (
          <div className="md:ml-auto">
            <DeleteVehicleButton
              fleetId={fleetId}
              fleetSlug={fleetSlug}
              vehicleId={vehicleId}
              vehicleName={vehicleName}
            />
          </div>
        )}
      </div>
    </form>
  );
}
