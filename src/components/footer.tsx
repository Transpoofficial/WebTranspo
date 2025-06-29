"use client";

import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import {
  Instagram,
  Linkedin,
  Music2,
} from "lucide-react";
import Link from "next/link";

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
              <p className="text-xs md:text-sm text-white">
                PT. Transpo Indonesia Mandiri melayani paket Private Tour
                Malang-Batu, paket Open-Trip Malang-Batu, rental Angkot, HIACE
                Commuter, HIACE Premio, dan ELF Giga
              </p>

              <div className="flex items-center">
                <Link
                  href="https://www.tiktok.com/@transpo.official"
                  target="_blank"
                >
                  <Button
                    className="hover:bg-zinc-400/[.4]"
                    variant="ghost"
                    size="icon"
                  >
                    <Music2 color="#FFFFFF" />
                  </Button>
                </Link>
                <Link
                  href="https://www.instagram.com/transpo_official"
                  target="_blank"
                >
                  <Button
                    className="hover:bg-zinc-400/[.4]"
                    variant="ghost"
                    size="icon"
                  >
                    <Instagram color="#FFFFFF" />
                  </Button>
                </Link>
                <Link
                  href="https://www.linkedin.com/company/transpo-indonesia/"
                  target="_blank"
                >
                  <Button
                    className="hover:bg-zinc-400/[.4]"
                    variant="ghost"
                    size="icon"
                  >
                    <Linkedin color="#FFFFFF" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-3 flex flex-col gap-y-1 mt-4 md:mt-0">
          <h5 className="text-base md:text-lg font-medium text-white mb-1">
            Legalitas: PT. Transpo Indonesia Mandiri
          </h5>
          <p className="text-xs md:text-sm text-white">
            WhatsApp: 0822-3137-8326
          </p>
          <p className="text-xs md:text-sm text-white">
            Alamat Kantor: <br />
            Jl. Raya Karangsono no.18A, RT.61/RW.12, Kebonagung, Pakisaji, Kab.
            Malang
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
              className="text-white pl-0"
            >
              Cara pesan
            </Button>
          </li>
          <li>
            <Button
              onClick={scrollToAdvantage}
              variant="link"
              className="text-white pl-0"
            >
              Kelebihan
            </Button>
          </li>
          <li>
            <Button
              onClick={scrollToService}
              variant="link"
              className="text-white pl-0"
            >
              Layanan
            </Button>
          </li>
          <li>
            <Button
              onClick={scrollToArticle}
              variant="link"
              className="text-white pl-0"
            >
              Artikel
            </Button>
          </li>
          <li>
            <Button
              onClick={scrollToReview}
              variant="link"
              className="text-white pl-0"
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
