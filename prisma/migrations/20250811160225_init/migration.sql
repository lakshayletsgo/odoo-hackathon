/*
  Warnings:

  - The values [ACTIVE,COMPLETED] on the enum `InviteStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `JoinRequest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `playersLeft` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."JoinRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."InviteStatus_new" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');
ALTER TABLE "public"."Invite" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Invite" ALTER COLUMN "status" TYPE "public"."InviteStatus_new" USING ("status"::text::"public"."InviteStatus_new");
ALTER TYPE "public"."InviteStatus" RENAME TO "InviteStatus_old";
ALTER TYPE "public"."InviteStatus_new" RENAME TO "InviteStatus";
DROP TYPE "public"."InviteStatus_old";
ALTER TABLE "public"."Invite" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'VENUE_OWNER';

-- DropForeignKey
ALTER TABLE "public"."JoinRequest" DROP CONSTRAINT "JoinRequest_inviteId_fkey";

-- AlterTable
ALTER TABLE "public"."Invite" ADD COLUMN     "playersLeft" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- DropTable
DROP TABLE "public"."JoinRequest";

-- DropEnum
DROP TYPE "public"."RequestStatus";

-- CreateTable
CREATE TABLE "public"."join_requests" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "joinerName" TEXT NOT NULL,
    "contactDetails" TEXT NOT NULL,
    "playersCount" INTEGER NOT NULL,
    "status" "public"."JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "join_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."join_requests" ADD CONSTRAINT "join_requests_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "public"."Invite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
