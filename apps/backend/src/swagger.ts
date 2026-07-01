import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

/**
 * Single source of truth for the OpenAPI document. Used both to serve
 * Swagger UI at runtime (main.ts) and to emit openapi.json for client
 * generation (openapi/generate-openapi.ts).
 */
export const SWAGGER_PATH = 'docs';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('ScrAI — AI Scribe Notes API')
    .setDescription('Create and view AI-generated clinical notes associated with patients.')
    .setVersion('0.1.0')
    .addTag('patients')
    .addTag('notes')
    .addTag('health')
    .build();
  return SwaggerModule.createDocument(app, config);
}

export function setupSwagger(app: INestApplication): OpenAPIObject {
  const document = buildOpenApiDocument(app);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  return document;
}
