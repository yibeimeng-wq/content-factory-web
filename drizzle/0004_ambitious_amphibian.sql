CREATE TABLE `apiLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`operation` varchar(100) NOT NULL,
	`model` varchar(50),
	`promptSummary` text,
	`promptTokens` int,
	`completionTokens` int,
	`totalTokens` int,
	`responseTime` int,
	`success` int NOT NULL DEFAULT 1,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiLogs_id` PRIMARY KEY(`id`)
);
