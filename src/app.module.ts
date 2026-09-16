import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoModule } from './mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';
import { BusinessModule } from './business/business.module';
import { FollowupModule } from './followup/followup.module';
import { CategoryModule } from './category/category.module';
import { NoteModule } from './note/note.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongoModule,
    BusinessModule,
    FollowupModule,
    CategoryModule,
    NoteModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
