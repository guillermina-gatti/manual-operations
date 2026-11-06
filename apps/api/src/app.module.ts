/**
 * Author: Guillermina Gatti
 * Summary: Root module. Adds the document processing module (HU14) to the
 * base configuration, Prisma and health check.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProcessingModule } from './documents/processing/processing.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, ProcessingModule],
    controllers: [HealthController],
})
export class AppModule { }