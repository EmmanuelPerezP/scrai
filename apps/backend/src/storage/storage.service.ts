import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { AppConfig } from '../config/configuration';

/**
 * Thin wrapper around S3 for storing uploaded audio files.
 * Works against real S3 in AWS and against LocalStack locally
 * (controlled via S3_ENDPOINT / S3_FORCE_PATH_STYLE).
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const storage = this.config.get('storage', { infer: true });
    this.bucket = storage.bucket;
    this.client = new S3Client({
      region: storage.region,
      endpoint: storage.endpoint,
      forcePathStyle: storage.forcePathStyle,
    });
  }

  /** Upload an audio buffer and return the S3 object key. */
  async uploadAudio(file: { buffer: Buffer; originalname: string; mimetype: string }): Promise<string> {
    const key = `audio/${randomUUID()}-${sanitize(file.originalname)}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    this.logger.log(`uploaded ${key} to ${this.bucket}`);
    return key;
  }

  /** Generate a temporary, signed URL so the frontend can play the audio back. */
  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }
}

const sanitize = (name: string): string => name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
