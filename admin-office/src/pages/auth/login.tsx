import axios from 'axios';
import { useFormik } from 'formik';
import Cookie from 'js-cookie';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';
import * as Yup from 'yup';
import Button from '../../components/Button';
import Buttons from '../../components/Buttons';
import CardBox from '../../components/CardBox';
import SectionFullScreen from '../../components/Section/FullScreen';
import { getPageTitle } from '../../config';
import { useSocketContext } from '../../contexts/SocketContext';
import { LoginForm } from '../../interfaces';
import LayoutGuest from '../../layouts/Guest';

const LoginPage = () => {
    const router = useRouter();
    const { t } = useTranslation('common');
    const { addToast } = useToasts();
    const socket = useSocketContext();

    // Validation schema
    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
        rememberMe: Yup.boolean().optional(),
    });

    const handleSubmit = async (values: LoginForm) => {
        try {
            const response = await axios.post(
                '/api/auth/login',
                {
                    email: values.email,
                    password: values.password,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );

            const data = response.data;

            if (data.status === 'success') {
                // The login was successful
                Cookie.set('access_token', data.access_token);
                Cookie.set('refresh_token', data.refresh_token);

                // You can also navigate to the main dashboard/etc here
                router.push('/languages');

                addToast(t('login_success'), {
                    appearance: 'success',
                    autoDismiss: true,
                });
            } else {
                // The login failed
                console.log('Login failed');
                // Reset the form or show an error message
            }
        } catch (error) {
            console.error('Error:', error);
            addToast(t('something_went_wrong'), {
                appearance: 'error',
                autoDismiss: true,
            });
        }
    };

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
    });

    useEffect(() => {
        if (socket) {
            // Here you can attach event listeners to the WebSocket
            socket.onmessage = (received) => {
                console.log('Message received from server: ', received.data);
                if (!received.data.includes(',')) {
                    const json = JSON.parse(received.data);
                    if(json.session){
                        Cookie.set('session', json.session);
                        axios.defaults.headers.common['Session'] = json.session;
                    }
                }
            };
        }

        if (Cookie.get('access_token'))
            axios
                .post(
                    `/api/auth/checkTokenExp`,
                    {},
                    { params: { access_token: Cookie.get('access_token') } }
                )
                .then((res) => {
                    if (res.data.status === 'success') {
                        router.push('/languages');
                    }
                })
                .catch((err) => {
                    console.log(err.message);
                });

        // Clean up function
        return () => {
            if (socket) socket.onmessage = null; // Remove the listener when component unmounts
        };
    }, [socket]); // We listen for changes in the `socket` value

    return (
        <>
            <Head>
                <title>{getPageTitle('Login')}</title>
            </Head>

            <SectionFullScreen>
                <CardBox className="w-11/12 md:w-7/12 lg:w-6/12 xl:w-4/12 shadow-2xl">
                    <Image
                        src={`/images/logo.svg`}
                        width={50}
                        height={50}
                        className="mx-auto"
                        alt={'PAXINTRADE'}
                    />
                    <h1 className="text-2xl text-center font-extrabold my-8">{t('signin')}</h1>
                    <form onSubmit={formik.handleSubmit}>
                        <input
                            type="email"
                            name="email"
                            {...formik.getFieldProps('email')}
                            className="px-3 py-2 max-w-full border-gray-700 rounded w-full bg-transparent dark:placeholder-gray-400 focus:ring focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                            placeholder={t('email')}
                        />

                        {formik.touched.email && formik.errors.email ? (
                            <div className="text-red-400">{formik.errors.email}</div>
                        ) : null}

                        <input
                            name="password"
                            type="password"
                            {...formik.getFieldProps('password')}
                            className="px-3 py-2 mt-4 max-w-full border-gray-700 rounded w-full bg-transparent dark:placeholder-gray-400 focus:ring focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                            placeholder={t('password')}
                        />

                        {formik.touched.password && formik.errors.password ? (
                            <div className="text-red-400">{formik.errors.password}</div>
                        ) : null}

                        <label
                            className={`flex items-center w-auto mt-4 cursor-pointer`}
                            htmlFor="rememberMe"
                        >
                            <input
                                type="checkbox"
                                {...formik.getFieldProps('rememberMe')}
                                name="rememberMe"
                                id="rememberMe"
                            />
                            <span className="ml-2">{t('remember_me')}</span>
                        </label>

                        <Buttons>
                            <Button
                                type="submit"
                                label={t('continue')}
                                className="w-full mt-4"
                                color="contrast"
                            />
                        </Buttons>
                    </form>
                    <div className="flex items-center mt-8">
                        <hr className="w-full" />
                        <Link
                            href={'/auth/forgot-password'}
                            className="font-medium text-blue-600 hover:text-blue-500 whitespace-nowrap mx-2"
                        >
                            {t('forgot_password')}
                        </Link>
                        <hr className="w-full" />
                    </div>
                </CardBox>
            </SectionFullScreen>
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

LoginPage.getLayout = function getLayout(page: ReactElement) {
    return <LayoutGuest>{page}</LayoutGuest>;
};

export default LoginPage;
