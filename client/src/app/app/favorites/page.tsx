"use client";
import React, { useContext, useEffect, useState } from "react";
import Masonry from "@mui/lab/Masonry";
import { Box, Typography } from "@mui/material";
import ProductCard from "@/components/ProductCard";
import UserContext from "@/app/DataContext";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

type Props = {};

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;

function page({}: Props) {
  const [productData, setProductData] = useState<ProductType[]>();
  const { user } = useContext(UserContext)!;
  const userId = String(user?.id);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${baseURL}api/favorites`, {
        body: JSON.stringify({ userId }),
        method: "POST",
        headers: { "Content-type": "application/json" },
      });
      const resData = await res.json();
      setProductData(resData);
      //   console.log(resData);
    };
    fetchData();
  }, [user]);

//   if (!user?.id && productData?.length === 0) {
//     return (
//       <Box my={5} display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
//         <Box display="flex" alignItems='center' flexDirection="column" gap={2}>
//           <SentimentDissatisfiedIcon sx={{ fontSize: 86 }} />
//           <Typography variant="h6" textAlign="center">
//             Please log in to see your favorites or add to favorites
//           </Typography>
//         </Box>
//       </Box>
//     );
//   }
  if (productData && productData.length === 0) {
    return (
      <Box
        my={5}
        display="flex"
        gap={1.5}
        flexWrap="wrap"
        alignItems="center"
        minHeight={300}
        justifyContent="center"
      >
        <Box display="flex" alignItems='center' flexDirection="column" gap={2}>
          <SentimentDissatisfiedIcon sx={{ fontSize: 86 }} />
          <Typography variant="h6" textAlign="center">
            Currently you don't have item in Favorites
          </Typography>
        </Box>
      </Box>
    );
  }

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
