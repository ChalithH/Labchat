// App Router: app/api/upload/route.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN; 
const AWS_REGION = process.env.AWS_REGION;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_SESSION_TOKEN) {
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


export async function POST(request: { formData: () => any; }) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes: ArrayBuffer = await file.arrayBuffer();
    const buffer: Buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}