import 'bootstrap/dist/css/bootstrap.css'
import '../styles/global.css'
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps  } from 'next/app'
import {AuthProvider} from "../auth/AuthProvider";

function RoadToPinkApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <AuthProvider>
                <Component {...pageProps} />
            </AuthProvider>
        </>
    );
}

export default RoadToPinkApp
