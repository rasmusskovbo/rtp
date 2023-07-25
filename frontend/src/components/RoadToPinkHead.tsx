import React, { FC } from "react";
import Head from "next/head";

interface RoadToPinkHeadProps {
    title: string;
}

const RoadToPinkHead: FC<RoadToPinkHeadProps> = ({ title }) => {
    return (
        <Head>
            <title>{title} | Road To Pink </title>
            <link rel="icon" href="/favicon.ico" />
            <link href="https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic" rel="stylesheet" type="text/css" />
            <link href="https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800" rel="stylesheet" type="text/css" />
        </Head>
    );
};

export default RoadToPinkHead;
