"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Copy, ExternalLink } from "lucide-react";

export default function OpenGraphPreview() {
  const [url, setUrl] = useState(
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  );
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metadata = {
    title: "TRANSPO - Sewa Angkot, Hiace & ELF Terpercaya di Malang Raya",
    description:
      "Pesan angkot, Hiace, dan ELF dengan mudah lewat platform TRANSPO. Solusi transportasi terpercaya untuk pelajar & wisatawan di Malang Raya.",
    image: `${url}/opengraph.png`,
    url: url,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Website URL"
          className="flex-1"
        />
        <Button
          onClick={() => copyToClipboard(url)}
          variant="outline"
          size="sm"
        >
          <Copy className="h-4 w-4 mr-2" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {/* Facebook Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Facebook Preview
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(
                  `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {" "}
          <div className="border border-gray-300 rounded-lg overflow-hidden max-w-md">
            <Image
              src={metadata.image}
              alt="Preview"
              width={400}
              height={192}
              className="w-full h-48 object-cover"
            />
            <div className="p-3 bg-gray-50">
              <div className="text-xs text-gray-500 uppercase mb-1">
                {new URL(url).hostname}
              </div>
              <div className="font-semibold text-sm mb-1 line-clamp-2">
                {metadata.title}
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">
                {metadata.description}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Twitter Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Twitter Preview
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(
                  `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(url)}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>{" "}
        <CardContent>
          <div className="border border-gray-300 rounded-2xl overflow-hidden max-w-md">
            <Image
              src={metadata.image}
              alt="Preview"
              width={400}
              height={192}
              className="w-full h-48 object-cover"
            />
            <div className="p-3">
              <div className="font-semibold text-sm mb-1 line-clamp-2">
                {metadata.title}
              </div>
              <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                {metadata.description}
              </div>
              <div className="text-xs text-gray-500">
                {new URL(url).hostname}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            LinkedIn Preview
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(
                  `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(url)}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>{" "}
        <CardContent>
          <div className="border border-gray-300 rounded-lg overflow-hidden max-w-md">
            <Image
              src={metadata.image}
              alt="Preview"
              width={400}
              height={160}
              className="w-full h-40 object-cover"
            />
            <div className="p-3 bg-white">
              <div className="font-semibold text-sm mb-1 line-clamp-2">
                {metadata.title}
              </div>
              <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                {metadata.description}
              </div>
              <div className="text-xs text-gray-500">
                {new URL(url).hostname}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Preview */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Preview</CardTitle>
        </CardHeader>{" "}
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-xs">
            <Image
              src={metadata.image}
              alt="Preview"
              width={320}
              height={128}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <div className="font-semibold text-sm mb-1 line-clamp-2">
              {metadata.title}
            </div>
            <div className="text-xs text-gray-600 line-clamp-2 mb-1">
              {metadata.description}
            </div>
            <div className="text-xs text-green-600">
              {new URL(url).hostname}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              window.open(
                `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`,
                "_blank"
              )
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Facebook Sharing Debugger
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              window.open(
                `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(url)}`,
                "_blank"
              )
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Twitter Card Validator
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              window.open(
                `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(url)}`,
                "_blank"
              )
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            LinkedIn Post Inspector
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              window.open(
                `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`,
                "_blank"
              )
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Google Rich Results Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
