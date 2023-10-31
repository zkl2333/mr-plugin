export const request = {
  post: (url: string, data: any) => {
    const token = localStorage.getItem("accessToken");
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    return fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
  },
  get: (
    url: string,
    query?: string | Record<string, string> | URLSearchParams | string[][] | undefined
  ) => {
    let newUrl = url;
    const token = localStorage.getItem("accessToken");
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    if (query) {
      const queryString = new URLSearchParams(query).toString();
      newUrl = `${url}?${queryString}`;
    }
    return fetch(newUrl, {
      method: "GET",
      headers,
    });
  },
};
