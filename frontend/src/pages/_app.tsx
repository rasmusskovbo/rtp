import 'bootstrap/dist/css/bootstrap.css'
import '../styles/global.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps  } from 'next/app'

function RoadToPinkApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Component {...pageProps} />
            <ToastContainer autoClose={3000} hideProgressBar />
        </>
    );
}

export default RoadToPinkApp
