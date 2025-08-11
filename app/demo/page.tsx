"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Building, Shield, Play, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

const demoAccounts = [
  {
    role: "USER",
    email: "demo.player@quickcourt.com",
    password: "demo123",
    name: "Alex Player",
    description: "Regular player who books courts",
    features: ["Browse venues", "Book courts", "View bookings", "Rate venues"],
  },
  {
    role: "OWNER",
    email: "demo.owner@quickcourt.com",
    password: "demo123",
    name: "Sarah Owner",
    description: "Venue owner managing courts",
    features: ["Manage venues", "View bookings", "Dashboard analytics", "Block time slots"],
  },
  {
    role: "ADMIN",
    email: "demo.admin@quickcourt.com",
    password: "demo123",
    name: "Mike Admin",
    description: "Platform administrator",
    features: ["Approve venues", "Manage users", "System analytics", "Platform settings"],
  },
]

const demoActions = [
  {
    title: "Simulate New Booking",
    description: "Create a test booking to see real-time updates",
    action: "create-booking",
    icon: Calendar,
  },
  {
    title: "Generate Sample Data",
    description: "Add venues, courts, and bookings for testing",
    action: "generate-data",
    icon: Building,
  },
  {
    title: "Test Notifications",
    description: "Send sample email and in-app notifications",
    action: "test-notifications",
    icon: Play,
  },
]

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  const handleDemoAction = async (action: string) => {
    setIsLoading(action)
    setMessage("")

    try {
      const response = await fetch("/api/demo/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message)
      } else {
        setMessage(result.error || "Action failed")
      }
    } catch (error) {
      setMessage("An error occurred")
    } finally {
      setIsLoading(null)
    }
  }

  const handleQuickLogin = async (email: string, password: string) => {
    setIsLoading("login")

    try {
      // This would typically use NextAuth signIn
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        window.location.href = "/dashboard"
      }
    } catch (error) {
      setMessage("Login failed")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              QuickCourt Demo
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-yellow-400 text-black hover:bg-yellow-500">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">QuickCourt Demo</h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
            Explore our sports booking platform with pre-configured demo accounts and sample data. Test all features
            without any setup required.
          </p>
        </motion.div>

        {message && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Alert className="bg-white/90 backdrop-blur-sm">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Demo Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Demo Accounts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {demoAccounts.map((account, index) => (
              <Card key={account.role} className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {account.role === "USER" && <User className="h-8 w-8 text-cyan-600" />}
                    {account.role === "OWNER" && <Building className="h-8 w-8 text-cyan-600" />}
                    {account.role === "ADMIN" && <Shield className="h-8 w-8 text-cyan-600" />}
                  </div>
                  <CardTitle className="text-xl">{account.name}</CardTitle>
                  <CardDescription>{account.description}</CardDescription>
                  <Badge variant="secondary" className="w-fit mx-auto">
                    {account.role}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {account.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Password:</strong> {account.password}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Features:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {account.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleQuickLogin(account.email, account.password)}
                    disabled={isLoading === "login"}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    {isLoading === "login" ? "Logging in..." : "Quick Login"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Demo Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Demo Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {demoActions.map((action, index) => (
              <Card key={action.action} className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <action.icon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleDemoAction(action.action)}
                    disabled={isLoading === action.action}
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    {isLoading === action.action ? "Processing..." : "Run Action"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Sample Data Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Sample Data Preview</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Building className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">12</h3>
                <p className="text-gray-600">Demo Venues</p>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">48</h3>
                <p className="text-gray-600">Sports Courts</p>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">156</h3>
                <p className="text-gray-600">Sample Bookings</p>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">89</h3>
                <p className="text-gray-600">Demo Users</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card className="bg-white/90 backdrop-blur-sm max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription>
                Choose a demo account above or create your own account to explore QuickCourt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
                    Create Real Account
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="lg" variant="outline">
                    Browse Courts
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-600">All demo data is reset daily. Real accounts persist your data.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
