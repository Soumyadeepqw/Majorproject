"use client";
import React, { useEffect, useState, useContext } from "react";
import Masonry from "@mui/lab/Masonry";
import { Box } from "@mui/material";
import ProductCard from "@/components/ProductCard";
import UserContext from "@/app/DataContext";

type Props = {};

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;

function page({}: Props) {
  const { user } = useContext(UserContext)!;
  const [productData, setProductData] = useState<ProductType[]>();

  useEffect(() => {
    const userId = String(user?.id);
    const cat='mobiles'
    const fetchData = async () => {
      const res = await fetch(`${baseURL}api/products/`, {
        body: JSON.stringify({userId, cat}),
        method: "POST",
        headers: { "Content-type": "application/json" },
      });
      const resData = await res.json();
      setProductData(resData);
      //   console.log(resData);
    };
    fetchData();
  }, []);

  return (
    <Box my={5} display="flex" gap={1.5} flexWrap="wrap">
      {productData ? (
        <Masonry spacing={1.5} columns={{ xs: 1, sm: 2, md: 4 }}>
          {productData.map((e) => {
            return (
              <ProductCard
                setProductData={setProductData}
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
  );
}

export default page;
