"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, BarChart3, Users, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: BarChart3,
    title: "Analytics Avançado",
    description: "Métricas em tempo real para otimizar o desempenho da sua equipe.",
  },
  {
    icon: Users,
    title: "Colaboração Total",
    description: "Trabalhe insieme com sua equipe em tempo real, compartilhe tarefas e insights.",
  },
  {
    icon: Shield,
    title: "Segurança Empresarial",
    description: "Seus dados protegidos com criptografia de nível bancário.",
  },
  {
    icon: Zap,
    title: "Alta Performance",
    description: "Interface ultrarrápida para máxima produtividade no seu dia a dia.",
  },
]

const stats = [
  { value: "10k+", label: "Usuários Ativos" },
  { value: "500+", label: "Empresas" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9", label: "Avaliação" },
]

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Orchestrator</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </Link>
            <Link href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Estatísticas
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:flex">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Agora com suporte a IA
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Gerencie tarefas com{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                precisão editorial
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Uma experiência de gestão de tarefas moderna e elegante. Eleve a produtividade da sua equipe com nossa interface premium.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg hover:bg-primary/5 transition-all duration-300">
                  Ver Demo
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Sem cartão de crédito
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                14 dias grátis
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Cancelamento anytime
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/20 bg-muted/20">
              <div className="aspect-[16/9] bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-12 h-12 text-primary"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">Interface do Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para{" "}
              <span className="text-primary">gerenciar tarefas</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Recursos pensados para equipes que buscam eficiência e resultados.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl border border-border/20 bg-background hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="relative p-12 md:p-16 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para transformar sua produtividade?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Junte-se a milhares de equipes que já usam o Orchestrator para gerenciar suas tarefas.
              </p>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg gap-2 hover:scale-105 transition-all duration-300">
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-primary-foreground"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span className="font-semibold">Orchestrator</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Orchestrator. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Termos
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}