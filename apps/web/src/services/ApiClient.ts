import { env } from "../env";

export class ApiClient {
      constructor(
            private readonly rawInitData: string,
            protected readonly baseUrl: string = `${env.NEXT_PUBLIC_BACKEND_URL}/api`,
      ) {

      }

      protected addAuthorizationHeader(headers: Headers) {
            headers.append("Authorization", `tma ${this.rawInitData}`);
      }

      protected async httpRequest<T>(
            endpoint: `/${string}`,
            method: "GET" | "POST" | "PUT" | "DELETE",
            query?: URLSearchParams,
            body?: string | FormData,
            headers: Headers = new Headers(),
      ): Promise<T | string> {

            this.addAuthorizationHeader(headers);

            const response = await fetch(`${this.baseUrl}${endpoint}${new URLSearchParams(query)}`, {
                  method,
                  headers,
                  body,
            });

            if (response.status >= 400) {
                  throw new Error(await response.text());
            }

            if (response.headers.get("Content-Type")?.includes("application/json")) {
                  return (await response.json()) as T;
            }

            return await response.text();
      }
}
