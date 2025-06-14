"use client";

import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { Facebook, Instagram, Store, Twitter } from "lucide-react";

interface HeaderProps {
  scrollToAdvantage?: () => void;
  scrollToHowToOrder?: () => void;
  scrollToService?: () => void;
  scrollToArticle?: () => void;
  scrollToReview?: () => void;
  isLandingPage?: boolean;
}

const Footer: React.FC<HeaderProps> = ({
  scrollToAdvantage,
  scrollToHowToOrder,
  scrollToService,
  scrollToArticle,
  scrollToReview,
}) => {
  return (
    <>
      <footer className="grid grid-cols-12 gap-x-4 py-4 px-4 md:px-10 bg-[#0897B1]">
        <div className="col-span-12 md:col-span-4">
          <div className="flex items-center gap-x-4">
            <div className="flex flex-col items-center">
              <Image
                src="/images/logo/logo_2.png"
                alt="logo_2.png"
                width={100}
                height={100}
              />
              <h5 className="text-lg font-bold text-white">TRANSPO</h5>
            </div>

            <div className="flex flex-col gap-y-4">
              <p className="text-sm md:text-base text-white">
                Dari Malang Raya untuk Indonesia
              </p>

              <div className="flex items-center">
                <Button
                  className="hover:bg-zinc-400/[.4]"
                  variant="ghost"
                  size="icon"
                >
                  <Facebook color="#FFFFFF" />
                </Button>
                <Button
                  className="hover:bg-zinc-400/[.4]"
                  variant="ghost"
                  size="icon"
                >
                  <Instagram color="#FFFFFF" />
                </Button>
                <Button
                  className="hover:bg-zinc-400/[.4]"
                  variant="ghost"
                  size="icon"
                >
                  <Twitter color="#FFFFFF" />
                </Button>
                <Button
                  className="hover:bg-zinc-400/[.4]"
                  variant="ghost"
                  size="icon"
                >
                  <Store color="#FFFFFF" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-3 flex flex-col gap-y-1 mt-4 md:mt-0">
          <h5 className="text-base md:text-lg font-medium text-white mb-1">
            Contact Us
          </h5>
          <p className="text-xs md:text-sm text-white">(+62) 85-6423-8880</p>
          <p className="text-xs md:text-sm text-white">
            Jl. Raya Karangsono No.18A, Sono Tengah, Kebonagung, Kec. Pakisaji,
            Kabupaten Malang, Jawa Timur 65162
          </p>
        </div>

        <div className="col-span-12 md:col-span-2 mt-4 md:mt-0">
          <h5 className="text-base md:text-lg font-medium text-white mb-2">
            Business Hours
          </h5>
          <p className="text-xs md:text-sm text-white">
            Mon - Sat: 8 am - 8 pm
          </p>
          <p className="text-xs md:text-sm text-white">Sunday: 8 am - 6 pm</p>
        </div>

        <ul className="col-span-12 md:col-span-3 mt-4 md:mt-0">
          <li>
            <Button
              onClick={scrollToHowToOrder}
              variant="link"
              className="text-white"
            >
              Cara pesan
            </Button>
          </li>
          <li>
            <Button
              onClick={scrollToAdvantage}
              variant="link"
              className="text-white"
            >
              Kelebihan
            </Button>
          </li>
          <li>
            <Button
              onClick={scrollToService}
              variant="link"
              className="text-white"
            >
              Layanan
            </Button>
          </li>
          <li>
            <Button
              onClick={scrollToArticle}
              variant="link"
              className="text-white"
            >
              Artikel
            </Button>
          </li>
          <li>
            <Button
              onClick={scrollToReview}
              variant="link"
              className="text-white"
            >
              Review
            </Button>
          </li>
        </ul>
      </footer>
    </>
  );
};

export default Footer;
