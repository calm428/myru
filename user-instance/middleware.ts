import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './navigation';
import { extractUsername } from './lib/utils';
import { getUUID } from './lib/actions/getUUID';

const intlMiddleware = createIntlMiddleware({
  locales,
  localePrefix: 'as-needed',
  defaultLocale: 'en',
});

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/') {
    return intlMiddleware(req);
  }

  const uuid = await getUUID(extractUsername(req.headers.get('host') || ''));

  if (uuid) {
    return intlMiddleware(req);
  } else {
    return NextResponse.redirect(new URL(`/`, req.url));
  }
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
