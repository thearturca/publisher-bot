"use client";

import CreatePostComponent from "@/components/Posts/createPost.component";
import { useQuery } from "@tanstack/react-query";
import { usePostsClient } from "@/hooks/usePostsClient";
import PostComponent from "@/components/Posts/post.component";
import { Divider } from "@telegram-apps/telegram-ui";

export default function Home() {
      const postsClient = usePostsClient();

      const { data: posts } = useQuery({
            queryKey: ["posts"],
            queryFn: () => postsClient.getPosts(),
      });

      return (
            <div className="flex flex-col gap-8">
                  <CreatePostComponent />
                  <div>
                        {posts?.map((post) => (
                              <>
                                    <PostComponent post={post} key={post.id} />
                                    <Divider />
                              </>
                        ))}
                  </div>
            </div>
      );
}
