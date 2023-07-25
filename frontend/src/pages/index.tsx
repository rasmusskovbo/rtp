import Head from 'next/head'
import Navbar from '../components/Navbar'
import PostPreview from '../components/PostPreview'
import Layout from "@/components/Layout";
import ImageCarousel from "@/components/ImageCarousel";
import RoadToPinkHead from "@/components/RoadToPinkHead";
import Header from "@/components/Header";

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
                <RoadToPinkHead title={"Home"}/>
                <Navbar/>
                <Header title={"Road To Pink"} subtitle={"A League Of Would-Be Champions"}/>
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
