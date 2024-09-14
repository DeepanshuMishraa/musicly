/*
  Warnings:

  - You are about to drop the column `author` on the `Space` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Space" DROP COLUMN "author";

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "startedAt" TIMESTAMP(3);
