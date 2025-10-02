import Link from "next/link";

const errorMessages = [
  {
    code: 400,
    title: "400 - Bad Request",
    message: "Permintaan yang dikirim tidak valid atau rusak."
  },
  {
    code: 401,
    title: "401 - Unauthorized",
    message: "Anda tidak memiliki izin untuk mengakses halaman ini."
  },
  {
    code: 403,
    title: "403 - Forbidden",
    message: "Akses ke halaman ini dilarang."
  },
  {
    code: 404,
    title: "404 - Not Found",
    message: "Looks like you've ventured into the unknown digital realm."
  },
  {
    code: 405,
    title: "405 - Method Not Allowed",
    message: "Metode permintaan tidak diizinkan untuk sumber daya ini."
  },
  {
    code: 408,
    title: "408 - Request Timeout",
    message: "Waktu permintaan telah habis."
  },
  {
    code: 500,
    title: "500 - Internal Server Error",
    message: "Terjadi kesalahan pada server kami. Silakan coba lagi nanti."
  },
  {
    code: 502,
    title: "502 - Bad Gateway",
    message: "Server menerima respons yang tidak valid dari server upstream."
  },
  {
    code: 503,
    title: "503 - Service Unavailable",
    message: "Layanan sedang tidak tersedia. Silakan coba lagi nanti."
  },
  {
    code: 504,
    title: "504 - Gateway Timeout",
    message: "Server tidak menerima respons tepat waktu dari server upstream."
  }
];

export default function ErrorPage({ statusCode = 404 }) {
  const error = errorMessages.find(e => e.code === statusCode) || 
    {
      code: statusCode,
      title: `${statusCode} - Error`,
      message: "Terjadi kesalahan yang tidak diketahui."
    };

  return (
    <div className="flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl animate-bounce">{error.title}</h1>
          <p className="text-gray-500">{error.message}</p>
        </div>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md bg-transpo-primary hover:bg-transpo-primary-dark px-8 text-sm font-medium text-gray-50 shadow transition-colors"
          prefetch={false}
        >
          Kembali ke website
        </Link>
      </div>
    </div>
  )
}