"use client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
  };

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  return (
    <div>
      <h1>Dashboard</h1>
      {session ? (
        <div>
          <p>Signed in as: {session.user?.email}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <p>Loading session...</p>
      )}
    </div>
  );
};

export default DashboardPage;
