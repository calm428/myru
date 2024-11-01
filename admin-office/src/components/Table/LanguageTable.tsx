import { mdiTrashCan } from '@mdi/js';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { Language } from '../../interfaces';
import instance from '../../lib/axiosInstance';
import Button from '../Button';
import Buttons from '../Buttons';
import CardBoxModal from '../CardBox/Modal';

const LanguageTable = (props) => {
  const { t } = useTranslation('common');
  const { addToast } = useToasts();
  const { data, refetch } = props;

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isDeleteModalActive, setIsDeleteModalActive] = useState<boolean>(false);
  const [deleteID, setDeleteID] = useState<number | null>(null);

  const perPage = 5;
  const clientsPaginated = data.slice(perPage * currentPage, perPage * (currentPage + 1));
  const numPages = Math.ceil(data.length / perPage);
  const pagesList = [];

  for (let i = 0; i < numPages; i++) {
    pagesList.push(i);
  }

  const handleDeleteLanguage = () => {
    instance
      .delete(`/api/settings/deletelang/${deleteID}`)
      .then(() => {
        addToast(t('language_deleted'), {
          appearance: 'success',
          autoDismiss: true,
        });

        refetch();
      })
      .catch((error) => {
        addToast(t('something_went_wrong'), {
          appearance: 'error',
          autoDismiss: true,
        });
        console.log(error.message);
      });
    setIsDeleteModalActive(false);
    console.log(deleteID);
  };

  return (
    <>
      <CardBoxModal
        title={t('please_confirm')}
        buttonColor="danger"
        buttonLabel={t('confirm')}
        isActive={isDeleteModalActive}
        onConfirm={handleDeleteLanguage}
        onCancel={() => setIsDeleteModalActive(false)}
      >
        <p>{t('delete_language_confirm_description')}</p>
      </CardBoxModal>

      <table>
        <thead>
          <tr>
            <th>{t('id')}</th>
            <th>{t('code')}</th>
            <th>{t('name')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {clientsPaginated.map((lang: Language, index: number) => (
            <tr key={index}>
              <td data-label="ID">{lang.ID}</td>
              {/* <td data-label="Name">{city.Name}</td> */}
              <td data-label="Code">{lang.Code}</td>
              <td data-label="Name" className="flex items-center justify-start gap-2 lg:w-32">
                {lang.Name}
              </td>
              <td className="before:hidden align-top lg:w-1 whitespace-nowrap">
                <Buttons type="justify-start lg:justify-end" noWrap>
                  <Button
                    color="danger"
                    icon={mdiTrashCan}
                    onClick={() => {
                      console.log(lang.ID);
                      setDeleteID(lang.ID);
                      setIsDeleteModalActive(true);
                    }}
                    small
                  />
                </Buttons>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 md:py-0">
          <Buttons>
            {pagesList.map((page) => (
              <Button
                key={page}
                active={page === currentPage}
                label={page + 1}
                color={page === currentPage ? 'lightDark' : 'whiteDark'}
                small
                onClick={() => setCurrentPage(page)}
              />
            ))}
          </Buttons>
          <small className="mt-6 md:mt-0">
            {t('pagination', { currentPage: currentPage + 1, numPages })}
          </small>
        </div>
      </div>
    </>
  );
};

export default LanguageTable;
