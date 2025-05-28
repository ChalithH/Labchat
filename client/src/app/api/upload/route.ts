// App Router: app/api/upload/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const AWS_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const AWS_S3_SESSION_TOKEN = process.env.S3_SESSION_TOKEN; 
const AWS_REGION = process.env.S3_REGION;
const AWS_S3_BUCKET_NAME = process.env.S3_S3_BUCKET_NAME;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_SESSION_TOKEN || !AWS_S3_BUCKET_NAME) {
  throw new Error('Missing required AWS environment variables');
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    sessionToken: AWS_S3_SESSION_TOKEN, 
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string; 
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes: ArrayBuffer = await file.arrayBuffer();
    const buffer: Buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${title}`;
    
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const fileUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_BUCKET_NAME}.amazonaws.com/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}