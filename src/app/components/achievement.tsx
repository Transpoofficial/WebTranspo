"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Achievement {
  id: string;
  name: string;
  logoUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const Achievement = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const response = await axios.get("/api/achievements");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full text-center py-8">
        <p>Loading achievements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8">
        <p>Failed to load achievements</p>
      </div>
    );
  }

  const achievements: Achievement[] = data?.data || [];

  if (achievements.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p>No achievements available</p>
      </div>
    );
  }

  return (
    <div className="w-full relative flex overflow-x-hidden">
      <div className="animate-marquee flex whitespace-nowrap flex-shrink-0">
        {achievements.map((achieve) => (
          <div key={achieve.id} className="flex flex-col items-center gap-2 mx-4">
            <Image
              src={achieve.logoUrl}
              alt={achieve.name}
              width={500}
              height={500}
              className="min-w-36 w-36 max-w-36 min-h-36 h-36 max-h-36 object-contain"
            />

            <p className="text-sm md:text-base text-center text-black font-medium">
              {achieve.name}
            </p>
          </div>
        ))}
      </div>
      <div className="animate-marquee flex whitespace-nowrap flex-shrink-0">
        {achievements.map((achieve) => (
          <div key={`duplicate-${achieve.id}`} className="flex flex-col items-center gap-2 mx-4">
            <Image
              src={achieve.logoUrl}
              alt={achieve.name}
              width={500}
              height={500}
              className="min-w-36 w-36 max-w-36 min-h-36 h-36 max-h-36 object-contain"
            />
            <p className="text-sm md:text-base text-center text-black font-medium">
              {achieve.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievement;
