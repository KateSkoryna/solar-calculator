-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('VAN', 'TRUCK', 'TRAILER', 'BUS');

-- CreateEnum
CREATE TYPE "EngineType" AS ENUM ('DIESEL', 'PETROL', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('DEPOT', 'STREET', 'CUSTOMER_SITE', 'MIXED');

-- CreateEnum
CREATE TYPE "SolarPanelPlacement" AS ENUM ('ROOF', 'SIDES', 'BACK', 'ALL_OVER');

-- CreateEnum
CREATE TYPE "ReportJobStatus" AS ENUM ('QUEUED', 'VALIDATING', 'CALCULATING', 'RENDERING_CHARTS', 'GENERATING_REPORT', 'GENERATING_RECOMMENDATIONS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Fleet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fleet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FleetMembership" (
    "id" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FleetMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "engineType" "EngineType" NOT NULL,
    "parkingType" "ParkingType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "averageDailyDistanceKm" DOUBLE PRECISION NOT NULL,
    "energyConsumptionKwhPer100km" DOUBLE PRECISION NOT NULL,
    "solarPanelCapacityKw" DOUBLE PRECISION NOT NULL,
    "solarPanelPlacement" "SolarPanelPlacement" NOT NULL,
    "payloadReserveKg" DOUBLE PRECISION NOT NULL,
    "maxRoofLoadKg" DOUBLE PRECISION NOT NULL,
    "operatingMonthsPerYear" INTEGER NOT NULL,
    "winterUsage" BOOLEAN NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calculation" (
    "id" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculationScenario" (
    "id" TEXT NOT NULL,
    "calculationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "formulaVersion" TEXT NOT NULL,
    "assumptionSetVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculationScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculationInputSnapshot" (
    "id" TEXT NOT NULL,
    "calculationScenarioId" TEXT NOT NULL,
    "vehicleSpec" JSONB NOT NULL,
    "energyPriceAssumptionVersion" TEXT NOT NULL,
    "emissionsFactorVersion" TEXT NOT NULL,
    "solarYieldAssumptionVersion" TEXT NOT NULL,
    "currencyConversionSourceVersion" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculationInputSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculationResult" (
    "id" TEXT NOT NULL,
    "calculationScenarioId" TEXT NOT NULL,
    "paybackPeriodMonths" DOUBLE PRECISION NOT NULL,
    "totalSolarYieldKwh" DOUBLE PRECISION NOT NULL,
    "co2SavedKg" DOUBLE PRECISION NOT NULL,
    "netSavingsAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportJob" (
    "id" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "calculationScenarioId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "status" "ReportJobStatus" NOT NULL DEFAULT 'QUEUED',
    "idempotencyKey" TEXT NOT NULL,
    "temporalWorkflowId" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "fleetId" TEXT,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "fleetId" TEXT,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "payload" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FleetMembership_userId_idx" ON "FleetMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FleetMembership_fleetId_userId_key" ON "FleetMembership"("fleetId", "userId");

-- CreateIndex
CREATE INDEX "Vehicle_fleetId_deletedAt_idx" ON "Vehicle"("fleetId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_id_fleetId_key" ON "Vehicle"("id", "fleetId");

-- CreateIndex
CREATE INDEX "Calculation_fleetId_idx" ON "Calculation"("fleetId");

-- CreateIndex
CREATE INDEX "Calculation_vehicleId_idx" ON "Calculation"("vehicleId");

-- CreateIndex
CREATE INDEX "Calculation_requestedByUserId_idx" ON "Calculation"("requestedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CalculationScenario_calculationId_key" ON "CalculationScenario"("calculationId");

-- CreateIndex
CREATE UNIQUE INDEX "CalculationInputSnapshot_calculationScenarioId_key" ON "CalculationInputSnapshot"("calculationScenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "CalculationResult_calculationScenarioId_key" ON "CalculationResult"("calculationScenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportJob_idempotencyKey_key" ON "ReportJob"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ReportJob_fleetId_status_idx" ON "ReportJob"("fleetId", "status");

-- CreateIndex
CREATE INDEX "ReportJob_calculationScenarioId_idx" ON "ReportJob"("calculationScenarioId");

-- CreateIndex
CREATE INDEX "ReportJob_requestedByUserId_idx" ON "ReportJob"("requestedByUserId");

-- CreateIndex
CREATE INDEX "AuditEvent_fleetId_createdAt_idx" ON "AuditEvent"("fleetId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_fleetId_key_key" ON "FeatureFlag"("fleetId", "key");

-- AddForeignKey
ALTER TABLE "FleetMembership" ADD CONSTRAINT "FleetMembership_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetMembership" ADD CONSTRAINT "FleetMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_vehicleId_fleetId_fkey" FOREIGN KEY ("vehicleId", "fleetId") REFERENCES "Vehicle"("id", "fleetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationScenario" ADD CONSTRAINT "CalculationScenario_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "Calculation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationInputSnapshot" ADD CONSTRAINT "CalculationInputSnapshot_calculationScenarioId_fkey" FOREIGN KEY ("calculationScenarioId") REFERENCES "CalculationScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationResult" ADD CONSTRAINT "CalculationResult_calculationScenarioId_fkey" FOREIGN KEY ("calculationScenarioId") REFERENCES "CalculationScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportJob" ADD CONSTRAINT "ReportJob_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportJob" ADD CONSTRAINT "ReportJob_calculationScenarioId_fkey" FOREIGN KEY ("calculationScenarioId") REFERENCES "CalculationScenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportJob" ADD CONSTRAINT "ReportJob_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
