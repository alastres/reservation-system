-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('GOOGLE_MEET', 'ZOOM', 'PHONE', 'IN_PERSON', 'CUSTOM');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "clientPhone" TEXT,
ADD COLUMN     "joinUrl" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "address" TEXT,
ADD COLUMN     "locationType" "LocationType" NOT NULL DEFAULT 'GOOGLE_MEET',
ADD COLUMN     "locationUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" TEXT;
