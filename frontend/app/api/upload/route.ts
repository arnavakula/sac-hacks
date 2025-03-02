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

  // if (!session || session.user.role !== "student") {
  //   return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  // }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const assignmentId = formData.get("assignmentId") as string;

    if (!file || !assignmentId) {
      return new Response(JSON.stringify({ message: "File and assignment ID are required" }), { status: 400 });
    }

    // Generate unique file key
    const fileKey = `submissions/${session.user.id}/${Date.now()}-${file.name}`;

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // Create submission in database
    const submission = await prisma.submission.create({
      data: {
        fileUrl: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`,
        studentId: session.user.id,
        assignmentId,
      },
    });

    return new Response(JSON.stringify({ success: true, submission }), { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ message: "Upload failed", error }), { status: 500 });
  }
}
