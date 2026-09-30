-- CreateEnum
CREATE TYPE "ScenarioKind" AS ENUM ('PESSIMISTIC', 'REALISTIC', 'OPTIMISTIC');

-- CreateEnum
CREATE TYPE "CargoType" AS ENUM ('REGULAR', 'CHILLED', 'PASSENGERS');

-- CreateEnum
CREATE TYPE "CoolingUnitType" AS ENUM ('DIESEL', 'ENGINE_DRIVEN', 'ELECTRIC');

-- DropIndex
DROP INDEX "CalculationScenario_calculationId_key";

-- AlterTable
ALTER TABLE "CalculationResult" ADD COLUMN     "annualSavingsAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "cumulativeSavingsSeries" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "oneTimeCostAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "savingsBreakdown" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "subsidyAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ALTER COLUMN "paybackPeriodMonths" DROP NOT NULL;

ALTER TABLE "CalculationResult" ALTER COLUMN "annualSavingsAmount" DROP DEFAULT,
ALTER COLUMN "cumulativeSavingsSeries" DROP DEFAULT,
ALTER COLUMN "oneTimeCostAmount" DROP DEFAULT,
ALTER COLUMN "savingsBreakdown" DROP DEFAULT,
ALTER COLUMN "subsidyAmount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CalculationScenario" ADD COLUMN     "kind" "ScenarioKind" NOT NULL DEFAULT 'REALISTIC';

ALTER TABLE "CalculationScenario" ALTER COLUMN "kind" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "cargoType" "CargoType" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "coolingUnitType" "CoolingUnitType",
ADD COLUMN     "idleHoursPerDay" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "CalculationScenario_calculationId_kind_key" ON "CalculationScenario"("calculationId", "kind");

