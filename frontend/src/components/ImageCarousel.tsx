import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import Image from 'next/image';
import {Container} from "react-bootstrap";

interface CarouselComponentProps {
    images: string[];
}

const ImageCarousel: React.FC<CarouselComponentProps> = ({ images }) => {
    const [index, setIndex] = useState<number>(0);

    const handleSelect = (selectedIndex: number, e: Record<string, unknown> | null) => {
        setIndex(selectedIndex);
    };

    return (
        <Container>
            <Carousel activeIndex={index} onSelect={handleSelect} interval={5000}>
                {images.map((image, idx) => (
                    <Carousel.Item key={idx}>
                        <Image src={image} alt={`carousel ${idx}`} width={1024} height={576} layout="responsive" className="d-block w-100" />
                    </Carousel.Item>
                ))}
            </Carousel>
        </Container>
    );
}

export default ImageCarousel;
