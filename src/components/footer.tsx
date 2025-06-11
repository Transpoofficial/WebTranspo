"use client";

import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { Facebook, Instagram, Store, Twitter } from "lucide-react";

const Footer = () => {
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

        <div className="col-span-12 md:col-span-2 flex flex-col gap-y-1 mt-4 md:mt-0">
          <h5 className="text-base md:text-lg font-medium text-white mb-1">
            Contact Us
          </h5>
          <p className="text-xs md:text-sm text-white">085 6423 8880</p>
          <p className="text-xs md:text-sm text-white">
            Ruko Bajang Ratu Indah Jl. Candi Waringin No.5 MojolanguLowokwaru,
            Kota Malang, Jawa Timur 65142
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

        <ul className="col-span-12 md:col-span-2 mt-4 md:mt-0">
          <li>
            <Button variant="link" className="cursor-pointer text-white p-0">
              Home
            </Button>
          </li>
          <li>
            <Button variant="link" className="cursor-pointer text-white p-0">
              About Us
            </Button>
          </li>
          <li>
            <Button variant="link" className="cursor-pointer text-white p-0">
              Services
            </Button>
          </li>
          <li>
            <Button variant="link" className="cursor-pointer text-white p-0">
              Contact
            </Button>
          </li>
        </ul>

        <div className="col-span-12 md:col-span-2 flex flex-col items-start mt-4 md:mt-0">
          <Button variant="link" className="cursor-pointer text-white p-0">
            Terms and conditions
          </Button>
          <Button variant="link" className="cursor-pointer text-white p-0">
            Privacy policy
          </Button>
        </div>
      </footer>
    </>
  );
};

export default Footer;
