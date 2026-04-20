"use client"

import { api } from "./api"
import { AxiosError } from "axios"

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  message: string
  user: {
    id: number
    name: string
    email: string
  }
  token: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

async function handleError(error: unknown): Promise<ApiError> {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiError
    if (data.errors) {
      const firstError = Object.values(data.errors).flat()[0]
      return { message: firstError || data.message }
    }
    return { message: data.message }
  }
  return { message: "Erro de conexão. Tente novamente." }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/login", payload)
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    return data
  } catch (error) {
    const err = await handleError(error)
    throw new Error(err.message)
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/register", payload)
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    return data
  } catch (error) {
    const err = await handleError(error)
    throw new Error(err.message)
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/logout")
  } catch {
    // Ignore logout API error
  } finally {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }
}

export function getStoredUser(): { id: number; name: string; email: string } | null {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}