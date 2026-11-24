import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!admin) return null;
        const valid = await bcrypt.compare(credentials.password, admin.passwordHash);
        if (!valid) return null;
        return { id: admin.id, email: admin.email, name: admin.name };
      },
    }),
  ],
};

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session;
}
