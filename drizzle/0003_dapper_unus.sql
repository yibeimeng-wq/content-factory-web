CREATE TABLE `trafficSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceType` varchar(50) NOT NULL,
	`referrer` text,
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`landingPage` text,
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trafficSources_id` PRIMARY KEY(`id`)
);
