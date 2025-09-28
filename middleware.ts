import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n'

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Always show the locale in the URL
  localePrefix: 'always'
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|en|es|fr|pt|it|ja|ko|zh|ar)/:path*']
}
