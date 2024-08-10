import { Router } from "express";
import asyncHandler from "express-async-handler"
import { Kysely } from "kysely";
import { Database } from "@repo/db";
import multer from "multer";
import { PostsService, TelegramService } from "../../services/index.js";
import { getInitData } from "../../middleware/index.js";
import { BadRequestError } from "../../errors/index.js";
import { Api, InputFile, InputMediaBuilder } from "grammy";
import { CreatePostMediaDto, CreatePostValdator } from "@repo/types";

export function postsRouter(db: Kysely<Database>, telegramApi: Api): Router {
      const posts = Router();

      const postsService = new PostsService(db);
      const telegramService = new TelegramService(telegramApi);

      posts.get('/', asyncHandler(async (req, res) => {
            const initData = getInitData(res);
            const userId = initData!.user!.id.toString();

            const posts = await postsService.getPosts(userId);

            res.json(posts);
      }));

      posts.get('/:id', asyncHandler(async (req, res) => {
            const id = Number(req.params.id);

            if (!id)
                  throw new BadRequestError("Post ID is required");

            const initData = getInitData(res);
            const userId = initData!.user!.id.toString();

            const post = await postsService.getPost(userId, id);

            res.json(post);
      }));

      posts.post('/', asyncHandler(async (req, res) => {
            if (!req.body)
                  throw new BadRequestError("Post body is required");

            if (!req.headers["content-type"]?.includes("application/json"))
                  throw new BadRequestError("Content type must be application/json");

            const initData = getInitData(res);
            const userId = initData!.user!.id.toString();

            const validatedPost = CreatePostValdator.safeParse(req.body);

            if (!validatedPost.success)
                  throw new BadRequestError(validatedPost.error.message);

            const post = validatedPost.data;

            const desiredMediaType = post.media[0]?.type;

            if (!desiredMediaType)
                  throw new BadRequestError("Media type is required");

            if (post.media.some(media => media.type !== desiredMediaType))
                  throw new BadRequestError(`All media types must be ${desiredMediaType}`);

            const createdPost = await postsService.createPost(userId, post)

            res.status(201).json(createdPost);
      }));

      posts.delete('/:id', asyncHandler(async (req, res) => {
            const id = Number(req.params.id);

            if (!id)
                  throw new BadRequestError("Post ID is required");

            const initData = getInitData(res);
            const userId = initData!.user!.id.toString();

            await postsService.deletePost(userId, id);

            res.status(204).end();
      }));

      const upload = multer();

      posts.post("/files", upload.array("files", 10), asyncHandler(async (req, res) => {
            const initData = getInitData(res);
            const userId = initData!.user!.id.toString();

            const files = req.files

            if (!files)
                  throw new BadRequestError("Files is required");

            if (!Array.isArray(files) || !files.length)
                  throw new BadRequestError("Files must be an array");

            const mediaTypes = files.map(f => postsService.mimeTypeToMediaType(f.mimetype));
            const mediaTypesSet = new Set(mediaTypes);

            if (mediaTypesSet.size !== 1)
                  throw new BadRequestError("All files must have the same media type");

            const desiredMediaType = mediaTypes[0]!;


            const inputFiles = files.map(f => {
                  const inputFile = new InputFile(f.buffer, f.originalname);
                  switch (desiredMediaType) {
                        case "image":
                              return InputMediaBuilder.photo(inputFile);
                        case "audio":
                              return InputMediaBuilder.audio(inputFile);
                        case "video":
                              return InputMediaBuilder.video(inputFile);
                  }
            });

            const mediaGroup = await telegramApi.sendMediaGroup(userId, inputFiles, {
                  disable_notification: true,
            });

            const uploadedFiles: CreatePostMediaDto[] = []

            for (const media of mediaGroup) {

                  let file_id: string | undefined = undefined;
                  let name: string | undefined = undefined;

                  switch (true) {
                        case "photo" in media:
                              let size = 0;

                              for (const photo of media.photo) {
                                    if (photo.file_size && photo.file_size > size) {
                                          size = photo.file_size;
                                          file_id = photo.file_id;
                                    }
                              }
                              break;

                        case "audio" in media:
                              file_id = media.audio.file_id;
                              name = media.audio.file_name;
                              break;
                        case "video" in media:
                              file_id = media.video.file_id;
                              name = media.video.file_name;
                              break;
                  }

                  if (!file_id)
                        throw new BadRequestError("Failed to upload file");

                  await telegramApi.deleteMessage(userId, media.message_id);

                  uploadedFiles.push({
                        type: desiredMediaType,
                        file_id: file_id,
                        name: name ?? `${desiredMediaType}_file`,
                  });
            }

            res.status(201).json(uploadedFiles);
      }));

      return posts;
}
