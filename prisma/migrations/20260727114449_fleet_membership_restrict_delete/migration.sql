-- DropForeignKey
ALTER TABLE "FleetMembership" DROP CONSTRAINT "FleetMembership_fleetId_fkey";

-- AddForeignKey
ALTER TABLE "FleetMembership" ADD CONSTRAINT "FleetMembership_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
