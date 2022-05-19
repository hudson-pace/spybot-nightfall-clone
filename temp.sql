BEGIN;

CREATE SEQUENCE item_ids
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE item_ids OWNER TO syncmatrix;

CREATE SEQUENCE group_ids
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE group_ids OWNER TO syncmatrix;

CREATE SEQUENCE project_ids
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE project_ids OWNER TO syncmatrix;

CREATE SEQUENCE aws_ids
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE aws_ids OWNER TO syncmatrix;

CREATE SEQUENCE desc_ids
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE desc_ids OWNER TO syncmatrix;

CREATE SEQUENCE content_ids
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE content_ids OWNER TO syncmatrix;

COMMIT;

BEGIN;

CREATE TABLE "items" (
  "item_id" Bigint NOT NULL DEFAULT nextval('item_ids'),
  "project_id" Bigint NOT NULL,
  "group_id" Bigint,
  "type" Character VARYING(256),
  "start_time" Character VARYING(256),
  "end_time" Character VARYING(256),
  "is_start_defined" BOOLEAN NOT NULL,
  "is_end_defined" BOOLEAN NOT NULL,
  "top" Int,
  "stack" Boolean NOT NULL,
  "class_name" Character VARYING(256),
  "background_color" Character VARYING(256),
  "outline_color" Character VARYING(256),
  "outline_width" Character VARYING(256),
  "outline_style" Character VARYING(256),
  "icon" Character VARYING(256),
  "icon_color" Character VARYING(256),
  "icon_size" Character VARYING(256),
  "icon_left" Int,
  "icon_top" Int,
  "justify_content" Character VARYING(256),
  "classification" Character VARYING(256),
  "classification_ext" Character VARYING(256),
  "private" Boolean NOT NULL,
  "timestamp" Bigint NOT NULL,
  PRIMARY KEY ("item_id")
);
ALTER TABLE items OWNER TO syncmatrix;

CREATE TABLE "groups" (
  "group_id" Bigint NOT NULL DEFAULT nextval('group_ids'),
  "project_id" Bigint NOT NULL,
  "subgroup_id" Bigint,
  "type" Character VARYING(256),
  "group_order" Int NOT NULL,
  "class_name" Character VARYING(256),
  "foreground_color" Character VARYING(256),
  "background_color" Character VARYING(256),
  "outline_color" Character VARYING(256),
  "outline_width" Character VARYING(256),
  "outline_style" Character VARYING(256),
  "icon" Character VARYING(256),
  "icon_color" Character VARYING(256),
  "icon_size" Character VARYING(256),
  "justify_content" Character VARYING(256),
  "private" Boolean NOT NULL,
  "timestamp" Bigint NOT NULL,
  PRIMARY KEY ("group_id")
);
ALTER TABLE groups OWNER TO syncmatrix;

CREATE TABLE "projects" (
  "project_id" Bigint NOT NULL DEFAULT nextval('project_ids'),
  "type" Character VARYING(256),
  "ruler_metadata" Text,
  "start_time" Character VARYING(256),
  "end_time" Character VARYING(256),
  "group_width" Character VARYING(32),
  "banner" Text,
  "background_color" Character VARYING(256),
  "icon" Character VARYING(256),
  "icon_color" Character VARYING(256),
  "icon_size" Character VARYING(256),
  "private" Boolean NOT NULL,
  "timestamp" Bigint NOT NULL,
  "user_id" Character VARYING(256),
  PRIMARY KEY ("project_id")
);
ALTER TABLE projects OWNER TO syncmatrix;

CREATE TABLE "lines" (
  "line_id" Bigint NOT NULL DEFAULT nextval('item_ids'),
  "project_id" Bigint NOT NULL,
  "type" Character VARYING(256),
  "arrow_left" Boolean,
  "arrow_right" Boolean,
  "screen_left" Int,
  "screen_top" Int,
  "left_anchor_x" Character VARYING(256),
  "left_anchor_y" Character VARYING(256),
  "right_anchor_x" Character VARYING(256),
  "right_anchor_y" Character VARYING(256),
  "left_connector" Bigint,
  "right_connector" Bigint,
  "start_time" Character VARYING(256),
  "end_time" Character VARYING(256),
  "x1" Int,
  "y1" Int,
  "x2" Int,
  "y2" Int,
  "width" Int,
  "transform" Character VARYING(256),
  "outline_color" Character VARYING(256),
  "outline_width" Character VARYING(256),
  "outline_style" Character VARYING(256),
  PRIMARY KEY ("line_id")
);
ALTER TABLE lines OWNER TO syncmatrix;

CREATE TABLE "descriptions" (
  "desc_id" BIGINT NOT NULL DEFAULT nextval('desc_ids'),
  "type" CHARACTER VARYING(256),
  "type_id" BIGINT NOT NULL,
  "classification" CHARACTER VARYING(256),
  "classification_ext" CHARACTER VARYING(256),
  "text" Text,
  "private" Boolean NOT NULL
);
ALTER TABLE descriptions OWNER TO syncmatrix;

CREATE TABLE "content_items" (
  "content_id" BIGINT NOT NULL DEFAULT nextval('content_ids'),
  "type" CHARACTER VARYING(256),
  "type_id" BIGINT NOT NULL,
  "classification" CHARACTER VARYING(256),
  "classification_ext" CHARACTER VARYING(256),
  "text" Text,
  "color" CHARACTER VARYING(256),
  "font_size" Int,
  "font_style" Text,
  "font_weight" CHARACTER VARYING(256),
  "text_align" CHARACTER VARYING(256),
  "text_decoration" CHARACTER VARYING(256),
  "text_color_overridden" Boolean,
  PRIMARY KEY ("content_id")
);
ALTER TABLE content_items OWNER TO syncmatrix;

CREATE TABLE "default_colors" (
  "name" Character VARYING(100),
  "var_name" Character VARYING(100),
  "color" Character VARYING(100),
  "changed" Boolean NOT NULL,
  PRIMARY KEY ("name")
);
ALTER TABLE default_colors OWNER TO syncmatrix;

CREATE TABLE "app_wide_settings" (
  "setting_id" Bigint NOT NULL DEFAULT nextval('aws_ids'),
  "setting_category" Character Varying(64),
  "setting_name" Character Varying(64) NOT NULL,
  "setting_value" Character Varying(64) NOT NULL,
  "setting_description" Character Varying(100),
  CONSTRAINT "unique_app_wide_settings_name" UNIQUE ("setting_name"),
  PRIMARY KEY ("setting_id")
);
ALTER TABLE app_wide_settings OWNER TO syncmatrix;

COMMIT;
