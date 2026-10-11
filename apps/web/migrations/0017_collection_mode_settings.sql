CREATE TABLE `collection_mode_settings` (
	`collection_id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`mode` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_by_user_id` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`updated_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`collection_id`,`workspace_id`) REFERENCES `collections`(`id`,`workspace_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "collection_mode_settings_mode_check" CHECK("collection_mode_settings"."mode" in ('general', 'home')),
	CONSTRAINT "collection_mode_settings_revision_check" CHECK(typeof("collection_mode_settings"."revision") = 'integer' and "collection_mode_settings"."revision" between 1 and 9007199254740991)
);
