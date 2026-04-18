export { default } from "next-auth/middleware"

export const config = { 
  // 🔒 This protects the dashboard, the results, and any future admin pages
  matcher: ["/admin/:path*"] 
}