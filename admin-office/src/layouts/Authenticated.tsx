import { mdiBackburger, mdiForwardburger, mdiMenu } from '@mdi/js';
import axios from 'axios';
import Cookie from 'js-cookie';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import Select from 'react-select';
import AsideMenu from '../components/AsideMenu';
import Icon from '../components/Icon';
import NavBar from '../components/NavBar';
import NavBarItemPlain from '../components/NavBar/Item/Plain';
import menuAside from '../menuAside';
import menuNavBar from '../menuNavBar';

type Props = {
  children: ReactNode;
};

const formatOptionLabel = ({ value, label, flag }) => (
  <div className="flex items-center space-x-5">
    <img src={flag} alt={value + ' ' + label} className="w-5 h-auto" />
    <span>{label}</span>
  </div>
);

export default function LayoutAuthenticated({ children }: Props) {
  const { i18n } = useTranslation('common');
  const [isAsideMobileExpanded, setIsAsideMobileExpanded] = useState(false);
  const [isAsideLgActive, setIsAsideLgActive] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsAsideMobileExpanded(false);
      setIsAsideLgActive(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router.events]);

  useEffect(() => {
    if (!Cookie.get('access_token')) {
      router.push('/auth/login');
    }

    axios
      .post(`/api/auth/checkTokenExp`, {}, { params: { access_token: Cookie.get('access_token') } })
      .then((res) => {
        if (res.data.status !== 'success') {
          router.push('/auth/login');
        }
      })
      .catch((err) => {
        router.push('/auth/login');
        console.log(err.message);
      });
  }, []);

  const layoutAsidePadding = 'xl:pl-60';

  const options = [
    {
      value: 'en',
      label: 'English',
      flag: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
    },
    {
      value: 'ru',
      label: 'Russian',
      flag: 'https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg',
    },
    {
      value: 'ka',
      label: 'Georgian',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Flag_of_Georgia.svg',
    },
    {
      value: 'es',
      label: 'Spanish',
      flag: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg',
    },
  ];

  const handleLanguageChange = (option) => {
    router.push(router.pathname, router.asPath, { locale: option.value });
  };

  return (
    <div className={`overflow-hidden lg:overflow-visible`}>
      <div
        className={`${layoutAsidePadding} ${
          isAsideMobileExpanded ? 'lg:ml-0' : ''
        } pt-14 min-h-screen w-screen transition-position lg:w-auto bg-gray-50 dark:bg-slate-800 dark:text-slate-100`}
      >
        <NavBar menu={menuNavBar} className={`${isAsideMobileExpanded ? 'lg:ml-0' : ''}`}>
          <NavBarItemPlain
            display="flex lg:hidden"
            onClick={() => setIsAsideMobileExpanded(!isAsideMobileExpanded)}
          >
            <Icon path={isAsideMobileExpanded ? mdiBackburger : mdiForwardburger} size="24" />
          </NavBarItemPlain>
          <NavBarItemPlain
            display="hidden lg:flex xl:hidden"
            onClick={() => setIsAsideLgActive(true)}
          >
            <Icon path={mdiMenu} size="24" />
          </NavBarItemPlain>
          <div className="flex justify-start items-center">
            <Select
              options={options}
              defaultValue={options.find((opt) => opt.value === i18n.language)}
              isSearchable={false}
              onChange={handleLanguageChange}
              formatOptionLabel={formatOptionLabel}
            />
          </div>
        </NavBar>
        <AsideMenu
          isAsideMobileExpanded={isAsideMobileExpanded}
          isAsideLgActive={isAsideLgActive}
          menu={menuAside}
          onAsideLgClose={() => setIsAsideLgActive(false)}
        />
        {children}
      </div>
    </div>
  );
}
