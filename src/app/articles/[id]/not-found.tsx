import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileX, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileX className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-2xl">Artikel Tidak Ditemukan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Maaf, artikel yang Anda cari tidak dapat ditemukan. Artikel mungkin
            telah dihapus atau URL tidak valid.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/articles">
              <Button className="bg-transpo-primary hover:bg-transpo-primary/85">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Artikel
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Ke Halaman Utama</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
