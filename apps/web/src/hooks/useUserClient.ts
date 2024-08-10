"use client";

import { UserClient } from "@/services/UserClient";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";

export function useUserClient(): UserClient {
      const launchParams = useLaunchParams();
      const [postClient, setPostClient] = useState<UserClient>(new UserClient(launchParams.initDataRaw ?? ""));

      useEffect(() => {
            if (!launchParams.initDataRaw)
                  return;

            setPostClient(new UserClient(launchParams.initDataRaw));
      }, [launchParams]);

      return postClient;
}
