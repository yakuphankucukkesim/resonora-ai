"use client";

import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import type { Clip } from "@prisma/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { generateUploadUrl } from "~/actions/s3";
import { toast } from "sonner";
import { processVideo } from "~/actions/generation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { ClipDisplay } from "./clip-display";
import { format } from "date-fns";

export function DashboardClient({
  uploadedFiles,
  clips,
  success,
}: {
  uploadedFiles: {
    id: string;
    s3Key: string;
    filename: string;
    status: string;
    clipsCount: number;
    createdAt: Date;
  }[];
  clips: Clip[];
  success?: boolean;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Success olduğunda sadece URL'den parametreyi kaldır ve router.refresh() kullan
  useEffect(() => {
    if (success) {
      // URL'den success parametresini kaldır
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, '', url.toString());
      // Sayfa yenileme yerine router.refresh() kullan
      router.refresh();
    }
  }, [success, router]);

  // Sadece billing sayfasından döndükten sonra refresh yap
  useEffect(() => {
    const handleFocus = () => {
      // Sadece billing sayfasından döndükten sonra refresh yap
      // URL'de billing parametresi varsa refresh yap
      const url = new URL(window.location.href);
      if (url.pathname.includes('/billing')) {
        return; // Billing sayfasındayken refresh yapma
      }
      // Billing sayfasından döndükten sonra sadece bir kez refresh yap
      const lastRefresh = sessionStorage.getItem('lastRefresh');
      const now = Date.now();
      if (!lastRefresh || now - parseInt(lastRefresh) > 5000) { // 5 saniye içinde tekrar refresh yapma
        sessionStorage.setItem('lastRefresh', now.toString());
        router.refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const file = files[0]!;
    setUploading(true);

    try {
      // Dosya boyutunu kontrol et
      if (file.size > 500 * 1024 * 1024) {
        throw new Error("File size must be less than 500MB");
      }

      // Upload URL'ini al
      const { success, signedUrl, uploadedFileId } = await generateUploadUrl({
        filename: file.name,
        contentType: file.type,
      });
      
      if (!success) throw new Error("Failed to get upload URL");

      // Dosyayı S3'e yükle
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed with status: ${uploadResponse.status} - ${errorText}`);
      }

      // Video işleme sürecini başlat
      try {
        await processVideo(uploadedFileId);
        
        // Başarılı yükleme sonrası
        setFiles([]);
        
        // Sayfayı yenile (sadece bu durumda)
        router.refresh();

        toast.success("Video uploaded successfully", {
          description:
            "Your video has been scheduled for processing. Check the status below.",
          duration: 5000,
        });
      } catch (processError) {
        console.error("Video processing error:", processError);
        // Upload başarılı ama işleme hatası - kullanıcıya bilgi ver
        toast.warning("Video uploaded but processing failed", {
          description:
            "Your video was uploaded but there was an issue with processing. Please try again or contact support.",
          duration: 7000,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Upload failed", {
        description: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-6 px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-md border border-white/10 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-4 right-4 animate-float">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"></div>
        </div>
        <div className="absolute bottom-4 left-4 animate-float-delayed">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-400/20 to-blue-400/20 blur-xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl flex items-center space-x-3">
              <span className="text-5xl">🎬</span>
              <span>Podcast Clipper</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl">
              Upload your podcast and get AI-generated clips instantly. Transform your long-form content into viral clips with the power of AI.
            </p>
            <div className="flex items-center space-x-6 mt-6">
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Instant Processing</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Viral Clips</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <Link href="/dashboard/billing">
              <Button className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30 shadow-lg btn-animate text-lg px-8 py-4">
                💳 Buy Credits
              </Button>
            </Link>
            <p className="text-white/60 text-sm text-center">
              Get more credits to generate<br />more amazing clips
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="bg-white border">
          <TabsTrigger value="upload" className="text-gray-700 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">📤 Upload</TabsTrigger>
          <TabsTrigger value="my-clips" className="text-gray-700 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">🎬 My Clips</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">🎙️ Upload Podcast</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                📁 Upload your audio or video file to generate amazing clips with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dropzone
                onDrop={handleDrop}
                accept={{ "video/mp4": [".mp4"] }}
                maxSize={500 * 1024 * 1024}
                disabled={uploading}
                maxFiles={1}
              >
                {(dropzone: DropzoneState) => (
                  <>
                    <div className={`flex flex-col items-center justify-center space-y-4 rounded-lg p-10 text-center border-2 border-dashed transition-all duration-300 group ${
                      dropzone.isDragActive 
                        ? 'bg-blue-500/20 border-blue-400/80' 
                        : 'bg-white border-gray-300 hover:border-blue-400/60 hover:bg-gray-50'
                    }`}>
                      <UploadCloud className={`h-12 w-12 transition-colors duration-300 ${
                        dropzone.isDragActive 
                          ? 'text-blue-400' 
                          : 'text-gray-500 group-hover:text-blue-400'
                      }`} />
                      <p className={`font-medium transition-colors duration-300 ${
                        dropzone.isDragActive 
                          ? 'text-blue-100' 
                          : 'text-gray-900 group-hover:text-blue-600'
                      }`}>
                        {dropzone.isDragActive ? 'Drop your file here!' : 'Drag and drop your file'}
                      </p>
                      <p className={`text-sm transition-colors duration-300 ${
                        dropzone.isDragActive 
                          ? 'text-white/90' 
                          : 'text-gray-600 group-hover:text-blue-500'
                      }`}>
                        or click to browse (MP4 up to 500MB)
                      </p>
                      <Button
                        className="cursor-pointer bg-gray-100 text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-600/20 hover:border-blue-400/40 hover:text-white transition-all duration-300"
                        variant="default"
                        size="sm"
                        disabled={uploading}
                      >
                        Select File
                      </Button>
                    </div>
                  </>
                )}
              </Dropzone>

              <div className="mt-2 flex items-start justify-between">
                <div>
                  {files.length > 0 && (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-gray-900">Selected file: </p>
                      {files.map((file) => (
                        <p key={file.name} className="text-gray-600">
                          {file.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  disabled={files.length === 0 || uploading}
                  onClick={handleUpload}
                  className="bg-white/10 text-gray-900 border-white/20 hover:bg-white/20 hover:border-white/30 shadow-lg btn-animate"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      🚀 Uploading...
                    </>
                  ) : (
                    <>
                      🎬 Upload and Generate Clips
                    </>
                  )}
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="pt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-md mb-2 font-medium text-gray-900">Queue status</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      {refreshing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Refresh
                    </Button>
                  </div>
                  <div className="max-h-[300px] overflow-auto rounded-md border bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-900">File</TableHead>
                          <TableHead className="text-gray-900">Uploaded</TableHead>
                          <TableHead className="text-gray-900">Status</TableHead>
                          <TableHead className="text-gray-900">Clips created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedFiles.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="max-w-xs truncate font-medium text-gray-900">
                              {item.filename}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {format(new Date(item.createdAt), "dd.MM.yyyy")}
                            </TableCell>
                            <TableCell>
                              {item.status === "queued" && (
                                <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">Queued</Badge>
                              )}
                              {item.status === "processing" && (
                                <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">Processing</Badge>
                              )}
                              {item.status === "processed" && (
                                <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Processed</Badge>
                              )}
                              {item.status === "no credits" && (
                                <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-300">No credits</Badge>
                              )}
                              {item.status === "failed" && (
                                <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-300">Failed</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-900">
                              {item.clipsCount > 0 ? (
                                <span>
                                  {item.clipsCount} clip
                                  {item.clipsCount !== 1 ? "s" : ""}
                                </span>
                              ) : (
                                <span className="text-gray-600">
                                  No clips yet
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="my-clips">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">🎬 My Clips</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                ✨ View and manage your generated clips here. Processing may take a few minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClipDisplay clips={clips} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
