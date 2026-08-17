CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(180) NOT NULL,
	`size` varchar(32) NOT NULL,
	`unitPriceCents` int NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`customerName` varchar(180) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(32) NOT NULL,
	`postalCode` varchar(16) NOT NULL,
	`address` text NOT NULL,
	`paymentMethod` enum('pix','credit','boleto') NOT NULL,
	`paymentStatus` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`totalCents` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`slug` varchar(210) NOT NULL,
	`category` enum('Camisetas','Bermudas','Kits','Calças','Calçados','Esportivo','Perfumes','Acessórios') NOT NULL,
	`description` text NOT NULL,
	`priceCents` int NOT NULL,
	`compareAtPriceCents` int,
	`sizes` text NOT NULL,
	`imageUrl` text NOT NULL,
	`badge` varchar(40),
	`accentColor` varchar(20) NOT NULL DEFAULT '#7affb9',
	`stock` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
