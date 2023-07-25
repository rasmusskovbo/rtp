import React, { useState, useEffect } from 'react';
import Image from "next/image";

interface ImageCarouselProps {
    images: string[];
}



const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prevIndex) => {
                return (prevIndex + 1) % images.length;
            });
        }, 5000);
        return () => clearInterval(timer);
    }, [images]);

    const handlePrevious = () => {
        setIndex((prevIndex) => {
            return (prevIndex - 1 + images.length) % images.length;
        });
    };

    const handleNext = () => {
        setIndex((prevIndex) => {
            return (prevIndex + 1) % images.length;
        });
    };

    return (
        <div className="carousel slide" data-ride="carousel">
            <div className="carousel-inner">
                {images.map((image, idx) => (
                    <div key={idx} className={`carousel-item ${idx === index ? 'active' : ''}`}>
                        <Image src={image} alt="carousel" width={1024} height={576} layout="responsive" className="d-block w-100" />
                    </div>
                ))}
            </div>
            <ol className="carousel-indicators">
                {images.map((_, idx) => (
                    <li
                        key={idx}
                        data-target="#carouselExampleIndicators"
                        data-slide-to={idx}
                        className={idx === index ? 'active' : ''}
                    ></li>
                ))}
            </ol>
            <button className="carousel-control-prev" type="button" onClick={handlePrevious}>
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" onClick={handleNext}>
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
};

export default ImageCarousel;
