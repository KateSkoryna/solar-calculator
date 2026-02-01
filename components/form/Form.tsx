"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import Button from "./Button";
import {
  VehicleType,
  EngineType,
  ParkingType,
  SolarPanelPlacement,
  ParkingLocation,
} from "@/types/calculator";

const formSchema = z.object({
  vehicleType: z.enum([
    VehicleType.VAN,
    VehicleType.TRUCK,
    VehicleType.TRAILER,
    VehicleType.BUS,
  ]),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  numberOfVehicles: z.number().min(1, "Must have at least 1 vehicle"),
  averageDailyDistance: z.number().min(0, "Distance must be a positive number"),
  energyConsumption: z
    .number()
    .min(0, "Energy consumption must be a positive number"),
  solarPanelCapacity: z
    .number()
    .min(0, "Solar panel capacity must be a positive number"),
  payloadReserve: z
    .number()
    .min(0, "Payload reserve must be a positive number"),
  maxRoofLoad: z.number().min(0, "Max roof load must be a positive number"),
  engineType: z.enum([
    EngineType.DIESEL,
    EngineType.PETROL,
    EngineType.ELECTRIC,
  ]),
  parkingType: z.enum([
    ParkingType.DEPOT,
    ParkingType.STREET,
    ParkingType.CUSTOMER_SITE,
    ParkingType.MIXED,
  ]),
  operatingMonths: z.number().min(1, "Must have at least 1 operating month"),
  winterUsage: z.boolean(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  solarPanelPlacement: z.enum([
    SolarPanelPlacement.ROOF,
    SolarPanelPlacement.SIDES,
    SolarPanelPlacement.BACK,
    SolarPanelPlacement.ALL_OVER,
  ]),
  daytimeParking: z.enum([
    ParkingLocation.OUTDOOR,
    ParkingLocation.COVERED,
    ParkingLocation.INDOOR,
    ParkingLocation.MIXED,
  ]),
  nighttimeParking: z.enum([
    ParkingLocation.OUTDOOR,
    ParkingLocation.COVERED,
    ParkingLocation.INDOOR,
    ParkingLocation.MIXED,
  ]),
  additionalNotes: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;

const initialFormData: Partial<FormData> = {
  numberOfVehicles: 1,
  averageDailyDistance: 0,
  energyConsumption: 0,
  solarPanelCapacity: 0,
  payloadReserve: 0,
  maxRoofLoad: 0,
  operatingMonths: 12,
  winterUsage: false,
  additionalNotes: "",
};

interface FormProps {
  steps: {
    name: string;
    component: React.ComponentType;
  }[];
}

export default function Form({ steps }: FormProps) {
  const t = useTranslations("calculator");

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormData,
  });

  const { handleSubmit } = methods;

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {steps.map((step, index) => {
          const StepComponent = step.component;
          return (
            <div
              key={index}
              className="relative bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-white/20"
              style={{ zIndex: steps.length - index }}
            >
              <h3 className="text-lg font-semibold !text-[var(--text-white)] mb-4">
                {t(step.name)}
              </h3>
              <StepComponent />
            </div>
          );
        })}

        <div className="flex justify-center bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-white/20">
          <Button
            type="submit"
            label={t("calculate")}
            className="px-8 py-3 bg-[var(--accent)] text-[var(--text-on-accent)] rounded-md font-medium hover:opacity-90 transition-opacity"
          />
        </div>
      </form>
    </FormProvider>
  );
}
