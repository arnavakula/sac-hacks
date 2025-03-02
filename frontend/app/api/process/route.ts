import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize Prisma
const prisma = new PrismaClient();

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, professorId, filename, type, id } = await req.json(); // Expect `type` and `id` (submissionId or answerKeyId)

    if (!pdfUrl || !professorId || !filename || !type || !id) {
      return NextResponse.json(
        { error: "Missing 'pdfUrl', 'professorId', 'filename', 'type', or 'id' in request body." },
        { status: 400 }
      );
    }

    const flaskApiUrl = "http://localhost:5008/process";

    // Send request to Flask API for structured text processing
    const response = await fetch(flaskApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf_url: pdfUrl }),
    });

    if (!response.ok) {
      throw new Error("Flask server processing failed.");
    }

    // Extract structured response
    const { structured_text } = await response.json();

    if (!structured_text) {
      throw new Error("No structured text returned.");
    }

    // Convert structured text to Buffer for S3 upload
    const fileBuffer = Buffer.from(structured_text, "utf-8");

    // Define S3 key using provided filename
    const fileKey = `processed-text/${professorId}/${filename}`;

    // Upload structured text to S3
    const uploadParams = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: "text/plain",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // Construct file URL
    const fileUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`;

    // Update database based on type (Submission or AnswerKey)
    if (type === "submission") {
      await prisma.submission.update({
        where: { id },
        data: { structuredText: fileUrl }, // Now Prisma recognizes this field
      });
    } else if (type === "answerKey") {
      await prisma.answerKey.update({
        where: { id },
        data: { structuredText: fileUrl },
      });
    }
    

    return NextResponse.json({ success: true, fileUrl });

  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json({ error: "Failed to process and upload the structured text." }, { status: 500 });
  }
}
