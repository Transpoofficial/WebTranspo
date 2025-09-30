import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Pedicab = () => {

  return (
    <>
      <Card className="bg-[#0897B1]">
        <CardContent className="flex flex-col lg:flex-row items-stretch gap-x-6">
          <Image
            className="min-w-full lg:min-w-lg min-h-52 h-52 max-h-52 md:min-h-96 md:h-96 md:max-h-96 object-cover rounded-2xl shadow-lg"
            src="/images/becak/becak.jpg"
            alt="becak.jpg"
            width={500}
            height={500}
          />

          <div className="flex flex-col gap-y-2 w-full mt-4">
            <div className="flex items-center gap-x-2">
              <Image
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADn0lEQVR4nO2Z20tVQRTGt+YpSNSX6IL0aGjQDSpLqDcxy1Qy6a2ot4qK+guCxLKiIiJ6TYmihy6UhAQ9diGCItEUyluFRAWaoWmdX0xOsV2tsy+nc5P84MBmr8usb2bNrDX7OM4MMgRABdBHcLwBNjmZAiYDCot+J1MAjMdBYMCZxgR6Mi2FxkWAEWc6gRkCaQYzBMIB2CLqzgjwGNgPzM5oAkAW8M7jhHsGLMpYAna8t3jjaagY0kCgEnjtQ2Jv0gmYYhawDfHsnYBC4I6weZgKAv0kqHcCFgv9oVQQGEgigeFUEKi0fdE/9U5MBt8qbNqSTkDxc1v4MX5XC515wB7gGvDCzLRCOAqUpYPAfGBQ+HoFzAUWApeAUZ/VigJHwg6csGMUqLJBuHEf+IQ/eoHqeAZNaB2wMx0PDsU7YKIJ5AJdHoE+AvYBp8X7GxlBwPrcpQT+Adjq0lkl5B+B7EQQ8KqolQH8zQE6lOCWCL1s4LPQW5FMAgZvA/g7IGwmgI0xdG8J3YNpJWBnVX5juuihf1gZY8Qev1eA7b4pHYKAqaibfXyVK8Es8LjYdAcY1+jUpKoOtAhfl2Ncao4r9cILUWuTncxKnKVU4nJFr4n40RiEwBN7apjlbwfOASUBCBQLP6b6zhI61QFmvg3YYPaOElv0r2odcA/8AM54rQ6wU9jcU45XeQEaAHYrxH+lCrBSuUN3/4kDyLHHXFC0xiIBHBO6R4V8h5CP2QA964F5VprAut/CE4THyRgErgq9eiG/LuTnPerBlL7I6Ap5i3lZpMy+qaC1QL79medOoWNSrkgh8EDolQq56TbdWOtRD24K21Ih73RsTsvgC5TAChQSTYrec6FTKOQyDQo8+qJBYZsn5EPm5UvxslZLDevArERY5AkfX4Q81yUz++C9S9YrbPM1AvI6l+9BQM5AEOQIH7LFXqNU5h6taQTWayk0lEQCfYoP09u4cTbWeIrtBWHb7NgilYwUMt+LKhQf9UJvFFgWIHhz1H4Tttu0TdzpsYlNd+h7lPoEElGat35guU/w8luqScWIEZYA3xUStTZl8uyzDH5CXk5CkKhRWokxe86vc41bZtNGzryxrXI7NH1OWJyKJ3jXmKarjBcN2rKa5iko7ibg0m+OzMY42ukG0/FqDiN2JWQ6ac1c+H9QYhOpDnih6ZqSNh4Ol9og220r/dXVThcnKnBl8ursRajD1qZh+9xsTptp95+d87/gJwao8nSacdx1AAAAAElFTkSuQmCC"
                alt="pedicab_icon"
                width={40}
                height={40}
                style={{ width: 40, height: 40 }}
                unoptimized
              />

              <h2 className="text-3xl font-bold tracking-tight text-white">
                Becak
              </h2>
            </div>

            <div className="grow flex flex-col justify-between">
              <div>
                <p className="leading-7 text-base md:text-xl text-white">
                  Informasi kendaraan:
                </p>
                <ul className="mt-1 mb-6 ml-6 list-disc text-base md:text-xl text-white">
                  <li>
                    Muat hingga 2–3 orang, cocok untuk perjalanan singkat di
                    area perkotaan.
                  </li>
                  <li>Harga sewa ekonomis, sangat ramah di kantong.</li>
                  <li>
                    Ideal untuk menikmati suasana kota, wisata kuliner, atau
                    berkeliling kampung.
                  </li>
                  <li>
                    Kendaraan tradisional ini ramah lingkungan dan bebas polusi.
                  </li>
                  <li>
                    Fleksibel untuk melewati jalan sempit dan area padat yang
                    sulit dijangkau kendaraan besar.
                  </li>
                  <li>
                    Cocok untuk perjalanan santai, santai sambil menikmati
                    pemandangan sekitar.
                  </li>
                </ul>
              </div>

              <Link href="/maintenance">
                <Button
                  size="lg"
                  className="py-8 px-8 text-xl w-min text-transpo-primary bg-white hover:bg-gray-100 shadow-lg"
                >
                  Pesan sekarang
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Pedicab;
