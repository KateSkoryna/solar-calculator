import {
  CALCULATOR_DEFAULT_VALUES,
  calculatorFormSchema,
  type CalculatorFormValues,
} from "@/lib/calculator-form";

export const CALCULATOR_ANSWERS_STORAGE_KEY = "calculatorAnswers";

function withoutInvalidFields(values: CalculatorFormValues) {
  const parsedValues = calculatorFormSchema.safeParse(values);
  if (parsedValues.success) return values;

  const invalidFieldNames = new Set(
    parsedValues.error.issues.map((issue) => String(issue.path[0])),
  );
  return Object.fromEntries(
    Object.entries(values).filter(
      ([fieldName]) => !invalidFieldNames.has(fieldName),
    ),
  );
}

export function saveCalculatorAnswers(values: CalculatorFormValues) {
  try {
    sessionStorage.setItem(
      CALCULATOR_ANSWERS_STORAGE_KEY,
      JSON.stringify(withoutInvalidFields(values)),
    );
    return true;
  } catch {
    return false;
  }
}

export function readCalculatorAnswers(): CalculatorFormValues | null {
  try {
    const stored = sessionStorage.getItem(CALCULATOR_ANSWERS_STORAGE_KEY);
    if (stored === null) return null;
    const parsed = calculatorFormSchema.safeParse({
      ...CALCULATOR_DEFAULT_VALUES,
      ...JSON.parse(stored),
    });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
