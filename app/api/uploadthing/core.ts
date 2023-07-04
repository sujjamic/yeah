import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async (req) => {
      const user = await getToken(req);

      const isAuth = user?.role === "AUTHORIZED";
      if (!isAuth) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);
      await db.pictures.create({
        data: {
          key: file.key,
          url: file.url,
          adminId: metadata.userId,
        }
      })
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
