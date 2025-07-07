"use client";

import ErrorPage from "@/components/error-page";
import React, { FC, useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string; statusCode?: number };
  reset: () => void;
}

const RootErrorPage: FC<ErrorProps> = ({ error }) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  return <ErrorPage statusCode={error.statusCode || 500} />;
};

export default RootErrorPage;
