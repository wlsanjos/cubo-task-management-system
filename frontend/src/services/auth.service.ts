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
  token?: string
  access_token?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401 || error.response?.status === 422) {
      return { message: "E-mail ou senha incorretos. Tente novamente." }
    }
    const data = error.response?.data as ApiError
    if (data?.errors) {
      const firstError = Object.values(data.errors).flat()[0]
      return { message: firstError || data.message }
    }
    if (data?.message) {
      return { message: data.message }
    }
  }
  return { message: "Erro de conexão. Tente novamente." }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/login", payload)
    const data = response.data
    const token = data.token || data.access_token || ""

    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(data.user))
    return data
  } catch (error) {
    // Relançamos o erro para que o componente possa tratar (ex: verificar status 401/422)
    throw error
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/register", payload)
    const data = response.data
    const token = data.token || data.access_token || ""

    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(data.user))
    return data
  } catch (error) {
    throw error
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