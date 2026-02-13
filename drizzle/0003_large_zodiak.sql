CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(255),
	`productId` int NOT NULL,
	`variantId` int,
	`quantity` int NOT NULL DEFAULT 1,
	`price` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gift_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`orderId` int,
	`orderItemId` int,
	`amount` int NOT NULL,
	`balance` int NOT NULL,
	`recipientEmail` varchar(320),
	`recipientName` varchar(255),
	`message` text,
	`status` enum('active','redeemed','expired','cancelled') NOT NULL DEFAULT 'active',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`redeemedAt` timestamp,
	CONSTRAINT `gift_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `gift_certificates_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`variantId` int,
	`productName` varchar(255) NOT NULL,
	`variantName` varchar(255),
	`productImage` varchar(500),
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	`total` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`userId` int,
	`customerEmail` varchar(320) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(50),
	`shippingAddress` text NOT NULL,
	`subtotal` int NOT NULL,
	`shippingCost` int NOT NULL DEFAULT 0,
	`tax` int NOT NULL DEFAULT 0,
	`discount` int DEFAULT 0,
	`total` int NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`stripeCheckoutSessionId` varchar(255),
	`paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`trackingNumber` varchar(255),
	`shippingCarrier` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`shippedAt` timestamp,
	`deliveredAt` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(100),
	`size` varchar(50),
	`color` varchar(50),
	`price` int NOT NULL,
	`inventoryQuantity` int DEFAULT 0,
	`stripePriceId` varchar(255),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_variants_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_variants_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`type` enum('merchandise','gift_certificate') NOT NULL,
	`basePrice` int NOT NULL,
	`compareAtPrice` int,
	`trackInventory` int NOT NULL DEFAULT 1,
	`inventoryQuantity` int DEFAULT 0,
	`allowBackorder` int NOT NULL DEFAULT 0,
	`category` varchar(100),
	`images` text,
	`hasVariants` int NOT NULL DEFAULT 0,
	`featured` int NOT NULL DEFAULT 0,
	`displayOrder` int DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`stripeProductId` varchar(255),
	`stripePriceId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
