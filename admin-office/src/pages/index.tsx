import { GetServerSideProps, NextPage } from 'next';

const Home: NextPage = () => null;

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        redirect: {
            destination: '/auth/login',
            permanent: false,
        },
    };
};

export default Home;
