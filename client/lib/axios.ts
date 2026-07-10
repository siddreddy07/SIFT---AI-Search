import axios from "axios"

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL!

export const getWsUrl = (path: string) =>
  BASE_URL.replace(/^http/, "ws") + path

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export default api
