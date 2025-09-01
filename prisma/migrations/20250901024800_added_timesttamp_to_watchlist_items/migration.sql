/*
  Warnings:

  - Added the required column `updatedAt` to the `watchlist_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `watchlist_items` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
