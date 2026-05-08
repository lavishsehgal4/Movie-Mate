/*
  Warnings:

  - Added the required column `updated_at` to the `Screen` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'LOCKED', 'BOOKED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Screen" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "seat_layout" JSONB,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Seat" (
    "id" SERIAL NOT NULL,
    "screen_id" INTEGER NOT NULL,
    "row_label" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "price_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "seat_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowSeat" (
    "id" SERIAL NOT NULL,
    "show_id" INTEGER NOT NULL,
    "seat_id" INTEGER NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "locked_by" INTEGER,
    "lock_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "show_id" INTEGER NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingSeat" (
    "booking_id" INTEGER NOT NULL,
    "showSeat_id" INTEGER NOT NULL,

    CONSTRAINT "BookingSeat_pkey" PRIMARY KEY ("booking_id","showSeat_id")
);

-- CreateIndex
CREATE INDEX "Seat_screen_id_idx" ON "Seat"("screen_id");

-- CreateIndex
CREATE INDEX "Seat_screen_id_is_active_idx" ON "Seat"("screen_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_screen_id_row_label_seat_number_key" ON "Seat"("screen_id", "row_label", "seat_number");

-- CreateIndex
CREATE INDEX "ShowSeat_show_id_idx" ON "ShowSeat"("show_id");

-- CreateIndex
CREATE INDEX "ShowSeat_show_id_status_idx" ON "ShowSeat"("show_id", "status");

-- CreateIndex
CREATE INDEX "ShowSeat_locked_by_idx" ON "ShowSeat"("locked_by");

-- CreateIndex
CREATE INDEX "ShowSeat_lock_until_idx" ON "ShowSeat"("lock_until");

-- CreateIndex
CREATE UNIQUE INDEX "ShowSeat_show_id_seat_id_key" ON "ShowSeat"("show_id", "seat_id");

-- CreateIndex
CREATE INDEX "Booking_user_id_idx" ON "Booking"("user_id");

-- CreateIndex
CREATE INDEX "Booking_show_id_idx" ON "Booking"("show_id");

-- CreateIndex
CREATE INDEX "Booking_payment_id_idx" ON "Booking"("payment_id");

-- CreateIndex
CREATE INDEX "BookingSeat_booking_id_idx" ON "BookingSeat"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "BookingSeat_showSeat_id_key" ON "BookingSeat"("showSeat_id");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "Screen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowSeat" ADD CONSTRAINT "ShowSeat_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowSeat" ADD CONSTRAINT "ShowSeat_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "Seat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "Show"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSeat" ADD CONSTRAINT "BookingSeat_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSeat" ADD CONSTRAINT "BookingSeat_showSeat_id_fkey" FOREIGN KEY ("showSeat_id") REFERENCES "ShowSeat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
