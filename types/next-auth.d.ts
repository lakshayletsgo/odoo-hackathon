declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      role: string
      isBanned: boolean
    }
  }

  interface User {
    role: string
    isBanned: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    isBanned: boolean
  }
}
