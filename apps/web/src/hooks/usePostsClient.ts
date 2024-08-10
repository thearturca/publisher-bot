"use client";

import { PostsClient } from "@/services/PostsClient";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";

export function usePostsClient(): PostsClient {
      const launchParams = useLaunchParams();
      const [postClient, setPostClient] = useState<PostsClient>(new PostsClient(launchParams.initDataRaw ?? ""));

      useEffect(() => {
            if (!launchParams.initDataRaw)
                  return;

            setPostClient(new PostsClient(launchParams.initDataRaw));
      }, [launchParams]);

      return postClient;
}
