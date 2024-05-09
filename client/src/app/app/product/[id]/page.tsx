"use client";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Rating,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  IconButton,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";
import UserContext from "@/app/DataContext";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import { toast } from "react-toastify";
import moment from "moment";
import PersonIcon from "@mui/icons-material/Person";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ReviewsIcon from "@mui/icons-material/Reviews";
import NotesIcon from "@mui/icons-material/Notes";
import LoadingButton from "@mui/lab/LoadingButton";

type Props = {
  params: {
    id: string;
  };
};

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;

function page({ params: { id } }: Props) {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const { user } = useContext(UserContext)!;
  const [productData, setProductData] = useState<ProductType>();
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(2.5);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewLoading, setReviewLoading] = useState<undefined | boolean>();
  const [productReviews, setProductReviews] = useState<Review[]>();

  const fetchReviews = async () => {
    setReviewLoading(true);
    const res = await fetch(`${baseURL}api/reviews`, {
      body: JSON.stringify({ productId: id }),
      method: "POST",
      headers: { "Content-type": "application/json" },
    });
    const resData = await res.json();
    setProductReviews(resData);
    setReviewLoading(false);

    // console.log(resData);
  };

  useEffect(() => {
    let userId: number | string;
    if (user?.id) {
      userId = user.id;
    } else {
      userId = "undefined";
    }
    const fetchData = async () => {
      // setLoading(true);
      const res = await fetch(`${baseURL}api/product-by-id`, {
        body: JSON.stringify({ userId, productId: id }),
        method: "POST",
        headers: { "Content-type": "application/json" },
      });
      const resData = await res.json();
      setProductData(resData);
      setTimeout(() => {
        setLoading(false);
      }, 500);
      //   console.log(resData);
    };

    fetchData();
    fetchReviews();
  }, [id]);

  const onSubmitReview = async () => {
    if (!user?.id) {
      toast.info("Please sign in to review");
      return;
    }
    if (!review) {
      toast.error("Review field is empty");
      return;
    }
    setSubmitting(true);

    const res = await fetch(`${baseURL}api/review-add`, {
      body: JSON.stringify({
        userId: user?.id,
        productId: id,
        reviewText: review,
        rating,
      }),
      method: "POST",
      headers: { "Content-type": "application/json" },
    });
    if (res.status === 201) toast.success("Review has been added");
    setSubmitting(false);
    setReview("");
    setRating(2.5);
    await fetchReviews();

    // const resData = await res.json();
  };

  const deleteReview = async (reviewId: number) => {
    const res = await fetch(`${baseURL}api/review-delete`, {
      body: JSON.stringify({
        userId: user?.id,
        reviewId,
      }),
      method: "POST",
      headers: { "Content-type": "application/json" },
    });
    if (res.status === 204) toast.success("Review removed");
    await fetchReviews();
    // const resData = await res.json();
  };

  if (loading) {
    return (
      <Box
        minHeight={300}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box p={2}>
      <Grid container my={2} boxShadow={2} p={2}>
        <Grid
          item
          xs={12}
          md={6}
          pr={{ xs: 0, md: 1 }}
          borderRight={{ xs: "none", md: "1px solid #bebebe" }}
        >
          <Box component="img" src={productData?.image_url} width="100%" />
        </Grid>
        <Grid
          item
          p={2}
          xs={12}
          md={6}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Box display="flex" gap={1} alignItems="center">
            <Box>
              <Typography fontWeight={500}>Name:</Typography>
              <Typography fontWeight={500}>Brand:</Typography>
              <Typography fontWeight={500}>Category:</Typography>
              {productData?.category === "hoodies" ? (
                <>
                  <Typography fontWeight={500}>Gender:</Typography>
                  <Typography fontWeight={500}>Color:</Typography>
                  <Typography fontWeight={500}>Sizes:</Typography>
                </>
              ) : null}

              {productData?.category === "gadgets" ? (
                <Typography fontWeight={500}>Warranty: </Typography>
              ) : null}
              <Typography fontWeight={500}>Rating:</Typography>
            </Box>
            <Box>
              <Typography>{name}</Typography>
              <Typography>{productData?.brand}</Typography>
              <Typography>{productData?.category.toUpperCase()}</Typography>
              {productData?.category === "hoodies" ? (
                <>
                  <Typography>{productData?.gender.toUpperCase()}</Typography>
                  <Typography>{productData?.color.toUpperCase()}</Typography>
                  <Typography>{productData?.sizes}</Typography>
                </>
              ) : null}
              {productData?.category === "gadgets" ? (
                <Typography>{productData?.warranty} Year(s)</Typography>
              ) : null}

              <Typography>{productData?.rating}</Typography>
            </Box>
          </Box>

          <Typography fontWeight={500} component="div">
            Description:{" "}
            <Typography>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum
              neque iusto quisquam id. Dolore laborum, voluptates voluptatem
              veritatis excepturi nostrum reiciendis unde error, sapiente esse,
              aut eveniet ut blanditiis. Explicabo, dolorum autem sequi omnis
            </Typography>
          </Typography>
          <Typography component="div" fontWeight={500}>
            Specifications:{" "}
            <Typography>
              consequatur aliquam harum optio a. Nobis tempore aut cum
              voluptatum! Impedit consequuntur labore dignissimos at.
              Voluptatum, quia consequuntur! Adipisci laborum doloribus, ipsam
              nostrum eum voluptatum dolorem accusamus, illum cumque quam
              voluptates repudiandae minima sint ad quas, nulla consequuntur
              fugit? Ad atque magnam alias eveniet, hic saepe cupiditate soluta
              numquam veniam natus similique magni aut pariatur! Tempore earum
              laborum, nulla magnam ducimus esse cupiditate saepe? Nobis veniam
              totam, provident dignissimos soluta placeat sed quae?
            </Typography>
          </Typography>
          <Typography my={2} fontWeight={500}>
            Price: £{productData?.price}
          </Typography>
        </Grid>
      </Grid>
      <Box p={2} boxShadow={3}>
        {reviewLoading === undefined || reviewLoading ? (
          <Box sx={{ width: "100%" }}>
            <Skeleton variant="rounded" height={60} />
          </Box>
        ) : null}
        {productReviews?.length === 0 ? (
          <Box>
            <Typography>No one has reviewed this product yet.</Typography>
          </Box>
        ) : null}
        {/* @ts-ignore */}
        {productData !== undefined && productReviews?.length > 0 ? (
          <Box maxHeight={600} sx={{ overflowY: "scroll" }}>
            <Typography mb={1} variant="h6">
              Reviews:
            </Typography>
            {productReviews?.map((r) => (
              <Box display="flex" key={r.id} gap={1} alignItems="center">
                <Box flex={1} p={2} mb={1} boxShadow={1} key={r.id}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography
                      display="flex"
                      gap={1}
                      alignItems="center"
                      variant="h6"
                    >
                      <PersonIcon />
                      {r.user_name}
                    </Typography>
                    <Typography>
                      {moment(r.created_at).format("Do MMMM, YYYY h:mm:ss a")}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography display="flex" gap={1} alignItems="center">
                      <NotesIcon />
                      {r.review_text}
                    </Typography>
                    <Box>
                      <Tooltip title={r.rating}>
                        <Rating
                          value={Number(r.rating)}
                          precision={0.1}
                          readOnly
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
                {Number(r.user_id) === user?.id ? (
                  <Box>
                    <IconButton onClick={() => deleteReview(r.id)}>
                      <HighlightOffIcon />
                    </IconButton>
                  </Box>
                ) : null}
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        alignItems="center"
        p={2}
        boxShadow={3}
        my={2}
        bgcolor="#f8f8f8"
      >
        <Box position="relative" width="100%" mb={6}>
          <SentimentSatisfiedAltIcon
            sx={{ fontSize: 64, position: "absolute", right: 0, top: 0 }}
          />
          <SentimentVeryDissatisfiedIcon
            sx={{ fontSize: 64, position: "absolute", left: 0, top: 0 }}
          />
        </Box>
        <Typography display="flex" alignItems="center" gap={1} variant="h6">
          Please, share your important feedback <SentimentVerySatisfiedIcon />{" "}
        </Typography>
        <Rating
          defaultValue={rating}
          onChange={(e, v) => setRating(v ?? 0)}
          size="large"
          precision={0.5}
        />
        <TextField
          size="medium"
          sx={{ width: "50%" }}
          label="Review"
          variant="filled"
          value={review}
          multiline
          rows={2}
          onChange={(e) => {
            setReview(e.target.value);
          }}
        />
        <LoadingButton
          onClick={onSubmitReview}
          sx={{ width: "50%" }}
          variant="contained"
          loading={submitting}
        >
          Submit
        </LoadingButton>
      </Box>
    </Box>
  );
}

export default page;
