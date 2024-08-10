import { Database, User, UsersGroup } from "@repo/db";
import { Group } from "@repo/types";
import { Kysely, sql } from "kysely";

export class UsersService {
      constructor(
            private db: Kysely<Database>,
      ) { }

      public async isUserExists(userIdx: User["id"]): Promise<boolean> {
            const user = await this.db.selectFrom("users")
                  .select("id")
                  .where("id", "=", userIdx)
                  .executeTakeFirst();

            return Boolean(user);
      }

      public async registerUser(userIdx: User["id"]): Promise<boolean> {
            const result = this.db
                  .insertInto("users")
                  .values({ id: userIdx })
                  .returning("id")
                  .onConflict((oc) => oc.column("id").doNothing())
                  .executeTakeFirst()

            return Boolean(result);
      }

      public async getGroups(userIdx: User["id"]): Promise<Group[]> {
            const groups = await this.db
                  .selectFrom("users_groups")
                  .select([
                        "users_groups.id",
                        "users_groups.group_name as name",
                        "users_groups.group_photo_url as photo_url",
                        sql<string>`to_char(users_groups.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                  ])
                  .where("users_groups.user_id", "=", userIdx)
                  .execute();

            return groups;
      }

      public async createGroup(userIdx: User["id"], group: Group): Promise<Group> {
            const groupExists = await this.db.selectFrom("users_groups")
                  .select("id")
                  .where("user_id", "=", userIdx)
                  .where("group_id", "=", group.id.toString())
                  .executeTakeFirst();

            if (groupExists) {
                  throw new Error("Group already exists");
            }

            const createdGroup = await this.db.
                  insertInto("users_groups")
                  .values({
                        user_id: userIdx,
                        group_name: group.name,
                        group_photo_url: group.photo_url,
                        group_id: group.id.toString(),
                  })
                  .returning([
                        "id",
                        "group_name as name",
                        "group_photo_url as photo_url",
                        sql<string>`to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                  ])
                  .executeTakeFirstOrThrow();

            return createdGroup;
      }

      public async updateGroup(userIdx: User["id"], group: Group): Promise<Group> {
            const updatedGroup = await this.db
                  .updateTable("users_groups")
                  .set({
                        group_name: group.name,
                        group_photo_url: group.photo_url,
                        group_id: group.id.toString(),
                  })
                  .where("user_id", "=", userIdx)
                  .where("group_id", "=", group.id.toString())
                  .returning([
                        "id",
                        "group_name as name",
                        "group_photo_url as photo_url",
                        sql<string>`to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                  ])
                  .executeTakeFirstOrThrow();

            return updatedGroup;
      }

      public async deleteGroup(groupId: UsersGroup["group_id"]): Promise<void> {
            console.log("Delete group", groupId);
            await this.db
                  .deleteFrom("users_groups")
                  .where("group_id", "=", groupId)
                  .execute();
      }
}
