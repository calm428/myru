import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import validateToken from '../../pages/api/auth/validateToken';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children
}) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const checkAuthentication = async () => {
            const isAuthenticated = await validateToken(localStorage.getItem('access_token'));
            setIsAuthenticated(isAuthenticated);
            if (!isAuthenticated) {
                router.push('/auth/login');
            }
        };

        checkAuthentication();
    }, [router]);

    if (isAuthenticated === undefined) {
        // Loading state while authentication check is in progress
        return <></>;
    }

    return (
        <>
            {isAuthenticated ? children : null}
        </>
    );
};

export default ProtectedRoute;