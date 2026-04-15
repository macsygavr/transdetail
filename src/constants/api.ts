export const API_HOST =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_API_HOST
      ? process.env.NEXT_API_HOST
      : "http://localhost:3000";
