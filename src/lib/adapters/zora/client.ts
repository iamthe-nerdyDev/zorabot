import { DEBUG, ZORA_API_BASE_URL, ZORA_API_KEY } from "@/lib/constants";
import { HttpClient } from "@/lib/http.util";
import { AxiosError, type AxiosResponse } from "axios";

export default class ZoraClient extends HttpClient {
  constructor() {
    super({
      baseURL: ZORA_API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": ZORA_API_KEY,
      },
    });
  }

  _handleResponse({ data }: AxiosResponse<any>) {
    if (DEBUG) console.dir(data, { depth: null });
    return { error: false, data };
  }

  _handleError(error: AxiosError<any>) {
    if (DEBUG) console.dir(error.toJSON(), { depth: null });

    if (error.response) {
      const { data } = error.response;
      if (data) {
        return {
          error: true,
          message: error.message,
          data,
        };
      }
    }

    return { error: true, message: error.message };
  }

  getInstance() {
    return this.instance;
  }
}
