"use client";

import { IoIosAddCircleOutline } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import { usePostsClient } from "@/hooks/usePostsClient";
import PostComponent from "@/components/Posts/post.component";
import { useState } from "react";
import { Button, ButtonCell, Divider, List, Modal, Placeholder, SegmentedControl, Spinner, Text, Title } from "@telegram-apps/telegram-ui";
import { useRouter } from "next/navigation";
import { useUserClient } from "@/hooks/useUserClient";
import { ModalHeader } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader";

export default function PostsPage() {
      const [isPublished, setIsPublished] = useState(false);

      const userClient = useUserClient();
      const postsClient = usePostsClient();

      const { data: userGroups } = useQuery({
            queryKey: ["userGroups"],
            queryFn: () => userClient.getGroups(),
      });

      const { data: posts } = useQuery({
            queryKey: ["posts"],
            queryFn: () => postsClient.getPosts(),
      });

      const router = useRouter();

      if (!userGroups) {
            return <Spinner size="m" />;
      }

      if (userGroups.length === 0) {
            return <Placeholder
                  header="Вы не состоите ни в одной группе"
                  description={
                        <Modal
                              header={<ModalHeader>Only iOS header</ModalHeader>}
                              trigger={
                                    <Button
                                          mode="bezeled"
                                    >
                                          Как добавить группу
                                    </Button>
                              }>
                              <Placeholder >
                                    <Title>Как добавить бота группу</Title>
                                    <Text>Только после добавления группы вы сможете создавать посты.</Text>
                                    <Text>Для того, чтобы добавить группу, перейдите в личные сообщения к боту, затем нажмите на имя бота в верней части диалога.</Text>
                                    <Text>В открывшемся окне нажмите на кнопку "Добавить в группу".</Text>
                                    <Text>Нажмите на группу и затем нажмите "Ok".</Text>
                              </Placeholder>
                        </Modal>
                  }
            >
                  <img
                        alt="Telegram sticker"
                        className="blt0jZBzpxuR4oDhJc8s"
                        src="https://xelene.me/telegram.gif"
                  />
            </Placeholder>;
      }

      return (
            <div className="flex flex-col">
                  <ButtonCell
                        before={<IoIosAddCircleOutline />}
                        onClick={() => router.push("/posts/new")}
                  >
                        Новый пост
                  </ButtonCell>
                  <Divider />
                  <List style={{
                        background: 'var(--tgui--secondary_bg_color)'
                  }}>
                        {posts?.filter(post => post.is_published === isPublished).map((post) => (
                              <PostComponent post={post} key={post.id} />
                        ))}
                  </List>
                  <div
                        className="bottom-0 left-0 right-0 fixed"
                        style={{ background: 'var(--tgui--secondary_bg_color)' }}
                  >
                        <SegmentedControl>
                              <SegmentedControl.Item
                                    onClick={() => setIsPublished(false)}
                                    selected={!isPublished}
                              >
                                    <div
                                          className="flex flex-col gap-0"
                                    >
                                          <span>{posts?.filter(post => post.is_published === false).length}</span>
                                          <span>Запланированные</span>
                                    </div>
                              </SegmentedControl.Item>
                              <SegmentedControl.Item
                                    selected={isPublished}
                                    onClick={() => setIsPublished(true)}
                              >
                                    <div
                                          className="flex flex-col gap-0"
                                    >
                                          <span className="font-bold">{posts?.filter(post => post.is_published === true).length}</span>
                                          <span>Обработанные</span>
                                    </div>
                              </SegmentedControl.Item>
                        </SegmentedControl>
                  </div>
            </div>
      );
}

