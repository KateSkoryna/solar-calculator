import { useFormatter, useTranslations } from "next-intl";
import Badge from "@/components/common/Badge";
import BrandIllustration from "@/components/common/BrandIllustration";
import MiniStat from "@/components/common/MiniStat";
import Text from "@/components/common/Text";
import { PAYBACK_HORIZON_YEARS } from "@/lib/calculation-engine/constants";
import {
  calculateHomeExample,
  HOME_EXAMPLE_QUICK_CHECK,
} from "@/lib/home-example";
import { RISE_STAGGER_CLASSES } from "@/lib/rise-animation";

const PAYBACK_YEARS_FRACTION_DIGITS = 1;
const CO2_TONNES_FRACTION_DIGITS = 1;
const PAYBACK_ROUNDING_FACTOR = 10 ** PAYBACK_YEARS_FRACTION_DIGITS;
const EXAMPLE_CURRENCY = "EUR";
const HIDDEN_ON_MOBILE_CLASSES = "hidden md:block";

export default function ExamplePanel() {
  const t = useTranslations("home.example");
  const format = useFormatter();
  const example = calculateHomeExample();
  const paybackHeadline =
    example.paybackYears === null
      ? t("paybackNever", { years: PAYBACK_HORIZON_YEARS })
      : t("paybackHeadline", {
          years:
            Math.round(example.paybackYears * PAYBACK_ROUNDING_FACTOR) /
            PAYBACK_ROUNDING_FACTOR,
        });
  const stats = [
    {
      label: t("savedPerYear"),
      value: format.number(example.annualSavingsEuros, {
        style: "currency",
        currency: EXAMPLE_CURRENCY,
        maximumFractionDigits: 0,
      }),
      className: "",
    },
    {
      label: t("co2Avoided"),
      value: t("co2Value", {
        tonnes: format.number(example.co2AvoidedTonnesPerYear, {
          maximumFractionDigits: CO2_TONNES_FRACTION_DIGITS,
        }),
      }),
      className: "",
    },
    {
      label: t("solarEnergy"),
      value: t("solarEnergyValue", {
        kilowattHours: format.number(example.yearlySolarEnergyKwh, {
          maximumFractionDigits: 0,
        }),
      }),
      className: HIDDEN_ON_MOBILE_CLASSES,
    },
  ];

  return (
    <div
      className={`relative flex min-h-[400px] items-end overflow-hidden rounded-2xl bg-forest p-4 pt-32 md:p-8 md:pt-40 lg:min-h-[520px] ${RISE_STAGGER_CLASSES[1]}`}
    >
      <BrandIllustration className="absolute -top-16 -right-16 w-56 md:w-72" />
      <div
        data-testid="home-example"
        className="relative flex w-full flex-col gap-5 rounded-xl bg-surface p-5 text-left shadow-float md:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text size="small" tone="muted" className="font-semibold">
            {t("label", {
              quantity: HOME_EXAMPLE_QUICK_CHECK.quantity,
              city: HOME_EXAMPLE_QUICK_CHECK.cityLabel,
            })}
          </Text>
          <Badge variant="sample">{t("sampleBadge")}</Badge>
        </div>
        <p
          data-testid="home-example-payback"
          className="font-display text-[30px] leading-none font-extrabold tracking-[-0.02em] text-ink md:text-[40px]"
        >
          {paybackHeadline}
        </p>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stats.map(({ label, value, className }) => (
            <MiniStat
              key={label}
              label={label}
              value={value}
              className={className}
            />
          ))}
        </dl>
      </div>
    </div>
  );
}
