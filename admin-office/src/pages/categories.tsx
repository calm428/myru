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
import CategoryTable from '../components/Table/CategoryTable';
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

const CategoryPage = () => {
    const { t, i18n } = useTranslation('common');
    const { addToast } = useToasts();

    // const router = useRouter();
    // const query = {};

    // // Convert ParsedUrlQuery to valid Record<string, string>
    // for (const key in router.query) {
    //     if (typeof router.query[key] === 'string') {
    //         query[key] = router.query[key];
    //     }
    // }

    // const searchParams = new URLSearchParams(query);

    const [searchText, setSearchText] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isAddCategoryModalActive, setIsAddCategoryModalActive] = useState<boolean>(false);
    const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
    const pickerRef = useRef(null);

    const categoriesUrl = searchText
        ? `/api/guilds/namecustom?name=${searchText}&lang=${i18n.language}&skip=${
              10 * (currentPage - 1)
          }`
        : `/api/guilds/getAll?skip=${10 * (currentPage - 1)}`;
    const langUrl = '/api/settings/langs';
    console.log(categoriesUrl, 'categoriesUrl');

    const { data: categoryData, mutate: mutateCategoryData } = useSWR(categoriesUrl, fetcher);
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

    const AddCategorySubmit = (values, { resetForm }) => {
        instance
            .post('/api/guilds/create', { Hex: values.color })
            .then((categoryCreateResponse) => {
                const categoryId = categoryCreateResponse.data.data.ID;

                const translatorCreateRequests = values.params.map((param) =>
                    instance
                        .post('/api/guildstranslator/create', {
                            GuildID: categoryId,
                            Language: param.Language,
                            Name: param.Name,
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                );

                Promise.all(translatorCreateRequests)
                    .then((responses) => {
                        addToast(t('category_added'), {
                            appearance: 'success',
                            autoDismiss: true,
                        });

                        resetForm();

                        mutateCategoryData();

                        setIsAddCategoryModalActive(false);

                        console.log(responses);
                    })
                    .catch((error) => {
                        addToast(t('something_went_wrong'), {
                            appearance: 'error',
                            autoDismiss: true,
                        });

                        resetForm();

                        setIsAddCategoryModalActive(false);

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
        onSubmit: AddCategorySubmit,
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
                <title>{getPageTitle('Categories')}</title>
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
                        label={t('add_category')}
                        className="ml-auto my-2 mb-8"
                        onClick={() => setIsAddCategoryModalActive(true)}
                        small
                    />
                </div>
                <CardBoxModal
                    title={t('add_category')}
                    buttonColor="info"
                    buttonLabel={t('add')}
                    isActive={isAddCategoryModalActive}
                    onConfirm={formik.handleSubmit}
                    onCancel={() => setIsAddCategoryModalActive(false)}
                    showFooter={false}
                >
                    <form
                        onSubmit={formik.handleSubmit}
                        className="w-full pt-4 space-y-4 md:space-y-6"
                        action="#"
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
                                onClick={() => setIsAddCategoryModalActive(false)}
                            />
                            <Button label={t('add')} color={'info'} type="submit" />
                        </Buttons>
                    </form>
                </CardBoxModal>
                <CardBox hasTable>
                    <CategoryTable
                        data={categoryData?.data}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        meta={categoryData?.meta}
                        refetch={mutateCategoryData}
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

CategoryPage.getLayout = function getLayout(page: ReactElement) {
    return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default CategoryPage;
