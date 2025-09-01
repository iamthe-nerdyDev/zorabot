-- AlterTable
ALTER TABLE `alerts` ADD COLUMN `watchlistId` VARCHAR(191) NULL,
    MODIFY `coinAddress` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_watchlistId_fkey` FOREIGN KEY (`watchlistId`) REFERENCES `watchlist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
