import { AdminLoginClient } from './login-client'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return <AdminLoginClient nextPath={next ?? '/admin/quotes'} />
}
