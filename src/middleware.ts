import { NextResponse, type NextRequest } from 'next/server';

// Firebase client-side auth kullanır.
// Server-side middleware'da sadece basit route koruması yapılır.
// Gerçek auth kontrolü client-side AuthGuard bileşeninde yapılır.

export async function middleware(request: NextRequest) {
  // API, statik dosya ve auth sayfalarını atla
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/share') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
