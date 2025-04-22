import { buttonVariants } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

const Header = () => {
  return (
    <>
      <header className="sticky top-0 left-0 w-full flex justify-between items-center px-4 md:px-10 py-3 md:py-5 bg-white shadow-md md:shadow-none">
        {/* Header content for Tablet and Desktop */}
        <div className="hidden md:block">LOGO</div>

        <div className="hidden md:flex items-center gap-x-2">
          <Link
            href={"/auth/signin"}
            className={buttonVariants({ variant: "default" })}
          >
            Login
          </Link>
          <Link
            href={"/auth/signin"}
            className={buttonVariants({ variant: "outline" })}
          >
            Register
          </Link>
        </div>

        {/* Header content for Mobile */}
        <div className="flex md:hidden py-4 w-full justify-center items-center gap-x-2.5 bg-gray-100 transition duration-200 shadow-md rounded-full cursor-pointer active:scale-95">
          <Search />

          <p className="text-sm">Mulai pencarian Anda</p>
        </div>
      </header>
    </>
  );
};

export default Header;
