import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';



// import required modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

export default function Slider() {
  return (
    <>
      <Swiper 
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: false,
        }}
        navigation={false}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper w-full h-full"
      >
        <SwiperSlide> <img src="/Cover_Image.jpg" alt="cover" className='object-cover w-full h-full '   /></SwiperSlide>
        <SwiperSlide> <img src="/image.jpg" alt="cover" className='object-cover w-full h-full '   /></SwiperSlide>
       {/* <SwiperSlide> <img src="/Alger.jpeg" alt="cover" className='object-cover w-full h-full '   /></SwiperSlide>*/}
      </Swiper>
    </>
  );
}