"use client"

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
})

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null
  const tokens = document.cookie.split(";")
  for (const token of tokens) {
    const [name, value] = token.trim().split("=")
    if (name === "XSRF-TOKEN") {
      return decodeURIComponent(value)
    }
  }
  return null
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const csrfToken = getCsrfToken()
    if (csrfToken && config.headers) {
      config.headers["X-XSRF-TOKEN"] = csrfToken
    }
    const token = localStorage.getItem("token")
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  if (match) return decodeURIComponent(match[2])
  return null
}