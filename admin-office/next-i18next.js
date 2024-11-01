import NextI18Next from 'next-i18next'
import { resolve } from 'path'

// eslint-disable-next-line import/no-anonymous-default-export
export default new NextI18Next({
  localePath: resolve('./public/locales'),
})
