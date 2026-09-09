import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoModule } from './mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { BusinessModule } from './business/business.module';
import { FollowupModule } from './followup/followup.module';
import { CategoryModule } from './category/category.module';
import { NoteModule } from './note/note.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongoModule,
    UsersModule,
    BusinessModule,
    FollowupModule,
    CategoryModule,
    NoteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
