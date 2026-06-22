import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { globalValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 3001;
  const isProd = config.get('app.nodeEnv') === 'production';

  // ─── Security ──────────────────────────────────────────
  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: isProd
      ? [config.get('app.frontendUrl')]
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ─── Global prefix ─────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Validation ────────────────────────────────────────
  app.useGlobalPipes(globalValidationPipe);

  // ─── Swagger (dev only) ────────────────────────────────
  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('E-Paylaşım API')
      .setDescription('Paylaşımlı Ödeme Platform API Dokümantasyonu')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Kimlik doğrulama')
      .addTag('Users', 'Kullanıcı yönetimi')
      .addTag('Wishlists', 'Dilek listeleri')
      .addTag('Campaigns', 'Kampanyalar')
      .addTag('Coupons', 'Kuponlar')
      .addTag('Notifications', 'Bildirimler')
      .addTag('Admin', 'Yönetici paneli')
      .addTag('Analytics', 'Analitik')
      .addTag('Contact', 'İletişim formu')
      .addTag('Contributions', 'Katkılar')
      .addTag('Newsletter', 'Bülten')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    console.log(`📖 Swagger: http://localhost:${port}/api/docs`);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 E-Paylaşım API: http://localhost:${port}/api/v1`);
}

bootstrap();
