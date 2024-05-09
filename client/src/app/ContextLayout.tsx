"use client";
import React from "react";
import { ToastContainer } from "react-toastify";
import { UserProvider } from "./DataContext";
import 'react-toastify/dist/ReactToastify.css';

type Props = {};

function ContextLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children} <ToastContainer position="top-right" />
    </UserProvider>
  );
}

export default ContextLayout;
