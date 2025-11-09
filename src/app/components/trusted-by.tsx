import Image from "next/image";

const TrustedBy = () => {
  const trustedByLogos = [
    {
      name: "Universitas Negeri Malang",
      path: "/images/trusted_by/um.png",
    },
    {
      name: "Universitas Brawijaya",
      path: "/images/trusted_by/ub.jpeg",
    },
    {
      name: "Universitas Muhammadiyah Malang",
      path: "/images/trusted_by/umm.png",
    },
    {
      name: "Sekolah Tinggi Ilmu Ekonomi Malangkucecwara",
      path: "/images/trusted_by/stie_malang.png",
    },
    {
      name: "Institut Teknologi & Bisnis Asia",
      path: "/images/trusted_by/institut_asia.png",
    },
    {
      name: "Institut Teknologi Nasional Malang",
      path: "/images/trusted_by/itn.png",
    },
    {
      name: "Universitas Islam Negeri Maulana Malik Ibrahim Malang",
      path: "/images/trusted_by/UIN_MAULANA_MALIK_IBRAHIM.jpg",
    },
    {
      name: "Universitas Gajayana Malang",
      path: "/images/trusted_by/gajayana.png",
    },
    {
      name: "Unisma",
      path: "/images/trusted_by/unisma.png",
    },
    {
      name: "Unmer",
      path: "/images/trusted_by/unmer.png",
    },
    {
      name: "Smoore",
      path: "/images/trusted_by/smoore.webp",
    },
    {
      name: "WSE",
      path: "/images/trusted_by/wse.png",
    },
  ];

  return (
    <div className="w-full relative flex overflow-x-hidden">
      <div className="animate-marquee flex whitespace-nowrap flex-shrink-0">
        {trustedByLogos.map((trusted, index) => (
          <Image
            key={index}
            src={trusted.path}
            alt={trusted.name}
            width={500}
            height={500}
            className="min-w-36 w-36 max-w-36 min-h-36 h-36 max-h-36 object-contain mx-4"
          />
        ))}
      </div>
      <div className="animate-marquee flex whitespace-nowrap flex-shrink-0">
        {trustedByLogos.map((trusted, index) => (
          <Image
            key={index}
            src={trusted.path}
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
