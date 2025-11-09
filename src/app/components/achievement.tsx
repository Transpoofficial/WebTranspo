import Image from "next/image";

const Achievement = () => {
  const achievementLogos = [
    {
      name: "Runner-Up Goto Impact 2024",
      path: "/images/achievement/Runner_Up_goto_impact_2024.png",
    },
    {
      name: "Finalis SheHacks 2024",
      path: "/images/achievement/Finalis_SheHacks_2024.png",
    },
    {
      name: "Juara 1 Karya Produk Inovatif",
      path: "/images/achievement/juara_1_karya_inovatif_direktorat_inovasi.png",
    },
    {
      name: "Finalis KMI EXPO 2024",
      path: "/images/achievement/finalis_kmi_expo_2024.png",
    },
    {
      name: "Big 10 SWC Malang 2025",
      path: "/images/achievement/Big_10_StartUp_World_Cup_2025.png",
    },
  ];

  return (
    <div className="w-full relative flex overflow-x-hidden">
      <div className="animate-marquee flex whitespace-nowrap flex-shrink-0">
        {achievementLogos.map((achieve, index) => (
          <div key={index} className="flex flex-col items-center gap-2 mx-4">
            <Image
              src={achieve.path}
              alt={achieve.name}
              width={500}
              height={500}
              className="min-w-36 w-36 max-w-36 min-h-36 h-36 max-h-36 object-contain"
            />

            <p className="text-sm md:text-base text-center text-black font-medium">{achieve.name}</p>
          </div>
        ))}
      </div>
      <div className="animate-marquee flex whitespace-nowrap flex-shrink-0">
        {achievementLogos.map((achieve, index) => (
          <div key={index} className="flex flex-col items-center gap-2 mx-4">
            <Image
              src={achieve.path}
              alt={achieve.name}
              width={500}
              height={500}
              className="min-w-36 w-36 max-w-36 min-h-36 h-36 max-h-36 object-contain"
            />
            <p className="text-sm md:text-base text-center text-black font-medium">{achieve.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievement;
