-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "sourceQuickCheckHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_fleetId_sourceQuickCheckHash_key" ON "Vehicle"("fleetId", "sourceQuickCheckHash");

