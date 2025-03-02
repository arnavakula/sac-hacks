import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 border-b">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">GradeAI</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  AI-Powered Grading Platform
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Streamline the grading process with our AI-powered platform. Upload assignments, get instant feedback,
                  and improve learning outcomes.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login?role=student">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      Student Login
                    </Button>
                  </Link>
                  <Link href="/login?role=professor">
                    <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                      Professor Login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto">
                <div className="aspect-video overflow-hidden rounded-xl bg-muted flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="AI Grading Platform"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">For Students</h3>
                <p className="text-muted-foreground">
                  Submit assignments, receive instant feedback, and track your progress over time.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">For Professors</h3>
                <p className="text-muted-foreground">
                  Upload answer keys, automate grading, and focus on providing valuable guidance.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Our advanced AI algorithms provide accurate grading and detailed feedback.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 border-t">
        <div className="container flex flex-col gap-2 md:flex-row md:gap-4 md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">© 2025 GradeAI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

