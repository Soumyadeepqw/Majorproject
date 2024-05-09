"use client";
import React, { useContext } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
} from "@mui/material";
import moment from "moment";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import UserContext from "@/app/DataContext";
import { toast } from "react-toastify";

type Props = {};

function getGreeting() {
  const now = moment();
  const hour = now.hour();
  let greeting;
  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour < 20) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Night";
  }

  return greeting;
}

const dummyData = [
  {
    id: 5,
    name: "PUMA Women's Ess Logo Hoodie",
    brand: "PUMA",
    price: "44.99",
    rating: "4.5",
    discount: null,
    image_url: "https://m.media-amazon.com/images/I/61HWk6JuL6L._AC_SY500_.jpg",
    color: "white",
    gender: "female",
    category: "hoodies",
    is_favorited: false,
    quantity: 1,
  },
  {
    id: 4,
    name: "AOTORR Ladies Plain Hoodie",
    brand: "AOTORR ",
    price: "29.99",
    rating: "4.3",
    discount: null,
    image_url: "https://m.media-amazon.com/images/I/61oL-QYMLYL._AC_SY445_.jpg",
    color: "black",
    gender: "female",
    category: "hoodies",
    is_favorited: true,
    quantity: 1,
  },
  {
    id: 97,
    name: 'LG OLED evo C3 42" 4K Smart TV',
    brand: "LG",
    price: "838.75",
    rating: "4.6",
    discount: null,
    image_url:
      "https://m.media-amazon.com/images/I/81hbVMzyFkL._AC_SL1500_.jpg",
    color: "nan",
    gender: "nan",
    category: "gadgets",
    is_favorited: false,
    quantity: 1,
  },
  {
    id: 86,
    name: "Pokemon - Pikachu",
    brand: "Funko",
    price: "9.75",
    rating: "4.7",
    discount: null,
    image_url:
      "https://m.media-amazon.com/images/I/71UfQ2OhiKL._AC_SL1500_.jpg",
    color: "nan",
    gender: "nan",
    category: "toys",
    is_favorited: true,
    quantity: 1,
  },
  {
    id: 102,
    name: "Xiaomi Redmi Note 13 Black 128GB",
    brand: "Xiomi",
    price: "159.00",
    rating: "4.1",
    discount: null,
    image_url:
      "https://m.media-amazon.com/images/I/512yl9+afbL._AC_SL1001_.jpg",
    color: "nan",
    gender: "nan",
    category: "mobiles",
    is_favorited: false,
    quantity: 1,
  },
  {
    id: 101,
    name: "UMIDIGI A15C NFC Mobile Phone",
    brand: "UMIDIGI",
    price: "144.49",
    rating: "3.8",
    discount: null,
    image_url:
      "https://m.media-amazon.com/images/I/71F4rDz+uYL._AC_SL1500_.jpg",
    color: "nan",
    gender: "nan",
    category: "mobiles",
    is_favorited: false,
    quantity: 1,
  },
  {
    id: 8,
    name: "Hogwarts Legacy : Deluxe",
    brand: "WBIEUK",
    price: "59.99",
    rating: "4.0",
    discount: null,
    image_url: "https://m.media-amazon.com/images/I/61yaFmIU1nL._AC_SY741_.jpg",
    color: "nan",
    gender: "nan",
    category: "games",
    is_favorited: false,
    quantity: 1,
  },
];

function page({}: Props) {
  const { user, cart, addToCart, reduceQuantity, removeFromCart, loading } =
    useContext(UserContext)!;
  //   console.log(cart);
  if (loading) {
    return (
      <Box minHeight={300} display='flex' justifyContent='center' alignItems='center'>
        <CircularProgress />
      </Box>
    );
  }
  if (cart.length === 0 && !loading) {
    return (
      <Box>
        <Box>
          <Typography variant="h6">
            {`${getGreeting()} ${user?.username ?? "Visitor"},`}{" "}
          </Typography>
        </Box>
        <Box
          p={2}
          m={{ xs: 1, md: 4 }}
          boxShadow={4}
          borderRadius={2}
          minHeight={300}
        >
          <Grid container spacing={2} pl={2} pt={2}>
            <Grid
              item
              xs={12}
              boxShadow={1}
              mb={1}
              p={3}
              display="flex"
              justifyContent="center"
            >
              <Box>Currently, you don't have any products in your cart</Box>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="center">
              <SentimentDissatisfiedIcon sx={{ fontSize: 86 }} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }
  return (
    <Box>
      <Box>
        <Typography variant="h6">
          {`${getGreeting()} ${user?.username ?? "Visitor"},`}{" "}
        </Typography>
      </Box>
      <Box p={2} pt={4} m={{ xs: 1, md: 4 }} boxShadow={4} borderRadius={2}>
        <Grid container spacing={2} pl={2} pt={2}>
          {cart.map((product) => (
            <React.Fragment key={product.id}>
              <Grid item xs={12} md={6} boxShadow={1} mb={1} p={1}>
                <Box
                  component="img"
                  src={product.image_url}
                  height={150}
                  width={150}
                />
                <Typography>{product.name}</Typography>
                <Typography>Brand: {product.brand}</Typography>
                <Typography>Rating: {product.rating}</Typography>
              </Grid>
              <Grid
                boxShadow={1}
                mb={1}
                p={1}
                item
                xs={12}
                md={6}
                display={{ xs: "block", md: "flex" }}
                alignItems="center"
                justifyContent="space-around"
              >
                <Box>
                  Quantity: {product.quantity}
                  <Tooltip title="Add quantity">
                    <IconButton
                      onClick={() => {
                        if (product.quantity === 10) {
                          toast.info(
                            "Sorry, you can't order more than 10 quantity per item"
                          );
                        } else {
                          addToCart(product);
                        }
                        // toast.success('Cart updated')
                      }}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reduce quantity">
                    <IconButton
                      onClick={() => {
                        if (product.quantity === 1) {
                          removeFromCart(product);
                          toast.success("Product removed from cart");
                        } else {
                          reduceQuantity(product);
                        }
                      }}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                  <Box>
                    £ {(Number(product.price) * product.quantity).toFixed(2)}
                  </Box>
                  <Tooltip title="Remove product">
                    <IconButton
                      onClick={() => {
                        removeFromCart(product);
                        toast.success("Product removed from cart");
                      }}
                    >
                      <HighlightOffIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </React.Fragment>
          ))}
          <Grid
            item
            xs={12}
            md={6}
            boxShadow={1}
            mb={1}
            p={1}
            display={{ xs: "block", md: "flex" }}
            alignItems="center"
            justifyContent="space-around"
          >
            <Box>Your Products will be delivered in 2 days 😊🥳</Box>
          </Grid>

          <Grid
            boxShadow={1}
            mb={1}
            p={1}
            item
            xs={12}
            md={6}
            display={{ xs: "block", md: "flex" }}
            alignItems="center"
            justifyContent="space-around"
          >
            <Box>
              Total: £{" "}
              {cart
                .reduce((a, c) => {
                  const sum =
                    a + Number((Number(c.price) * c.quantity).toFixed(2));
                  return sum;
                }, 0)
                .toFixed(2) ?? 0}
            </Box>
          </Grid>
          <Grid item my={2} xs={12} display="flex" justifyContent="center">
            <Button
              sx={{ width: "50%" }}
              color="warning"
              size="large"
              variant="contained"
            >
              Proceed to Pay
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
  
}

export default page;
