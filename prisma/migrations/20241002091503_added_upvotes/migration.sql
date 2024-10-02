/*
  Warnings:

  - Added the required column `upvotes` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "upvotes" INTEGER NOT NULL;
