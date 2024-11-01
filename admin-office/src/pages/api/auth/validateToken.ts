import axios from 'axios';

const validateToken = async (token: string): Promise<boolean> => {
    try {
        const response = await axios.post(`https://go.paxintrade.com/api/auth/checkTokenExp?access_token=${token}`);

        if (response.data.status === "success") {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};

export default validateToken;