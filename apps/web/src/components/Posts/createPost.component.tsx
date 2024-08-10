"use client";

import { Avatar, ButtonCell, Cell, FileInput, Input, LargeTitle, List, Multiselectable, Spinner, Tappable, Textarea, Title } from "@telegram-apps/telegram-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePostsClient } from "@/hooks/usePostsClient";
import { useMainButton, usePopup } from "@telegram-apps/sdk-react";
import { CreatePostDto } from "@repo/types";
import { CreatePostValdator } from "@repo/types";
import { useStore } from "@/hooks/useStore";
import { useEffect } from "react";
import { useUserClient } from "@/hooks/useUserClient";
import { IoMdTrash } from "react-icons/io";

const initPost = {
      title: "",
      content: "",
      media: [],
      groups: [],
      publishing_date: "",
} as const satisfies CreatePostDto;

export default function CreatePostComponent() {
      const [newPost, setNewPost] = useStore<CreatePostDto>(initPost);

      const userClient = useUserClient();

      const { data: userGroups } = useQuery({
            queryKey: ["userGroups"],
            queryFn: () => userClient.getGroups(),
      });
      const postClient = usePostsClient();
      const queryClient = useQueryClient();

      const mainButton = useMainButton();
      const popup = usePopup();

      const createPost = useMutation({
            mutationKey: ["createPost"],
            mutationFn: (post: CreatePostDto) => postClient.createPost(post),
            onSuccess: () => {
                  setNewPost(initPost);
                  queryClient.invalidateQueries({ queryKey: ["posts"] });
                  popup.open({
                        title: "Успешно",
                        message: "Пост создан",
                  })
            },
            onError: () => {
                  popup.open({
                        title: "Ошибка",
                        message: "Не удалось создать пост",
                  })
            }
      })

      const onSubmit = async () => {
            const validation = CreatePostValdator.safeParse(newPost);

            if (!validation.success) {
                  await popup.open({
                        title: "Предупреждение",
                        message: `Не все поля заполнены корректно: ${validation.error.errors.map((item) => item.message)}`,
                  });
                  return;
            }

            createPost.mutate(newPost);
      };

      const uploadFile = useMutation({
            mutationKey: ["uploadFileForPost"],
            mutationFn: (files: File[]) => postClient.uploadFile(files),
            onSuccess: (files) => {
                  for (const file of files) {
                        if (!newPost.media.some((item) => item.file_id === file.file_id))
                              setNewPost((v) => ({
                                    media: [...v.media!, {
                                          file_id: file.file_id,
                                          type: file.type,
                                          name: file.name,
                                    }]
                              }))
                  }

                  setNewPost((v) => ({ media: v.media?.slice(0, 10) }));
            }
      });

      useEffect(() => {
            const validation = CreatePostValdator.safeParse(newPost);

            if (validation.success) {
                  mainButton.show().setText("Создать пост").enable();
            } else {
                  mainButton.hide();
            }

            return;
      }, [newPost]);

      const onMainButtonPress = async () => {
            await onSubmit();
      }

      useEffect(() => {
            mainButton.on("click", onMainButtonPress);

            return () => {
                  mainButton.off("click", onMainButtonPress);
            }
      }, [mainButton, newPost]);

      return (
            <form className="flex flex-col gap-4 py-4">
                  <Cell>
                        <LargeTitle className="ml-10">Новый пост</LargeTitle>
                  </Cell>
                  <List>
                        <Input
                              value={newPost.title}
                              onChange={(e) => setNewPost({ title: e.target.value })}
                              required
                              header="Название"
                        />

                        <Textarea
                              header="Текст поста"
                              value={newPost.content}
                              onChange={(e) => setNewPost({ content: e.target.value })}
                        />
                        <Input
                              value={newPost.publishing_date ? new Date(newPost.publishing_date).toISOString().slice(0, 16) : ""}
                              onChange={(e) => setNewPost({ publishing_date: new Date(e.target.value).toISOString() })}
                              header="Дата и время публикации"

                              type="datetime-local"
                        />

                        <Cell>
                              <Title>Группы и каналы</Title>
                              <List

                                    style={{
                                          background: 'var(--tgui--secondary_bg_color)'
                                    }}>
                                    {userGroups?.map((group) => (
                                          <Cell
                                                key={group.id}
                                                Component="label"
                                                before={group.photo_url && <Avatar src={group.photo_url} />}
                                                after={<Multiselectable
                                                      name="multiselect-gruops"
                                                      checked={newPost.groups.some(g => g.id === group.id)}
                                                      value={group.id}
                                                      onChange={(e) => setNewPost((v) => ({
                                                            groups: e.target.checked ?
                                                                  [...v.groups!, group] :
                                                                  v.groups!.filter(g => g.id !== group.id)
                                                      }))}
                                                />}
                                                multiline
                                          >
                                                {group.name}
                                          </Cell>
                                    ))}
                              </List>
                        </Cell>
                  </List>
                  <List>
                        {
                              uploadFile.isPending
                                    ? <Cell
                                          before={<Spinner size="m" />}
                                    >
                                          Загрузка файлов...
                                    </Cell>
                                    : <FileInput
                                          key="files"
                                          multiple
                                          name="files"
                                          label="Прикрепить файлы (максимум 10)"
                                          onChange={(e) => {
                                                if (e.target.files)
                                                      uploadFile.mutate(Array.from(e.target.files));
                                          }}
                                    />
                        }

                        {newPost.media.map((item) => (
                              <ButtonCell
                                    key={item.file_id}
                                    Component="label"
                                    mode="destructive"
                                    className="flex justify-between"
                                    onClick={() => setNewPost({
                                          media: newPost.media.filter(m => m.file_id !== item.file_id)
                                    })}
                                    after={item.type}
                                    before={(<Tappable Component="div">
                                          <IoMdTrash />
                                    </Tappable>)}
                              >
                                    {item.name}
                              </ButtonCell>
                        ))}
                  </List>
            </form>
      );
}
