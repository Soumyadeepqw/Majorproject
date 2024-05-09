"use client";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";

import marketImage from "@/assets/market1.png";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
type Props = {};

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL as string;

interface LogInFormInput {
  username: string;
  password: string;
}

interface RegistrationInput {
  username: string;
  email: string;
  password: string;
}

const logInSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const registrationSchema = yup.object({
  username: yup.string().required("Username is required"),
  email: yup.string().email().required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

function page({}: Props) {
  const [isRegistration, setIsRegistration] = useState(false);
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState } = useForm<LogInFormInput>({
    resolver: yupResolver(logInSchema),
  });

  let loggedUser;

  useEffect(() => {
    loggedUser = sessionStorage.getItem("user");

    if (loggedUser) router.replace("/app");
  }, [loading]);

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: formStateSignUp,
  } = useForm<RegistrationInput>({
    resolver: yupResolver(registrationSchema),
  });

  const onSubmit: SubmitHandler<LogInFormInput> = async (data) => {
    setLoading(true);
    console.log(data);
    const res = await fetch(`${API_URL}api/login/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resData = await res.json();
    console.log(resData);
    setLoading(false);
    if (res.status === 200) {
      sessionStorage.setItem("token", resData.token);
      sessionStorage.setItem("user", JSON.stringify(resData.user));
      // router.replace("/app");
    }
    console.log(res.status);
    if (res.status === 404) {
      console.log("test");
      // resData.detail
      toast.error("Username or Password doesn't match");
    }
  };
  const onSubmitSignUp: SubmitHandler<RegistrationInput> = async (data) => {
    setLoading(true);
    console.log(data);
    const res = await fetch(`${API_URL}api/signup/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resData = await res.json();
    setLoading(false);
    console.log(resData);
    if (res.status === 200) {
      sessionStorage.setItem("token", resData.token);
      sessionStorage.setItem("user", JSON.stringify(resData.user));
      // router.replace("/app");
    }
  };

  console.log(formState.errors);

  return (
    <Box sx={{ height: "100vh" }}>
      <Grid height="100%" container>
        <Grid
          item
          xs={12}
          md={7}
          bgcolor="rgba(0,0,0,0.8)"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          boxShadow={10}
        >
          <Box
            component="img"
            src="/logo4.png"
            sx={{ height: { xs: 200, md: 325 } }}
            alt="Logo"
            style={{ filter: "drop-shadow(0 0 0.125rem blue)" }}
          />
          <Typography color="white" sx={{ fontSize: { xs: 32, md: 64 } }}>
            MZone
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          md={5}
          bgcolor="whitesmoke"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            background:
              "linear-gradient(151deg, rgba(48,48,48,1) 0%, rgba(196,213,231,1) 44%,rgba(255,255,255,1) 90%)",
          }}
        >
          {isRegistration ? (
            <Box
              display="flex"
              gap={2}
              flexDirection="column"
              component="form"
              autoComplete="off"
              onSubmit={handleSubmitSignUp(onSubmitSignUp)}
              boxShadow={4}
              borderRadius={1}
              // sx={{backdropFilter:'brightness(1.2)', padding:2}}
              sx={{ padding: 2, paddingTop: 3 }}
            >
              <TextField
                variant="standard"
                sx={{ minWidth: "300px", borderRadius: 1 }}
                {...registerSignUp("username")}
                placeholder="UserName"
                error={Boolean(formStateSignUp.errors.username)}
                helperText={formStateSignUp.errors.username?.message}
              />
              <TextField
                variant="standard"
                sx={{ minWidth: "300px", borderRadius: 1 }}
                {...registerSignUp("email")}
                placeholder="Email"
                error={Boolean(formStateSignUp.errors.email)}
                helperText={formStateSignUp.errors.email?.message}
                type="email"
              />
              <TextField
                variant="standard"
                placeholder="Password"
                {...registerSignUp("password")}
                error={Boolean(formStateSignUp.errors.password)}
                helperText={formStateSignUp.errors.password?.message}
                type="password"
              />
              <LoadingButton
                type="submit"
                sx={{ marginTop: 1 }}
                variant="contained"
                loading={loading}
              >
                Register
              </LoadingButton>
            </Box>
          ) : (
            <Box
              display="flex"
              gap={2}
              flexDirection="column"
              component="form"
              autoComplete="off"
              onSubmit={handleSubmit(onSubmit)}
              boxShadow={4}
              borderRadius={1}
              // sx={{backdropFilter:'brightness(1.2)', padding:2}}
              sx={{ padding: 2, paddingTop: 3 }}
            >
              <TextField
                variant="standard"
                sx={{ minWidth: "300px", borderRadius: 1 }}
                {...register("username")}
                placeholder="UserName"
                error={Boolean(formState.errors.username)}
                helperText={formState.errors.username?.message}
              />
              <TextField
                variant="standard"
                placeholder="Password"
                {...register("password")}
                error={Boolean(formState.errors.password)}
                helperText={formState.errors.password?.message}
                type="password"
              />
              <LoadingButton
                type="submit"
                sx={{ marginTop: 1 }}
                variant="contained"
                loading={loading}
              >
                Sign In
              </LoadingButton>
            </Box>
          )}
          <Typography mt={2} variant="body1">
            {!isRegistration ? "New to MZone?" : "Already User?"}

            <Button
              onClick={() => {
                setIsRegistration((s) => !s);
              }}
              size="small"
            >
              {isRegistration ? "Sign In" : "Register"}
            </Button>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default page;
