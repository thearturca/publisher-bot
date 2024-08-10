"use client";

import { usePostsClient } from "@/hooks/usePostsClient";
import { Post } from "@repo/types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePopup } from "@telegram-apps/sdk-react";
import { ButtonCell, Cell, Title, Spinner, Tappable, Headline, Blockquote } from "@telegram-apps/telegram-ui";
import { useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

export type PostProps = {
      post: Post
}

function ViewPost({ post }: PostProps) {
      const postsClient = usePostsClient();
      const queryClient = useQueryClient();
      const popup = usePopup();

      const deletePost = useMutation({
            mutationKey: ["deletePost"],
            mutationFn: () => postsClient.deletePost(post.id),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["posts"] });
            },
            onError: () => {
                  popup.open({
                        title: "Ошибка",
                        message: "Не удалось удалить пост",
                  })
            }
      });

      return (
            <div className="flex flex-col gap-4">
                  <Cell
                        subhead={<Headline>Текст поста</Headline>}
                  >
                        <Blockquote className="whitespace-pre">{post.content}</Blockquote>
                  </Cell>
                  <Cell
                        subhead={<Headline>Медиа</Headline>}
                  >
                        {post.media.length} {post.media?.[0]?.type}
                  </Cell>
                  <Cell
                        subhead={<Headline>Группы и каналы</Headline>}
                  >
                        {post.groups.map((g) => g.name).join(", ")}
                  </Cell>
                  <ButtonCell
                        before={
                              <Tappable>
                                    {deletePost.isPending ? <Spinner size="s" /> : <IoMdTrash />}
                              </Tappable>
                        }
                        mode="destructive"
                        onClick={() => deletePost.mutate()}
                  >
                        Удалить
                  </ButtonCell>
            </div >
      );
}

export default function PostComponent({ post }: PostProps) {
      const [isShow, setIsEdit] = useState(false);

      return (
            <Cell className="flex flex-row gap-4"
                  after={isShow ? <MdExpandLess className="w-8 h-8" /> : <MdExpandMore className="w-8 h-8" />}
                  onClick={() => setIsEdit((v) => !v)}
                  subtitle={new Date(post.publishing_date).toLocaleString()}
            >
                  <div className="flex justify-between gap-8">
                        <Title>
                              {post.title}
                        </Title>
                  </div>

                  {isShow && <ViewPost post={post} />}
            </Cell>
      );
}
