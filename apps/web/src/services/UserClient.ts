import { Group } from "@repo/types";
import { ApiClient } from "./ApiClient";

export class UserClient extends ApiClient {
      public async getGroups(): Promise<Group[]> {
            const groups = await this.httpRequest<Group[]>("/user/groups", "GET");

            if (!Array.isArray(groups)) {
                  throw new Error("Failed to get groups", { cause: groups });
            }

            return groups;
      }
}
