/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface QRCodeDisplayProps {
  slug: string;
}

export function QRCodeDisplay({ slug }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    generateQRCode();
  }, []); // Removed unnecessary dependency: slug

  const generateQRCode = async () => {
    try {
      const url = `${window.location.origin}/gathering/join/${slug}`;
      const qrCodeDataUrl = await QRCode.toDataURL(url);
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `gathering-${slug}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center p-6">
        {qrCodeUrl && (
          <Image
            width={256}
            height={256}
            src={qrCodeUrl || "/placeholder.svg"}
            alt="Gathering QR Code"
            className="mb-4"
          />
        )}
        <Button onClick={downloadQRCode}>Download QR Code</Button>
      </CardContent>
    </Card>
  );
}
