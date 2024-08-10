import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
      await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

      await db.schema.createTable("users")
            .ifNotExists()
            .addColumn("id", "int8", col => col.primaryKey())
            .addColumn("created_at", "timestamp", col => col.defaultTo(sql`now()`))
            .execute();

      await db.schema.createTable("users_groups")
            .ifNotExists()
            .addColumn("id", "serial", col => col.primaryKey())
            .addColumn("user_id", "int8", col => col.notNull().references("users.id").onUpdate("cascade").onDelete("cascade"))
            .addColumn("group_id", "int8", col => col.notNull())
            .addColumn("group_name", "varchar(128)", col => col.notNull())
            .addColumn("group_photo_url", "text")
            .addColumn("created_at", "timestamp", col => col.defaultTo(sql`now()`))
            .execute();

      await db.schema.createTable("posts")
            .ifNotExists()
            .addColumn("id", "serial", col => col.primaryKey())
            .addColumn("title", "varchar(255)", col => col.notNull())
            .addColumn("publishing_date", "timestamp", col => col.notNull())
            .addColumn("is_published", "boolean", col => col.notNull().defaultTo(false))
            .addColumn("content", "text")
            .addColumn("user_id", "int8", col => col.notNull().references("users.id").onUpdate("cascade").onDelete("cascade"))
            .addColumn("created_at", "timestamp", col => col.defaultTo(sql`now()`))
            .execute();

      await db.schema.createTable("posts_media")
            .ifNotExists()
            .addColumn("id", "serial", col => col.primaryKey())
            .addColumn("post_id", "int4", col => col.notNull().references("posts.id").onUpdate("cascade").onDelete("cascade"))
            .addColumn("type", "varchar(32)", col => col.notNull())
            .addColumn("url", "text", col => col.notNull())
            .addColumn("created_at", "timestamp", col => col.defaultTo(sql`now()`))
            .execute()

      await db.schema.createTable("posts_groups")
            .ifNotExists()
            .addColumn("id", "serial", col => col.primaryKey())
            .addColumn("post_id", "int4", col => col.notNull().references("posts.id").onUpdate("cascade").onDelete("cascade"))
            .addColumn("group_id", "int4", col => col.notNull().references("users_groups.id").onUpdate("cascade").onDelete("cascade"))
            .addColumn("created_at", "timestamp", col => col.defaultTo(sql`now()`))
            .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
      await db.schema.dropTable("posts_groups").execute();
      await db.schema.dropTable("posts_media").execute();
      await db.schema.dropTable("posts").execute();
      await db.schema.dropTable("users_groups").execute();
      await db.schema.dropTable("users").execute();
}
