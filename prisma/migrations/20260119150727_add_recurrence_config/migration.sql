-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isRecurrenceEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxRecurrenceCount" INTEGER DEFAULT 4;
