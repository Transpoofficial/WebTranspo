"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface TrustedBy {
  id: string;
  name: string;
  logoUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const TrustedBy = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["trusted-by"],
    queryFn: async () => {
      const response = await axios.get("/api/trusted-by");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full text-center py-8">
        <p>Loading trusted partners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8">
        <p>Failed to load trusted partners</p>
      </div>
    );
  }

  const trustedByList: TrustedBy[] = data?.data || [];

  if (trustedByList.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p>No trusted partners available</p>
      </div>
    );
  }

  return (
    <div className="w-full relative flex overflow-x-hidden">
      <div className="animate-marquee flex whitespace-nowrap flex-shrink-0">
        {trustedByList.map((trusted) => (
          <Image
            key={trusted.id}
            src={trusted.logoUrl}
            alt={trusted.name}
            width={500}
            height={500}
            className="min-w-36 w-36 max-w-36 min-h-36 h-36 max-h-36 object-contain mx-4"
          />
        ))}
      </div>
      <div className="animate-marquee flex whitespace-nowrap flex-shrink-0">
        {trustedByList.map((trusted) => (
          <Image
            key={`duplicate-${trusted.id}`}
            src={trusted.logoUrl}
            alt={trusted.name}
            width={500}
            height={500}
            className="min-w-36 w-36 max-w-36 min-h-36 h-36 max-h-36 object-contain mx-4"
          />
        ))}
      </div>
    </div>
  );
};

export default TrustedBy;
