import { getStoreSettings } from '@/actions/settings'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const settings = await getStoreSettings()
  const logoUrl = settings.store_logo
  const storeName = settings.store_name || 'Multi Impresiones AH'

  return <LoginForm logoUrl={logoUrl} storeName={storeName} />
}
