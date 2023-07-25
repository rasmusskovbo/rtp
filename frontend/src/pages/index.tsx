import Head from 'next/head'
import Navbar from '../components/Navbar'
import PostPreview from '../components/PostPreview'
import Layout from "@/components/Layout";
import ImageCarousel from "@/components/ImageCarousel";

const Home: React.FC = () => {
    const imagePaths = [
        "/images/slide1.jpg",
        "/images/slide2.jpg",
        "/images/slide3.jpg",
        "/images/slide4.jpg"
    ]

    return (
        <Layout>
            <div>
                <Head>
                    <title>Road To Pink</title>
                    <link rel="icon" href="/assets/favicon.ico" />
                    <link href="https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic" rel="stylesheet" />
                    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800" rel="stylesheet" />
                </Head>

                <Navbar/>
                <ImageCarousel images={imagePaths}/>

                <div className="container px-4 px-lg-5">
                    <div className="row gx-4 gx-lg-5 justify-content-center">
                        <div className="col-md-10 col-lg-8 col-xl-7">
                            <PostPreview  author={"Rasmus"} title={"Welcome to the new and improved ROAD TO PINK site!"} date={"31-08-2023"} subtitle={"Featuring Next.js/React frontend and hosted content!"}/>
                            <PostPreview  author={"Dustin"} title={"Pod to Pink: Episode 1"} date={"09-09-2023"} subtitle={"The league is back!"}/>
                            <PostPreview  author={"Sebastian"} title={"Power Rankings: Week 1"} date={"07-09-2023"} subtitle={"Peter headed towards pink again?!"}/>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    )
}

export default Home;
