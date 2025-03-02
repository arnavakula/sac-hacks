"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function UploadTest() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please select a file.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      // 1️⃣ Request pre-signed URL from API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        headers: { "Content-Type": "application/json" },
      });

      const { uploadUrl } = await response.json();

      // 2️⃣ Upload file to S3
      const s3Upload = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
        mode: "no-cors" // 🔥 Important for CORS
      });
      
      if (!s3Upload.ok) throw new Error("S3 upload failed");

      toast({ title: "Success", description: "File uploaded successfully!" });

    } catch (error) {
      toast({ title: "Error", description: "Upload failed.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold">Test S3 Upload</h1>
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleUpload} disabled={isUploading} className="w-full">
        {isUploading ? "Uploading..." : "Upload File"}
      </Button>
    </div>
  );
}
