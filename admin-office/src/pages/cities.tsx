import { mdiMagnify, mdiPlus } from '@mdi/js';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { SketchPicker } from 'react-color';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import * as Yup from 'yup';
import Button from '../components/Button';
import Buttons from '../components/Buttons';
import CardBox from '../components/CardBox';
import CardBoxModal from '../components/CardBox/Modal';
import FormField from '../components/Form/Field';
import SectionMain from '../components/Section/Main';
import CityTable from '../components/Table/CityTable';
import { getPageTitle } from '../config';
import LayoutAuthenticated from '../layouts/Authenticated';
import instance from '../lib/axiosInstance';

async function fetcher(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Could not fetch the data');
    }
    return res.json();
}

const CityPage = () => {
    const { t, i18n } = useTranslation('common');

    // const router = useRouter();
    // const query = {};

    // // Convert ParsedUrlQuery to valid Record<string, string>
    // for (const key in router.query) {
    //     if (typeof router.query[key] === 'string') {
    //         query[key] = router.query[key];
    //     }
    // }

    // const searchParams = new URLSearchParams(query);

    const { addToast } = useToasts();
    const [searchText, setSearchText] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isAddCityModalActive, setIsAddCityModalActive] = useState<boolean>(false);
    const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
    const pickerRef = useRef(null);

    const citiesUrl = searchText
        ? `/api/cities/query?name=${searchText}&lang=${i18n.language}&skip=${
              10 * (currentPage - 1)
          }`
        : `/api/cities/all?skip=${10 * (currentPage - 1)}`;
    const langUrl = '/api/settings/langs';

    const { data: cityData, mutate: mutateCityData } = useSWR(citiesUrl, fetcher);
    const { data: langData, error: langFetchError } = useSWR(langUrl, fetcher);

    // Validation schema
    const validationSchema = Yup.object().shape({
        params: Yup.array().of(
            Yup.object().shape({
                Language: Yup.string().required(t('language_required')),
                Name: Yup.string().required(t('name_required')),
            })
        ),
        color: Yup.string().required(t('color_required')),
    });

    // const filterData = (data: City[], keyword: string) => {
    //     // first filter the data
    //     const filteredData = data.filter((item) => {
    //         return item.Translations.some((translation) =>
    //             translation.Name.toLowerCase().includes(keyword.toLowerCase())
    //         );
    //     });

    //     // then sort the data by ID
    //     const sortedData = filteredData.sort((a, b) => {
    //         return a.ID - b.ID; // for ascending order. Use b.ID - a.ID for descending order
    //     });

    //     return sortedData;
    // };

    const AddCitySubmit = (values, { resetForm }) => {
        instance
            .post('/api/cities/create', { Hex: values.color })
            .then((cityCreateResponse) => {
                const cityId = cityCreateResponse.data.data.ID;

                const translatorCreateRequests = values.params.map((param) =>
                    instance
                        .post('/api/citiestranslator/create', {
                            CityID: cityId,
                            Language: param.Language,
                            Name: param.Name,
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                );

                Promise.all(translatorCreateRequests)
                    .then((values) => {
                        addToast(t('city_added'), {
                            appearance: 'success',
                            autoDismiss: true,
                        });

                        resetForm();

                        mutateCityData();

                        setIsAddCityModalActive(false);

                        console.log(values);
                    })
                    .catch((error) => {
                        addToast(t('something_went_wrong'), {
                            appearance: 'error',
                            autoDismiss: true,
                        });

                        resetForm();

                        setIsAddCityModalActive(false);

                        console.log(error.message);
                    });
            })
            .catch((error) => {
                addToast(t('something_went_wrong'), {
                    appearance: 'error',
                    autoDismiss: true,
                });

                resetForm();

                console.log(error.message);
            });
    };

    const formik = useFormik({
        initialValues: {
            params: [],
            color: '#000000',
        },
        validationSchema: validationSchema,
        onSubmit: AddCitySubmit,
    });

    const handleColorPickerOpen = () => {
        setDisplayColorPicker(true);
    };

    const handleColorPickerClose = (event) => {
        if (pickerRef.current && pickerRef.current.contains(event.target)) return;

        setDisplayColorPicker(false);
    };

    useEffect(() => {
        // add when mounted
        document.addEventListener('mouseup', handleColorPickerClose);

        if (!langFetchError && langData) {
            formik.setFieldValue(
                'params',
                langData.data.map((item) => ({
                    Language: item.Code,
                    Name: '',
                }))
            );
        }

        // return function to be called when unmounted
        return () => {
            document.removeEventListener('mouseup', handleColorPickerClose);
        };
    }, [langData, langFetchError]);

    return (
        <>
            <Head>
                <title>{getPageTitle('Cities')}</title>
            </Head>
            <SectionMain>
                <div className="w-full flex justify-between items-center gap-8">
                    <FormField isBorderless isTransparent icons={[mdiMagnify]}>
                        <input
                            type="search"
                            placeholder={t('search')}
                            className="w-full"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        ></input>
                    </FormField>
                    <Button
                        icon={mdiPlus}
                        color="info"
                        outline
                        label={t('add_city')}
                        className="ml-auto my-2 mb-8"
                        onClick={() => setIsAddCityModalActive(true)}
                        small
                    />
                </div>
                <CardBoxModal
                    title={t('add_city')}
                    buttonColor="info"
                    buttonLabel={t('add')}
                    isActive={isAddCityModalActive}
                    onConfirm={formik.handleSubmit}
                    onCancel={() => setIsAddCityModalActive(false)}
                    showFooter={false}
                >
                    <form
                        onSubmit={formik.handleSubmit}
                        className="w-full pt-4 space-y-4 md:space-y-6"
                    >
                        <div>
                            {!langFetchError &&
                                langData &&
                                langData.data.map((lang, index) => (
                                    <div key={lang.ID}>
                                        <div className="flex my-1 w-auto justify-start rounded-lg">
                                            <div className="p-1 bg-slate-400 rounded-lg rounded-r-none w-8 text-center">
                                                {lang.Code}
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full p-1 bg-slate-200 rounded-lg rounded-l-none border-none"
                                                {...formik.getFieldProps(`params[${index}].Name`)}
                                            ></input>
                                        </div>
                                        {formik.touched.params && formik.errors.params ? (
                                            <div className="text-red-400">
                                                {formik.errors.params[index]?.Name}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                        </div>
                        <div className="flex my-1 w-auto justify-start rounded-md">
                            <div
                                className="w-8 relative cursor-pointer p-1 rounded-md rounded-r-none"
                                style={{ backgroundColor: formik.values.color }}
                                onClick={() => handleColorPickerOpen()}
                            >
                                {displayColorPicker ? (
                                    <div className="absolute top-6 z-10" ref={pickerRef}>
                                        <SketchPicker
                                            color={formik.values.color}
                                            onChangeComplete={(color) => {
                                                formik.setFieldValue('color', color.hex);
                                            }}
                                        />
                                    </div>
                                ) : null}
                            </div>
                            <div className="p-1 px-2 bg-slate-200 rounded-md rounded-l-none border-none w-auto">
                                {formik.values.color.toUpperCase()}
                            </div>
                        </div>
                        <Buttons className="justify-end">
                            <Button
                                label={t('cancel')}
                                color={'info'}
                                outline
                                onClick={() => setIsAddCityModalActive(false)}
                            />
                            <Button label={t('add')} color={'info'} type="submit" />
                        </Buttons>
                    </form>
                </CardBoxModal>
                <CardBox hasTable>
                    <CityTable
                        data={cityData?.data}
                        meta={cityData?.meta}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        refetch={mutateCityData}
                    />
                </CardBox>
            </SectionMain>
        </>
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

CityPage.getLayout = function getLayout(page: ReactElement) {
    return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default CityPage;
