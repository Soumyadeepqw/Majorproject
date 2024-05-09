"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import ProTip from "@/components/ProTip";
import Copyright from "@/components/Copyright";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";

export default function Home() {
  const router = useRouter();
  router.replace("/app");
  return (
    <Box sx={{ display: "flex",height:'100vh', justifyContent:'center', alignItems:'center' }}>
      <CircularProgress />
    </Box>
  );
}
