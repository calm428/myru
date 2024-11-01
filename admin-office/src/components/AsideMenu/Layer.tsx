import { mdiClose } from '@mdi/js';
import Image from 'next/image';
import React from 'react';
import { MenuAsideItem } from '../../interfaces';
import { useAppSelector } from '../../stores/hooks';
import Icon from '../Icon';
import AsideMenuList from './List';

type Props = {
  menu: MenuAsideItem[];
  className?: string;
  onAsideLgCloseClick: () => void;
};

export default function AsideMenuLayer({ menu, className = '', ...props }: Props) {
  const darkMode = useAppSelector((state) => state.darkMode.isEnabled);

  const handleAsideLgCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    props.onAsideLgCloseClick();
  };

  return (
    <aside
      className={`${className} zzz w-60 fixed flex top-14 h-screen transition-position overflow-hidden`}
    >
      <div className={`aside flex-1 flex flex-col overflow-hidden dark:bg-slate-900`}>
        <div
          className={`aside-brand relative flex flex-row items-center justify-between dark:bg-slate-900`}
        >
          <div className="text-center flex-1 lg:text-left xl:text-center xl:pl-0">
            <Image
              src={`/images/logo-w.svg`}
              width={50}
              height={50}
              className="mx-auto my-6"
              alt={'PAXINTRADE'}
            />
          </div>
          <button
            className="hidden absolute right-0 top-0 lg:inline-block xl:hidden p-3"
            onClick={handleAsideLgCloseClick}
          >
            <Icon path={mdiClose} />
          </button>
        </div>
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            darkMode ? 'aside-scrollbars-[slate]' : 'aside-scrollbars'
          }`}
        >
          <AsideMenuList menu={menu} />
        </div>
      </div>
    </aside>
  );
}
