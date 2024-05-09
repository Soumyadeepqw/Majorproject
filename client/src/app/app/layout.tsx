import AppLayout from "../AppLayout"

export default function mainLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <AppLayout>{children}</AppLayout>
  }
