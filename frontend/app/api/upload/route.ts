import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const assignmentId = formData.get("assignmentId") as string;

    if (!file || !assignmentId) {
      return new Response(JSON.stringify({ message: "File and assignment ID are required" }), { status: 400 });
    }

    let fileKey = "";
    let fileUrl = "";
    let responseData = {};

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (session.user.role === "student") {
      // Student Uploads Assignment Submission
      fileKey = `submissions/${session.user.id}/${Date.now()}-${file.name}`;
      
      // Upload to S3
      const uploadParams = {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: file.type,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      fileUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`;

      // Create Submission in Database
      const submission = await prisma.submission.create({
        data: {
          fileUrl,
          studentId: session.user.id,
          assignmentId,
        },
      });

      responseData = { success: true, submission };
    } else if (session.user.role === "professor") {
      // Professor Uploads Answer Key
      fileKey = `answer-keys/${session.user.id}/${Date.now()}-${file.name}`;

      // Upload to S3
      const uploadParams = {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: file.type,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      fileUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`;

      
      try {
        const answerKey = await prisma.answerKey.create({
          data: {
            fileUrl,
            professorId: session.user.id,
            assignmentId,
          },
        });

        return new Response(JSON.stringify({ success: true, answerKey }), { status: 201 })
      } catch (error) {
        console.error("Error creating answer key:", error);
      }
      
      
    } else {
      return new Response(JSON.stringify({ message: "Invalid role" }), { status: 403 });
    }

    return new Response(JSON.stringify(responseData), { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ message: "Upload failed", error }), { status: 500 });
  }
}
