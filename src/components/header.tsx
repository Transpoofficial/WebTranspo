"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface HeaderProps {
  scrollToAdvantage?: () => void;
  scrollToHowToOrder?: () => void;
  scrollToService?: () => void;
  scrollToArticle?: () => void;
  scrollToReview?: () => void;
  isLandingPage?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  scrollToAdvantage,
  scrollToHowToOrder,
  scrollToService,
  scrollToArticle,
  scrollToReview,
  isLandingPage = true,
}) => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSheetItemClick = (scrollFunction?: () => void) => {
    if (scrollFunction) {
      scrollFunction();
    }
    setIsSheetOpen(false);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <>
      <header className="sticky top-0 left-0 w-full px-4 md:px-10 py-2.5 bg-[#0897B1]/[.85] shadow-md md:shadow-none z-10">
        <div className="container flex justify-between items-center mx-auto">
          {/* Header content for Tablet and Desktop */}
          <div className="inline-flex items-center md:gap-x-2">
            {/* Drawer for mobile */}
            {isLandingPage && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    className="lg:hidden text-white hover:text-white hover:bg-zinc-700/[.4]"
                    variant="ghost"
                    size="icon"
                  >
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col py-10">
                    <Button
                      onClick={() => handleSheetItemClick(scrollToHowToOrder)}
                      variant="ghost"
                      size="lg"
                      className="justify-start"
                    >
                      Cara kerja
                    </Button>
                    <Button
                      onClick={() => handleSheetItemClick(scrollToAdvantage)}
                      variant="ghost"
                      size="lg"
                      className="justify-start"
                    >
                      Kelebihan
                    </Button>
                    <Button
                      onClick={() => handleSheetItemClick(scrollToService)}
                      variant="ghost"
                      size="lg"
                      className="justify-start"
                    >
                      Layanan
                    </Button>
                    <Button
                      onClick={() => handleSheetItemClick(scrollToArticle)}
                      variant="ghost"
                      size="lg"
                      className="justify-start"
                    >
                      Artikel
                    </Button>
                    <Button
                      onClick={() => handleSheetItemClick(scrollToReview)}
                      variant="ghost"
                      size="lg"
                      className="justify-start"
                    >
                      Review
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            <Link href="/" className="inline-flex items-center md:gap-x-2">
              <Image
                className="w-14 h-14"
                src={"/images/logo/logo_3.png"}
                alt="logo_3.png"
                width={100}
                height={100}
              />

              <p className="hidden md:block text-xl uppercase font-bold text-white">
                TRANSPO
              </p>
            </Link>
          </div>

          {isLandingPage && (
            <div className="hidden lg:flex items-center">
              <Button
                onClick={scrollToHowToOrder}
                variant="ghost"
                size="lg"
                className="text-base text-white hover:text-white hover:bg-zinc-700/[.4]"
              >
                Cara pesan
              </Button>
              <Button
                onClick={scrollToAdvantage}
                variant="ghost"
                size="lg"
                className="text-base text-white hover:text-white hover:bg-zinc-700/[.4]"
              >
                Kelebihan
              </Button>
              <Button
                onClick={scrollToService}
                variant="ghost"
                size="lg"
                className="text-base text-white hover:text-white hover:bg-zinc-700/[.4]"
              >
                Layanan
              </Button>
              <Button
                onClick={scrollToArticle}
                variant="ghost"
                size="lg"
                className="text-base text-white hover:text-white hover:bg-zinc-700/[.4]"
              >
                Artikel
              </Button>
              <Button
                onClick={scrollToReview}
                variant="ghost"
                size="lg"
                className="text-base text-white hover:text-white hover:bg-zinc-700/[.4]"
              >
                Review
              </Button>
            </div>
          )}

          {isLoading ? (
            <Skeleton className="h-[36px] w-[168px]" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-zinc-700/[.4]"
                >
                  Hai, {session.user?.fullName}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold line-clamp-1">
                        {session.user?.fullName}
                      </span>
                      <span className="truncate text-xs line-clamp-1">
                        {session.user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(session.user?.role === "ADMIN" ||
                  session.user?.role === "SUPER_ADMIN") && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Halaman admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/order">Pesanan</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
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
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
