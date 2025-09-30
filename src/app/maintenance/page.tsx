"use client";

import RootErrorPage from "../error";

export default function MaintenancePage() {
  const error = new Error("Layanan sedang dalam maintenance. Silakan coba lagi nanti.") as Error & {
    statusCode: number;
  };
  error.statusCode = 503;

  const reset = () => {
    window.location.href = "/";
  };

  return <RootErrorPage error={error} reset={reset} />;
}
