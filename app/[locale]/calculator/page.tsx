import Container from "@/components/layout/Container";
import ImageBackground from "@/components/home/Background";
import { useTranslations } from "next-intl";

export default function Calculator() {
  const t = useTranslations("calculator");

  return (
    <>
      <ImageBackground />
      <Container>
        <h1 className="!text-[var(--accent)] text-center mb-6 py-8">
          {t("title")}
        </h1>

        <div className="w-1/2">
          <div className="bg-[var(--card)] p-6 rounded-lg shadow-md">
            <p className="text-lg font-[family:var(--font-inter)] text-[var(--text-body)] mb-6">
              {t("description")}
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
                  {t("vehicleType")}
                </label>
                <select className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]">
                  <option value="">{t("selectVehicle")}</option>
                  <option value="van">{t("van")}</option>
                  <option value="truck">{t("truck")}</option>
                  <option value="bus">{t("bus")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
                  {t("dailyDistance")}
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]"
                  placeholder={t("distancePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
                  {t("roofArea")}
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-[var(--border)] rounded-md bg-[var(--input)] text-[var(--text-body)]"
                  placeholder={t("areaPlaceholder")}
                />
              </div>

              <button className="w-full bg-[var(--accent)] text-white p-3 rounded-md font-medium hover:opacity-90 transition-opacity">
                {t("calculate")}
              </button>
            </div>

            <div className="mt-8 p-4 bg-[var(--background)] rounded-md">
              <h2 className="text-xl font-semibold text-[var(--text-heading)] mb-4">
                {t("results")}
              </h2>
              <p className="text-[var(--text-body)]">
                {t("resultsPlaceholder")}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
