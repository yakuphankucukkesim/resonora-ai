import { env } from "~/env";
import { inngest } from "./client";
import { db } from "~/server/db";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

export const processVideo = inngest.createFunction(
  {
    id: "process-video",
  },
  { event: "process-video-events" },
  async ({ event }) => {
    console.log("Process video function triggered:", event);
    
    const { uploadedFileId } = event.data as {
      uploadedFileId: string;
      userId: string;
    };

    try {
      // Simple implementation without steps for now
      const uploadedFile = await db.uploadedFile.findUniqueOrThrow({
        where: {
          id: uploadedFileId,
        },
        select: {
          user: {
            select: {
              id: true,
              credits: true,
            },
          },
          s3Key: true,
        },
      });

      if (uploadedFile.user.credits > 0) {
        await db.uploadedFile.update({
          where: {
            id: uploadedFileId,
          },
          data: {
            status: "processing",
          },
        });

        // Call external API
        await fetch(env.PROCESS_VIDEO_ENDPOINT, {
          method: "POST",
          body: JSON.stringify({ s3_key: uploadedFile.s3Key }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`,
          },
        });

        // Create clips in DB
        const folderPrefix = uploadedFile.s3Key.split("/")[0]!;
        const allKeys = await listS3ObjectsByPrefix(folderPrefix);
        const clipKeys = allKeys.filter(
          (key): key is string =>
            key !== undefined && !key.endsWith("original.mp4"),
        );

        if (clipKeys.length > 0) {
          await db.clip.createMany({
            data: clipKeys.map((clipKey) => ({
              s3Key: clipKey,
              uploadedFileId,
              userId: uploadedFile.user.id,
            })),
          });
        }

        // Deduct credits
        await db.user.update({
          where: {
            id: uploadedFile.user.id,
          },
          data: {
            credits: {
              decrement: Math.min(uploadedFile.user.credits, clipKeys.length),
            },
          },
        });

        // Set status to processed
        await db.uploadedFile.update({
          where: {
            id: uploadedFileId,
          },
          data: {
            status: "processed",
          },
        });
      } else {
        await db.uploadedFile.update({
          where: {
            id: uploadedFileId,
          },
          data: {
            status: "no credits",
          },
        });
      }
    } catch (error) {
      console.error("Error processing video:", error);
      
      await db.uploadedFile.update({
        where: {
          id: uploadedFileId,
        },
        data: {
          status: "failed",
        },
      });
      
      throw error;
    }
  },
);

async function listS3ObjectsByPrefix(prefix: string) {
  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const listCommand = new ListObjectsV2Command({
    Bucket: env.S3_BUCKET_NAME,
    Prefix: prefix,
  });

  const response = await s3Client.send(listCommand);
  return response.Contents?.map((item) => item.Key).filter(Boolean) ?? [];
}

// Simple test function
export const testFunction = inngest.createFunction(
  {
    id: "test-function",
    retries: 1,
  },
  { event: "test-event" },
  async ({ event }) => {
    console.log("Test function executed:", event);
    return { success: true };
  },
);

