import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
      users: UsersTable,
      users_groups: UsersGroupsTable,
      posts: PostsTable,
      posts_media: PostsMediaTable,
      posts_groups: PostsGroupsTable,
}

export interface UsersTable {
      id: string,
      created_at: ColumnType<Date, string | undefined, never>,
}

export interface PostsTable {
      id: Generated<number>,
      title: string,
      publishing_date: ColumnType<Date, string, string>,
      is_published: ColumnType<boolean, boolean | undefined>,
      content: string | null,
      user_id: string,
      created_at: ColumnType<Date, string | undefined, never>,
}

export interface PostsMediaTable {
      id: Generated<number>,
      post_id: number,
      type: "audio" | "video" | "image",
      file_id: string,
      created_at: ColumnType<Date, string | undefined, never>,
}

export interface UsersGroupsTable {
      id: Generated<number>,
      user_id: ColumnType<string, string, never>,
      group_id: string,
      group_name: string,
      group_photo_url: string | null,
      created_at: ColumnType<Date, string | undefined, never>,
}

export interface PostsGroupsTable {
      id: Generated<number>,
      post_id: ColumnType<number, number, never>,
      group_id: ColumnType<number, number, never>,
      created_at: ColumnType<Date, string | undefined, never>,
}

export type User = Selectable<UsersTable>
export type NewUser = Insertable<UsersTable>
export type UserUpdate = Updateable<UsersTable>

export type UsersGroup = Selectable<UsersGroupsTable>
export type NewUsersGroup = Insertable<UsersGroupsTable>
export type UsersGroupUpdate = Updateable<UsersGroupsTable>

export type Post = Selectable<PostsTable>
export type NewPost = Insertable<PostsTable>
export type PostUpdate = Updateable<PostsTable>

export type PostMedia = Selectable<PostsMediaTable>
export type NewPostMedia = Insertable<PostsMediaTable>
export type PostMediaUpdate = Updateable<PostsMediaTable>

export type PostsGroup = Selectable<PostsGroupsTable>
export type NewPostsGroup = Insertable<PostsGroupsTable>
export type PostsGroupUpdate = Updateable<PostsGroupsTable>
