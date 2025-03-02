import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ 
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
  }

});

async function uploadFiletoS3(file: Buffer, fileName: String) {
  const fileBuffer = file;
  console.log(fileName);

  const params = {
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
    Key: `${fileName}-${Date.now()}`,
    Body: fileBuffer,
    ContentType: "application/pdf"
  }

  const command = new PutObjectCommand(params);
  await s3.send(command);
}

export async function POST (req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ message: "File is required" }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = await uploadFiletoS3(buffer, file.name);

  
    return new Response(JSON.stringify({ success: true, message: "hi" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 400 });
  }
  
}