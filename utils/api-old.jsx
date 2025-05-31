import { baseUrl } from "@/lib/constants";
import { GET, POST } from "./z-fetch";

const _POST = async (resourcesUrl, payload) => {
  const { loading, error, data } = await POST(`${baseUrl}/${resourcesUrl}`, {
    body: JSON.stringify(payload),
  });

  if (error) {
    console.error(error);
    return null;
  }

  return data;
};

const _GET = async (resourcesUrl) => {
  const { loading, error, data } = await GET(`${baseUrl}/${resourcesUrl}`);

  if (error) {
    console.error(error);
    return null;
  }

  return data;
};

export const ndra_api = {
  post: _POST,
  get: _GET,
};
