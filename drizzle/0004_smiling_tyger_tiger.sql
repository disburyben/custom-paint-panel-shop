CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`featuredImageKey` varchar(500),
	`featuredImageUrl` varchar(1000),
	`category` varchar(100),
	`tags` text,
	`isPublished` int NOT NULL DEFAULT 0,
	`publishedAt` timestamp,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isFeatured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `business_info` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`email` varchar(320) NOT NULL,
	`address` text NOT NULL,
	`businessHours` text NOT NULL,
	`instagram` varchar(255),
	`facebook` varchar(255),
	`twitter` varchar(255),
	`youtube` varchar(255),
	`aboutText` text,
	`mission` text,
	`yearsInBusiness` int,
	`projectsCompleted` int,
	`satisfactionRate` int,
	`logoUrl` varchar(1000),
	`heroImageUrl` varchar(1000),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_info_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`beforeImageKey` varchar(500) NOT NULL,
	`beforeImageUrl` varchar(1000) NOT NULL,
	`afterImageKey` varchar(500) NOT NULL,
	`afterImageUrl` varchar(1000) NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isFeatured` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`shortDescription` varchar(500),
	`startingPrice` int,
	`priceDescription` varchar(255),
	`features` text,
	`turnaroundTime` varchar(255),
	`iconKey` varchar(500),
	`iconUrl` varchar(1000),
	`imageKey` varchar(500),
	`imageUrl` varchar(1000),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerTitle` varchar(255),
	`customerImage` varchar(1000),
	`quote` text NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`isApproved` int NOT NULL DEFAULT 0,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isFeatured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
