import VehicleTypeStep from "./steps/VehicleTypeStep";
import VehicleDetailsStep from "./steps/VehicleDetailsStep";
import LocationSetupStep from "./steps/LocationSetupStep";
import UserPromptStep from "./steps/UserPromptStep";
import Form from "../form/Form";

const steps = [
  {
    name: "vehicleTypeSelection",
    component: VehicleTypeStep,
  },
  {
    name: "vehicleDetails",
    component: VehicleDetailsStep,
  },
  {
    name: "locationSetup",
    component: LocationSetupStep,
  },
  {
    name: "additionalNotes",
    component: UserPromptStep,
  },
];

export default function MultiStepForm() {
  return (
    <div className="w-full bg-[var(--form-bg)] rounded-lg">
      <Form steps={steps} />
    </div>
  );
}
