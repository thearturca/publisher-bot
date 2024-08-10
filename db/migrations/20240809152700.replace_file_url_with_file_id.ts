import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
      await db.schema.alterTable("posts_media")
            .renameColumn("url", "file_id")
            .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
      await db.schema.alterTable("posts_media")
            .renameColumn("file_id", "url")
            .execute()
}
