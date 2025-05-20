"use client";

import React, { useState } from "react";
import AngkotTab from "./angkot_tab";
import ElfTab from "./elf_tab";
import TourPackages from "../app/components/tour_packages";
import HiaceTab from "./hiace_tab";

const Tabs = () => {
  const [active, setActive] = useState<number>(0);

  // Tab data
  const tabs = [
    {
      label: "Angkot",
      description: "Kapasitas 10-16 penumpang",
      content: <AngkotTab />,
    },
    {
      label: "Elf",
      description: "Kapasitas 10-16 penumpang",
      content: <ElfTab />,
    },
    {
      label: "HIACE",
      description: "Kapasitas 10-16 penumpang",
      content: <HiaceTab />,
    },
    {
      label: "Paket Wisata",
      description: "Kapasitas 10-16 penumpang",
      content: <TourPackages />,
    },
  ];

  return (
    <>
      {/* Tabs */}
      <ul className="mx-8 flex items-center bg-[#F4F4F5] border rounded-full">
        {tabs.map((tab, index) => (
          <li key={index}>
            <button
              className={`group py-4 px-8 rounded-full cursor-pointer transition duration-200 ${
                active === index ? "bg-white shadow-lg" : "hover:bg-zinc-200"
              }`}
              onClick={() => setActive(index)} // Update active tab on click
            >
              <div className="flex flex-col">
                <p
                  className={`text-left font-medium text-zinc-600 group-hover:text-zinc-900 ${
                    active === index ? "text-zinc-900" : ""
                  }`}
                >
                  {tab.label}
                </p>
                <p
                  className={`text-left text-xs text-zinc-500 group-hover:text-zinc-600 ${
                    active === index ? "text-zinc-600" : ""
                  }`}
                >
                  {tab.description}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Tabs Content */}
      <div className="mt-8">{tabs[active].content}</div>
    </>
  );
};

export default Tabs;
