import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { Readable } from 'stream';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
interface S3Object {
  Key?: string;
  Size?: number;
  LastModified?: Date;
}

@Injectable()
export class FilesService {
  private readonly s3: any;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.BUCKET_NAME || 'drive-clone-bucket';

    const { S3Client } = require('@aws-sdk/client-s3');

    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT || 'http://localhost:4566',
      forcePathStyle: true, // imprescindible para LocalStack
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
    });
  }

  async uploadFiles(files: UploadedFile[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    const { PutObjectCommand } = require('@aws-sdk/client-s3');

    const uploaded: { key: string; name: string; size: number }[] = [];

    for (const file of files) {
      const safeName = file.originalname.replace(/[/\\]/g, '_');
      const key = `${randomUUID()}/${safeName}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      uploaded.push({ key, name: safeName, size: file.size });
    }

    return { uploaded };
  }

  async listRecent(limit = 3) {
    const { ListObjectsV2Command } = require('@aws-sdk/client-s3');

    const res = await this.s3.send(
      new ListObjectsV2Command({ Bucket: this.bucket }),
    );

    const items = ((res.Contents || []) as S3Object[])
      .map((o: S3Object) => ({
        key: o.Key ?? '',
        name: this.extractName(o.Key ?? ''),
        size: o.Size ?? 0,
        lastModified: o.LastModified ? o.LastModified.toISOString() : null,
      }))
      .sort(
        (
          a: { lastModified: string | null },
          b: { lastModified: string | null },
        ) => (b.lastModified ?? '').localeCompare(a.lastModified ?? ''),
      )
      .slice(0, limit);

    return items;
  }

  async download(key: string, res: Response) {
    if (!key) {
      throw new BadRequestException('Falta el parámetro "key"');
    }

    const { GetObjectCommand } = require('@aws-sdk/client-s3');

    let obj: any;
    try {
      obj = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch {
      throw new NotFoundException('El archivo no existe');
    }

    const name = this.extractName(key);
    const asciiName = name.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(name)}`,
    );
    if (obj.ContentType) {
      res.setHeader('Content-Type', obj.ContentType);
    }

    (obj.Body as Readable).pipe(res);
  }

  private extractName(key: string): string {
    const idx = key.indexOf('/');
    return idx >= 0 ? key.substring(idx + 1) : key;
  }
}
