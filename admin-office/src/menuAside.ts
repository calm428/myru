import {
  mdiAccountMultiple,
  mdiBookMultiple,
  mdiCity,
  mdiWeb
} from '@mdi/js'
import { MenuAsideItem } from './interfaces'

const menuAside: MenuAsideItem[] = [
  {
    href: '/languages',
    icon: mdiWeb,
    label: 'languages',
  },
  {
    href: '/cities',
    label: 'cities',
    icon: mdiCity,
  },
  {
    href: '/categories',
    label: 'categories',
    icon: mdiBookMultiple,
  },
  {
    href: '/users',
    label: 'users',
    icon: mdiAccountMultiple,
  },
  // {
  //   label: 'Dropdown',
  //   icon: mdiViewList,
  //   menu: [
  //     {
  //       label: 'Item One',
  //     },
  //     {
  //       label: 'Item Two',
  //     },
  //   ],
  // }
]

export default menuAside
