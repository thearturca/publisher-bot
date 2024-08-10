"use client";

import CreatePostComponent from "@/components/Posts/createPost.component";
import { useBackButton } from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewPostPage() {
      const backButton = useBackButton();
      const router = useRouter();

      useEffect(() => {
            backButton.show();
            backButton.on("click", () => {
                  router.back();
            });

            return () => {
                  backButton.hide();
            }
      }, []);
      return (
            <div className="flex flex-col gap-8">
                  <CreatePostComponent />
            </div>
      );
}
