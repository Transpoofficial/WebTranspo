"use client";

import ErrorPage from "@/components/error-page";
import React from "react";

const NotFoundPage = () => {
  return (
    <div>
      <ErrorPage statusCode={404} />
    </div>
  );
};

export default NotFoundPage;
