"use client";

import { Video, ImageKitProvider, upload, Image as ImageKitImage } from "@imagekit/next";
import Image from "next/image";
import config from "@/lib/config";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imageKit`);

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();

    const { signature, expire, token } = data;

    return { token, expire, signature };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

const ImageUpload = ({
  type,
  accept,
  placeholder,
  folder,
  variant,
  onFileChange,
  value,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<UploadedFile>({ filePath: value ?? null });

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onError = (error: unknown) => {
    console.error("ImageKit upload error", error);

    setProgress(0);

    toast.add({
      type: "error",
      title: "Upload Failed",
      description: "Something went wrong while uploading. Please try again.",
    });
  };

  const onSuccess = (res: { filePath: string }) => {
    setFile({
      filePath: res.filePath,
    });

    onFileChange(res.filePath);

    setProgress(100);

    toast.add({
      type: "success",
      title: "Upload Successful",
      description: "Your file has been uploaded successfully.",
    });
  };

  const onValidate = (file: File) => {
    if (type === "image" && file.size > 20 * 1024 * 1024) {
      toast.add({
        type: "warning",
        title: "File Too Large",
        description: "Image must be less than 20MB.",
      });

      return false;
    }

    if (type === "video" && file.size > 50 * 1024 * 1024) {
      toast.add({
        type: "warning",
        title: "File Too Large",
        description: "Video must be less than 50MB.",
      });

      return false;
    }

    return true;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!onValidate(selectedFile)) {
      event.target.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);

      const auth = await authenticator();

      const result = await upload({
        file: selectedFile,
        fileName: selectedFile.name,
        folder,

        publicKey: config.env.imagekit.publicKey!,
        token: auth.token,
        expire: auth.expire,
        signature: auth.signature,

        onProgress: (event) => {
          if (!event.total) {
            return;
          }

          const percent = Math.round((event.loaded / event.total) * 100);

          setProgress(percent);
        },
      });

      const filePath = result.filePath;

      if (!filePath) {
        throw new Error("ImageKit did not return a file path.");
      }

      setFile({
        filePath,
      });

      onFileChange(filePath);

      setProgress(100);
    } catch (error) {
      console.error("ImageKit upload error:", error);

      setProgress(0);

      toast.add({
        type: "error",
        title: "Upload Failed",
        description: "An error occurred during upload. Please try again.",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <ImageKitProvider urlEndpoint={config.env.imagekit.urlEndpoint}>
      <div className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <button
          type="button"
          className={cn(
            "upload-btn",
            variant === "dark" ? "upload-button-dark" : "upload-button-light",
          )}
          onClick={(event) => {
            event.preventDefault();

            if (isUploading) {
              return;
            }

            fileInputRef.current?.click();
          }}
        >
          <Image
            src="/icons/upload.svg"
            alt="upload-icon"
            width={20}
            height={20}
            className="object-contain"
          />

          <p
            className={cn(
              "text-base",
              variant === "dark"
                ? "upload-placeholder-dark"
                : "upload-placeholder-light",
            )}
          >
            {isUploading ? "Uploading..." : placeholder}
          </p>

          {file.filePath && (
            <p
              className={cn(
                "upload-filename",
                variant === "dark" ? "upload-text-dark" : "upload-text-light",
              )}
            >
              {file.filePath}
            </p>
          )}
        </button>

        {progress > 0 && progress < 100 && (
          <div className="mt-2 w-full rounded-full bg-green-200">
            <div
              className="progress"
              style={{
                width: `${progress}%`,
              }}
            >
              {progress}%
            </div>
          </div>
        )}

        {file.filePath && type === "image" && (
          <ImageKitImage
            alt={file.filePath}
            src={file.filePath}
            width={500}
            height={300}
          />
        )}

        {file.filePath && type === "video" && (
          <Video
            src={file.filePath}
            controls
            className="h-96 w-full rounded-xl"
          />
        )}
      </div>
    </ImageKitProvider>
  );
};
export default ImageUpload;
