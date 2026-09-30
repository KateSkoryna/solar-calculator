DROP INDEX "User_resetToken_key";

ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry";
