CREATE TABLE `sprayers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`title` varchar(255),
	`bio` text,
	`logoKey` varchar(500),
	`logoUrl` varchar(1000),
	`certifications` text,
	`isActive` int NOT NULL DEFAULT 1,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sprayers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `gallery_items` MODIFY COLUMN `beforeImageKey` varchar(500);--> statement-breakpoint
ALTER TABLE `gallery_items` MODIFY COLUMN `beforeImageUrl` varchar(1000);--> statement-breakpoint
ALTER TABLE `gallery_items` MODIFY COLUMN `afterImageKey` varchar(500);--> statement-breakpoint
ALTER TABLE `gallery_items` MODIFY COLUMN `afterImageUrl` varchar(1000);--> statement-breakpoint
ALTER TABLE `gallery_items` ADD `vehicleType` varchar(100);--> statement-breakpoint
ALTER TABLE `gallery_items` ADD `servicesProvided` varchar(500);--> statement-breakpoint
ALTER TABLE `gallery_items` ADD `sprayerId` int;