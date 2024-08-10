import { ApiClient } from "./ApiClient";
import { CreatePostDto, Post, CreatePostMediaDto } from "@repo/types";

export class PostsClient extends ApiClient {
      public async createPost(post: CreatePostDto): Promise<Post> {
            const headers = new Headers({
                  "Content-Type": "application/json",
            });

            const createdPost = await this.httpRequest<Post>(
                  "/posts",
                  "POST",
                  undefined,
                  JSON.stringify(post),
                  headers
            );

            if (typeof createdPost !== "object") {
                  throw new Error("Failed to create post", { cause: post });
            }

            return createdPost;
      }

      public async getPosts(): Promise<Post[]> {
            const posts = await this.httpRequest<Post[]>("/posts", "GET");

            if (!Array.isArray(posts)) {
                  throw new Error("Failed to get posts", { cause: posts });
            }

            return posts;
      }

      public async getPost(id: number): Promise<Post> {
            const post = await this.httpRequest<Post>(`/posts/${id}`, "GET");

            if (typeof post !== "object") {
                  throw new Error("Failed to get post", { cause: post });
            }

            return post;
      }

      public async deletePost(id: number): Promise<void> {
            await this.httpRequest<void>(`/posts/${id}`, "DELETE");
            return;
      }

      public async uploadFile(files: File[]): Promise<CreatePostMediaDto[]> {
            const formData = new FormData();

            for (const file of files)
                  formData.append("files", file);

            const response = await this.httpRequest<CreatePostMediaDto[]>(
                  "/posts/files",
                  "POST",
                  undefined,
                  formData
            );

            if (!Array.isArray(response)) {
                  throw new Error("Failed to upload file", { cause: response });
            }

            return response;
      }
}
