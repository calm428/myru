import axios from 'axios';
import Cookie from 'js-cookie';

const instance = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${Cookie.get('access_token')}`,
    Session: Cookie.get('session'),
  },
});

export default instance;
