import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { allConfigs, envValidationSchema } from './config';
import { registerDatabaseLogging } from './bootstrap/database.bootstrap';
import { CacheModule } from './providers/cache/cache.module';
import { StorageModule } from './providers/storage/storage.module';
import { QueueModule } from './providers/queue/queue.module';
import { HealthModule } from './modules/health/health.module';
import { PaymentModule } from './modules/payment/payment.module';
import { IdentityModule } from './modules/identity/identity.module';
import { CustomerModule } from './modules/customer/customer.module';
import { AuthSharedModule } from './shared/guards/auth-shared.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { CmsModule } from './modules/cms/cms.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuditModule } from './modules/audit/audit.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { TaxModule } from './modules/tax/tax.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { MediaModule } from './modules/media/media.module';
import { SearchModule } from './modules/search/search.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { MongoExceptionsFilter } from './shared/filters/mongo-exceptions.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: allConfigs,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    // Default: 60 requests/minute per IP. Individual routes (e.g. login)
    // override this with a stricter @Throttle() decorator.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
        connectionFactory: (connection) => {
          registerDatabaseLogging(connection);
          return connection;
        },
      }),
    }),
    CacheModule,
    StorageModule,
    QueueModule,
    HealthModule,
    PaymentModule,
    AuthSharedModule,
    IdentityModule,
    CustomerModule,
    InventoryModule,
    CatalogModule,
    CartModule,
    OrderModule,
    ShippingModule,
    CmsModule,
    AuditModule,
    NotificationModule,
    AnalyticsModule,
    OrganizationModule,
    TaxModule,
    CurrencyModule,
    MediaModule,
    SearchModule,
    SchedulerModule,
  ],
  providers: [
    // Order matters: the specific Mongo filter must be registered before
    // the catch-all so CastError/ValidationError are matched first.
    { provide: APP_FILTER, useClass: MongoExceptionsFilter },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
