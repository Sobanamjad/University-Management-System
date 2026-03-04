// src/app/layout.tsx
import React from 'react'
import './(frontend)/styles.css' // Make sure this path is correct

export const metadata = {
  title: 'UMS - University Management System',
  description: 'University Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
