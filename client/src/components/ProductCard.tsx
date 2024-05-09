import React, { useContext } from "react";
import { Box, Grid, IconButton } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, CardActions } from "@mui/material";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { toast } from "react-toastify";
import UserContext from "@/app/DataContext";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  productData: ProductType;
  setProductData: any;
  setSearchInput?: any;
  searchInput?: any;
};

const labels: { [index: string]: string } = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "Ok",
  3: "Ok+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;

function ProductCard({
  productData,
  setProductData,
  setSearchInput,
  searchInput,
}: Props) {
  const router = useRouter();
  const pathName = usePathname();
  const { user, addToCart } = useContext(UserContext)!;

  const toggleFav = async (productId: number) => {
    if (!user?.id) {
      toast.error("Please log in to mark favorite");
    } else {
      const payload = {
        userId: user.id,
        productId,
      };
      const res = await fetch(`${baseURL}api/toggle-favorite`, {
        body: JSON.stringify(payload),
        method: "POST",
        headers: { "Content-type": "application/json" },
      });

      if (res.status === 200) {
        toast.success("Removed from favorites");
        // console.log(pathName)
        if (pathName === "/app/favorites") {
          setProductData((s: ProductType[]) => {
            return s.filter((e) => e.id !== productId);
          });
        } else
          setProductData((s: ProductType[]) => {
            return s.map((e: ProductType) => {
              if (e.id === productId) {
                return { ...e, is_favorited: false };
              } else return e;
            });
          });
      }
      if (res.status === 201) {
        toast.success("Added to favorites");
        setProductData((s: ProductType[]) => {
          return s.map((e: ProductType) => {
            if (e.id === productId) {
              return { ...e, is_favorited: true };
            } else return e;
          });
        });
      }
    }
  };

  //  console.log(productData.category)
  //  console.log(productData.warranty)
  return (
    <Card
      key={productData.id}
      elevation={3}
      sx={{
        "&:hover": {
          boxShadow: 8,
        },
      }}
    >
      <CardActionArea
        onClick={() => {
          if (searchInput) {
            setTimeout(() => {
              setProductData(undefined);
              setSearchInput("");
            }, 500);
          }
          router.push(
            `/app/product/${productData.id}?name=${productData.name}`
          );
        }}
      >
        <CardMedia
          component="img"
          height="140"
          image={productData.image_url}
          alt="green iguana"
          sx={{ objectFit: "contain", paddingTop: 1 }}
        />
        <CardContent
          sx={{
            height: "185px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography gutterBottom variant="h5" component="div">
            {/* {productData.name.length<16?productData.name:`${productData.name} ${productData.rating}+`} */}
            {productData.name}
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" color="text.secondary">
              {productData.brand}
            </Typography>
            {productData.category === "hoodies" ? (
              <Typography variant="body2" fontSize={12} color="text.secondary">
                {`${productData?.gender.toUpperCase()}, ${productData?.color.toUpperCase()} (${
                  productData?.sizes
                })`}
              </Typography>
            ) : null}
            {productData.category === "gadgets" ? (
              <Typography variant="body2" fontSize={12} color="text.secondary">
                {productData?.warranty !== "nan"
                  ? `${productData?.warranty} Year(s) Warranty
                `
                  : null}
              </Typography>
            ) : null}
          </Box>
          <Box
            sx={{
              width: 200,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Rating
              name="text-feedback"
              value={Number(productData.rating)}
              readOnly
              precision={0.1}
              emptyIcon={
                <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
              }
            />
            <Box sx={{ ml: 2 }}>
              {labels[Math.round(+productData.rating * 2) / 2]}
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography mt={1} variant="h5" color="text.secondary">
              £ {productData.price}
            </Typography>
            <Typography mt={1} color="text.secondary">
              {productData.discount} % Off
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Button
          onClick={() => {
            addToCart(productData);
            toast.success("Added to the cart");
          }}
          size="small"
          color="primary"
        >
          Add to Cart
        </Button>
        <IconButton onClick={() => toggleFav(productData.id)}>
          <FavoriteIcon
            sx={{
              color: productData.is_favorited ? "#ff3d47" : "inherit",
              "&:hover": { color: "#ff3d47" },
            }}
          />
        </IconButton>
      </CardActions>
    </Card>
  );
}

export default ProductCard;
