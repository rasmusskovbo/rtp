import { NextPage } from 'next';
import Layout from "@/components/global/Layout";
import RoadToPinkHead from "@/components/global/RoadToPinkHead";
import Header from "@/components/global/Header";
import CreatePost from "@/components/upload/CreatePost";

const UploadPage: NextPage = () => {
    return (
        <Layout>
            <div>
                <RoadToPinkHead title={"Upload"}/>
                <Header title={"Create Post"}/>
                <CreatePost/>
            </div>
        </Layout>

    );
};

export default UploadPage;
