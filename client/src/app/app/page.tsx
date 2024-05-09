"use client";
import { Box, Grid, IconButton, Typography } from "@mui/material";
import React, { useRef, useState, useEffect, useContext } from "react";

import Masonry from "@mui/lab/Masonry";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import StarIcon from "@mui/icons-material/Star";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import ProductCard from "@/components/ProductCard";
import UserContext from "../DataContext";
import { useRouter } from "next/navigation";

type Props = {};

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;

function page({}: Props) {
  const [productDataSuggestion, setProductDataSuggestion] =
    useState<ProductType[]>();
  const [productDataNew, setProductDataNew] = useState<ProductType[]>();
  const [heroProducts, setHeroProducts] = useState<ProductType[]>([]);
  const { user } = useContext(UserContext)!;
  const router = useRouter()

  // console.log("test", user?.id);

  useEffect(() => {
    const userId = String(user?.id);

    const fetchData = async () => {
      const res = await fetch(`${baseURL}api/products-home`, {
        body: JSON.stringify(userId),
        method: "POST",
        headers: { "Content-type": "application/json" },
      });
      const res1 = await fetch(`${baseURL}api/products-new`, {
        body: JSON.stringify(userId),
        method: "POST",
        headers: { "Content-type": "application/json" },
      });
      const res2 = await fetch(`${baseURL}api/products-hero`);
      const resData = await res.json();
      const resData1 = await res1.json();
      const resData2 = await res2.json();
      setProductDataSuggestion(resData);
      setProductDataNew(resData1);
      setHeroProducts(resData2);
      //   console.log(resData);
    };
    fetchData();
  }, [user]);

  return (
    <Box my={5}>
      {/* hero section */}
      <Box
        display="flex"
        boxShadow={3}
        borderRadius={1}
        p={2}
        width="100%"
        my={2}
        justifyContent="center"
      >
        <Box maxWidth="70vw" minHeight={300}>
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{
              delay: 1500,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper"
          >
            {heroProducts?.map((e) => (
              <SwiperSlide
                onClick={() => {
                  router.push(
                    `/app/product/${e.id}?name=${e.name}`
                  );
                }}
                key={e.id}
                style={{ height: "100%",cursor:'pointer' }}
              >
                <Box
                  display="flex"
                  mx={4}
                  alignItems="center"
                  justifyContent="space-evenly"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Box component="img" height={300} maxWidth={375} src={e.image_url} />
                  <Box>
                    <Typography variant="h5">{e.name}</Typography>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6">{e.brand}</Typography>
                      <Box display="flex" gap={1} alignItems="center">
                        <StarIcon sx={{ color: "#faaf00" }} />
                        <Typography variant="h6">{e.rating}</Typography>
                      </Box>
                    </Box>
                    <Typography> £ {e.price}</Typography>
                    <Typography variant="h6">
                      {e.discount ?? "30%"} off
                    </Typography>
                  </Box>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Box>
      <Typography mt={5} textAlign="center" variant="h4">
        NEW ARRIVALS AT THE STORE
      </Typography>

      <Box my={3} display="flex" gap={1.5} flexWrap="wrap">
        {productDataNew ? (
          <Masonry spacing={1.5} columns={{ xs: 1, sm: 2, md: 4 }}>
            {productDataNew.map((e) => {
              return (
                <ProductCard
                  setProductData={setProductDataNew}
                  key={e.id}
                  productData={e}
                />
              );
            })}
          </Masonry>
        ) : (
          <Box>Loading...</Box>
        )}
      </Box>
      <Typography mt={5} textAlign="center" variant="h4">
        POPULAR PRODUCTS
      </Typography>

      <Box my={3} display="flex" gap={1.5} flexWrap="wrap">
        {productDataSuggestion ? (
          <Masonry spacing={1.5} columns={{ xs: 1, sm: 2, md: 4 }}>
            {productDataSuggestion.map((e) => {
              return (
                <ProductCard
                  setProductData={setProductDataSuggestion}
                  key={e.id}
                  productData={e}
                />
              );
            })}
          </Masonry>
        ) : (
          <Box>Loading...</Box>
        )}
      </Box>
    </Box>
  );
}

export default page;
