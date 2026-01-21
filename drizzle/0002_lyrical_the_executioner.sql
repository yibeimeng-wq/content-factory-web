CREATE TABLE `videoPlaybacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoType` varchar(50) NOT NULL,
	`duration` int,
	`completed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videoPlaybacks_id` PRIMARY KEY(`id`)
);
