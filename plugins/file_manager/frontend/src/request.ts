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
  get: (url: string) => {
    const token = localStorage.getItem("accessToken");
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    return fetch(url, {
      method: "GET",
      headers,
    });
  },
};
