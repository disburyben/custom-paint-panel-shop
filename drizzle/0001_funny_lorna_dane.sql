CREATE TABLE `quote_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(100),
	`fileSize` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quote_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`vehicleType` varchar(100) NOT NULL,
	`vehicleMake` varchar(100),
	`vehicleModel` varchar(100),
	`vehicleYear` varchar(10),
	`serviceType` varchar(100) NOT NULL,
	`paintFinish` varchar(100),
	`description` text,
	`budget` varchar(50),
	`timeline` varchar(50),
	`status` enum('new','reviewed','quoted','accepted','declined','completed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_submissions_id` PRIMARY KEY(`id`)
);
