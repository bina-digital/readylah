/*
  Warnings:

  - A unique constraint covering the columns `[outletId,dayKey,type]` on the table `OutletDailyCounter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `OutletDailyCounter` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('starter', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('order', 'seat');

-- CreateEnum
CREATE TYPE "CounterType" AS ENUM ('order', 'seat');

-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'no_show';

-- DropIndex
DROP INDEX "OutletDailyCounter_outletId_dayKey_key";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'starter';

-- AlterTable
ALTER TABLE "OutletDailyCounter" ADD COLUMN     "type" "CounterType" NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "pax" INTEGER,
ADD COLUMN     "type" "TicketType" NOT NULL DEFAULT 'order';

-- CreateIndex
CREATE UNIQUE INDEX "OutletDailyCounter_outletId_dayKey_type_key" ON "OutletDailyCounter"("outletId", "dayKey", "type");

-- CreateIndex
CREATE INDEX "Ticket_type_idx" ON "Ticket"("type");

-- CreateIndex
CREATE INDEX "Ticket_outletId_type_orderNumber_idx" ON "Ticket"("outletId", "type", "orderNumber");
