import { siteConfig } from '@/config/site';

import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '../theme-toggle';
import { LanguageSelector } from './language';

export function SiteHeader() {
  return (
    <header className={`bg-h sticky top-0 z-40 w-full bg-background`}>
      <div className='border-gardient-h relative top-[80px] w-full'></div>
      <div className='flex h-20 items-center space-x-4 px-4 sm:justify-between sm:space-x-0 md:px-8'>
        <div className='flex items-center justify-center gap-6 md:gap-10'>
          <Link href='/' className='flex items-center gap-2'>
            <Image
              src='/logo-black.svg'
              alt='logo'
              width={40.44}
              height={40.44}
              className='size-[40.44px] dark:hidden'
            />
            <Image
              src='/logo-white.svg'
              alt='logo'
              width={40.44}
              height={40.44}
              className='hidden size-[40.44px] dark:block'
            />
            <span className='hidden font-satoshi text-xl font-semibold sm:inline-block'>
              {siteConfig.name}
            </span>
          </Link>
        </div>
        <div className='flex flex-1 items-center justify-end space-x-4'>
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
