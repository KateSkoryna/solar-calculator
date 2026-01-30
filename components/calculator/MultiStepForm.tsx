"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import VehicleTypeStep from "./steps/VehicleTypeStep";
import SetupDetailsStep from "./steps/SetupDetailsStep";
import UserPromptStep from "./steps/UserPromptStep";

export interface FormData {
  // Vehicle Type
  vehicleType: string;

  // Vehicle Details
  dailyDistance: number;
  fuelConsumption: number;
  fuelType: string;

  // Setup Details
  roofArea: number;
  budget: number;
  installationType: string;

  // User Prompt
  additionalNotes: string;
}

const initialFormData: FormData = {
  vehicleType: "",
  dailyDistance: 0,
  fuelConsumption: 0,
  fuelType: "",
  roofArea: 0,
  budget: 0,
  installationType: "",
  additionalNotes: "",
};

export default function MultiStepForm() {
  const t = useTranslations("calculator");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const steps = [
    { name: t("vehicleType"), component: VehicleTypeStep },
    { name: t("setupDetails"), component: SetupDetailsStep },
    { name: t("userPrompt"), component: UserPromptStep },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // Handle form submission
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="w-full bg-[var(--form-bg)] rounded-lg">
      {/* Desktop Tabs - visible on lg screens */}
      <div className="hidden lg:flex border-b border-[var(--border)] mb-4">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`flex-1 px-6 pb-4 text-sm font-medium transition-colors
              ${
                currentStep === index
                  ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                  : "text-[var(--text-body)] hover:text-[var(--text-heading)]"
              }`}
          >
            {step.name}
          </button>
        ))}
      </div>

      {/* Mobile: Current Step Name */}
      <div className="lg:hidden mb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-heading)]">
            {steps[currentStep].name}
          </h3>
          <span className="text-sm text-[var(--text-body)]">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <div className="overflow-y-auto max-h-[500px] lg:max-h-[600px] pr-2">
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="mt-4 flex justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-6 py-3 border border-[var(--border)] rounded-md font-medium
            text-[var(--text-body)] hover:bg-[var(--background)]
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t("previous")}
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-[var(--accent)] text-white rounded-md font-medium
              hover:opacity-90 transition-opacity"
          >
            {t("calculate")}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-[var(--accent)] text-white rounded-md font-medium
              hover:opacity-90 transition-opacity"
          >
            {t("next")}
          </button>
        )}
      </div>
    </div>
  );
}
