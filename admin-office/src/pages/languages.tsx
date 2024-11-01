import { mdiMagnify, mdiPlus } from '@mdi/js';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useState, type ReactElement } from 'react';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import Button from '../components/Button';
import Buttons from '../components/Buttons';
import CardBox from '../components/CardBox';
import CardBoxModal from '../components/CardBox/Modal';
import CountrySelector from '../components/CountrySelector/CountrySelector';
import FormField from '../components/Form/Field';
import SectionMain from '../components/Section/Main';
import LanguageTable from '../components/Table/LanguageTable';
import { getPageTitle } from '../config';
import { Language } from '../interfaces';
import LayoutAuthenticated from '../layouts/Authenticated';
import instance from '../lib/axiosInstance';

async function fetcher(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Could not fetch the data');
    }
    return res.json();
}

interface Country {
    value: string;
    label: string;
    code: string;
}

const LanguagePage = () => {
    const { t } = useTranslation('common');
    const { addToast } = useToasts();
    const [searchText, setSearchText] = useState<string>('');
    const [isAddLanguageModalActive, setIsAddLanguageModalActive] = useState<boolean>(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

    const langUrl = '/api/settings/langs';

    const {
        data: langData,
        error: langFetchError,
        mutate: mutateLangData,
    } = useSWR(langUrl, fetcher);

    const filterData = (data: Language[], keyword: string) => {
        return data.filter((item) => {
            return item.Name.toLowerCase().includes(keyword.toLowerCase());
        });
    };

    const handleAddLanguage = () => {
        if (!selectedCountry) {
            addToast(t('country_required'), {
                appearance: 'error',
                autoDismiss: true,
            });
            return;
        }

        instance
            .post('/api/settings/addlang', {
                name: selectedCountry.label,
                code: selectedCountry.code,
            })
            .then((response) => {
                if (response.status === 200) {
                    addToast(t('language_added'), {
                        appearance: 'success',
                        autoDismiss: true,
                    });

                    mutateLangData();
                    setIsAddLanguageModalActive(false);
                } else {
                    addToast(t('something_went_wrong'), {
                        appearance: 'error',
                        autoDismiss: true,
                    });
                }
            })
            .catch((error) => {
                addToast(t('something_went_wrong'), {
                    appearance: 'error',
                    autoDismiss: true,
                });

                console.log(error.message);
            });
    };

    return !langFetchError && langData ? (
        <>
            <Head>
                <title>{getPageTitle('Languages')}</title>
            </Head>
            <SectionMain>
                <div className="w-full flex justify-between items-center gap-8">
                    <FormField isBorderless isTransparent icons={[mdiMagnify]}>
                        <input
                            type="search"
                            placeholder={t('search')}
                            className="w-full"
                            onChange={(e) => setSearchText(e.target.value)}
                        ></input>
                    </FormField>
                    <Button
                        icon={mdiPlus}
                        color="info"
                        outline
                        label={t('add_language')}
                        className="ml-auto my-2 mb-8"
                        onClick={() => setIsAddLanguageModalActive(true)}
                        small
                    />
                </div>
                <CardBoxModal
                    title={t('add_language')}
                    buttonColor="info"
                    buttonLabel={t('add')}
                    isActive={isAddLanguageModalActive}
                    onConfirm={handleAddLanguage}
                    onCancel={() => setIsAddLanguageModalActive(false)}
                    showFooter={false}
                >
                    <div className="w-full pt-4 space-y-4 md:space-y-6">
                        <CountrySelector
                            onChange={(country) => {
                                setSelectedCountry(country);
                            }}
                        />
                        <Buttons className="justify-end">
                            <Button
                                label={t('cancel')}
                                color={'info'}
                                outline
                                onClick={() => setIsAddLanguageModalActive(false)}
                            />
                            <Button
                                label={t('add')}
                                color={'info'}
                                type="submit"
                                onClick={handleAddLanguage}
                            />
                        </Buttons>
                    </div>
                </CardBoxModal>
                <CardBox hasTable>
                    <LanguageTable
                        data={filterData(langData.data, searchText)}
                        refetch={mutateLangData}
                    />
                </CardBox>
            </SectionMain>
        </>
    ) : (
        <></>
    );
};

export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
            // Will be passed to the page component as props
        },
    };
}

LanguagePage.getLayout = function getLayout(page: ReactElement) {
    return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default LanguagePage;
