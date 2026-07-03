import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
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
      // AWS SDK v3 adds a default CRC32 integrity checksum to PutObject, which
      // bakes a placeholder checksum into presigned PUT URLs and makes a plain
      // browser PUT (body only) fail with 400. Only checksum when required so
      // the presigned upload works from the client.
      requestChecksumCalculation: 'WHEN_REQUIRED',
    });
  }

  /**
   * Mint a presigned PUT URL so the browser can upload the audio straight to S3,
   * without the file streaming through (and being buffered in) the API. Returns
   * both the object key (persisted on the note) and the URL the client PUTs to.
   *
   * The URL is signed with the given ContentType, so the client's PUT must send
   * the same `Content-Type` header for the signature to validate.
   */
  async createPresignedUpload(
    filename: string,
    contentType: string,
    expiresInSeconds = 900,
  ): Promise<{ key: string; url: string }> {
    const key = `audio/${randomUUID()}-${sanitize(filename)}`;
    const url = await getSignedUrl(
      this.client,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType }),
      { expiresIn: expiresInSeconds },
    );
    this.logger.log(`presigned PUT for ${key} in ${this.bucket}`);
    return { key, url };
  }

  /** Download an object's bytes (used to feed the audio to the transcription step). */
  async downloadAudio(key: string): Promise<Buffer> {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const body = res.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
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
