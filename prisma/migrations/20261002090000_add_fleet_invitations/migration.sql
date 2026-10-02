-- CreateTable
CREATE TABLE "FleetInvitation" (
    "id" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FleetInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FleetInvitation_email_idx" ON "FleetInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FleetInvitation_fleetId_email_key" ON "FleetInvitation"("fleetId", "email");

-- AddForeignKey
ALTER TABLE "FleetInvitation" ADD CONSTRAINT "FleetInvitation_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetInvitation" ADD CONSTRAINT "FleetInvitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

