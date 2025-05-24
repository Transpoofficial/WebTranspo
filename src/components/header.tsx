import { Button, buttonVariants } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  return (
    <>
      <header className="sticky top-0 left-0 w-full px-4 md:px-10 py-2.5 bg-[#0897B1]/[.85] shadow-md md:shadow-none">
        <div className="container flex justify-between items-center mx-auto">
          {/* Header content for Tablet and Desktop */}
          <div className="inline-flex items-center md:gap-x-2">
            {/* Drawer for mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  className="md:hidden text-white hover:text-white hover:bg-zinc-700/[.4]"
                  variant="ghost"
                  size="icon"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col py-10">
                  <Button variant="ghost" size="lg" className="justify-start">
                    Kelebihan
                  </Button>
                  <Button variant="ghost" size="lg" className="justify-start">
                    Cara kerja
                  </Button>
                  <Button variant="ghost" size="lg" className="justify-start">
                    FAQ
                  </Button>
                  <Button variant="ghost" size="lg" className="justify-start">
                    Review
                  </Button>
                  <Button variant="ghost" size="lg" className="justify-start">
                    Kontak
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Image
              className="w-14 h-14"
              src={"/logo_3.png"}
              alt="logo_3.png"
              width={100}
              height={100}
            />

            <p className="hidden md:block text-xl uppercase font-bold text-white">
              TRANSPO
            </p>
          </div>

          <div className="hidden md:flex items-center">
            <Button
              variant="ghost"
              size="lg"
              className="text-base text-white hover:text-white hover:bg-zinc-700/[.4]"
            >
              Kelebihan
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-base text-white hover:text-white hover:bg-zinc-700/[.4]"
            >
              Cara kerja
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-base text-white hover:text-white hover:bg-zinc-700/[.4]"
            >
              FAQ
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-base text-white hover:text-white hover:bg-zinc-700/[.4]"
            >
              Review
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-base text-white hover:text-white hover:bg-zinc-700/[.4]"
            >
              Kontak
            </Button>
          </div>

          <div className="flex items-center gap-x-2">
            <Link
              href={"/auth/signin"}
              className={buttonVariants({ variant: "default" })}
            >
              Login
            </Link>
            <Link
              href={"/auth/signup"}
              className={buttonVariants({ variant: "outline" })}
            >
              Register
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
