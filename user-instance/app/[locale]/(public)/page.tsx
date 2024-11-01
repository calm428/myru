import FlowSection from '@/components/main/flow';
import { Button } from '@/components/ui/button';
import { getUUID } from '@/lib/actions/getUUID';
import { extractUsername } from '@/lib/utils';
import '@/styles/main.css';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function LandingPage({
  params,
}: {
  params: { locale: string };
}) {
  const headerList = headers();
  const uuid = await getUUID(extractUsername(headerList.get('host') || ''));

  unstable_setRequestLocale(params.locale);
  const t = await getTranslations('main');

  return uuid ? (
    <section className='container grid items-center gap-6 pb-8 pt-6 md:py-10'>
      <FlowSection uuid={uuid} />
    </section>
  ) : (
    <section className='flex h-[calc(100vh-5rem-1px)] flex-col items-center justify-center'>
      <p className='mb-3 text-2xl'>{t('no_activated_website')}</p>
      <Button variant='link' className='mb-40' asChild>
        <Link href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}`}>
          {t('back_to_paxintrade')}
        </Link>
      </Button>
    </section>
  );
}
