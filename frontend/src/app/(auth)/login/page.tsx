"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login as loginService } from "@/services/auth.service"
import { useAuth } from "@/hooks"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login: setAuth } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await loginService(data)
      setAuth(response)
      toast.success("Bem-vindo de volta!")
      await new Promise(resolve => setTimeout(resolve, 100))
      window.location.href = "/dashboard"
    } catch (error) {
      const message = error instanceof Error ? error.message : "Credenciais inválidas"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-background" />

      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=800)",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-transparent opacity-60" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="text-white text-2xl font-extrabold tracking-tighter">
              Orchestrator
            </span>
          </Link>
        </div>
        <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-white text-5xl font-bold leading-tight tracking-tight mb-6">
            Gerencie com <br />
            precisão editorial.
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Experimente a gestão de tarefas como um fluxo de trabalho curated. Eleve a produtividade da sua equipe com nossa interface premium.
          </p>
        </div>
        <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-white text-xs font-bold"
                >
                  {i}
                </div>
              ))}
            </div>
            <span className="text-white/80 text-sm font-medium">
              Junte-se a 2.000+ líderes
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-background/80 backdrop-blur-xl">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tighter text-primary">
              Orchestrator
            </span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Bem-vindo de Volta</h1>
            <p className="text-muted-foreground">Entre com suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="seu@email.com"
                  className={`pl-10 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <XCircle className="w-4 h-4 text-destructive" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Senha</label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                Lembrar deste dispositivo
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link href="/register" className="text-primary font-medium hover:underline">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
