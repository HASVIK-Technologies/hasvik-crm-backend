import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { Connection } from 'mongoose';
import { MongoModels } from './mongo.models';

@Injectable()
export class MongoService {
    private readonly logger = new Logger(MongoService.name);
    public readonly models: MongoModels;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.models = new MongoModels();
    }

    /**
     * Connect to MongoDB
     */
    async connect(): Promise<Connection> {
        if (mongoose.connection.readyState === 1) {
            this.logger.log('MongoDB already connected');
            return mongoose.connection;
        }

        const uri = this.configService.get<string>('MONGO_URI');
        if (!uri) {
            this.logger.error('MONGO_URI is not set in configuration');
            throw new Error('MONGO_URI is not set');
        }


        try {
            const options = {
                maxPoolSize: 100,
                minPoolSize: 10,
                retryWrites: true,
                retryReads: true,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };

            await mongoose.connect(uri, options);
            this.logger.log('MongoDB connected successfully');
            return mongoose.connection;
        } catch (error) {
            this.logger.error('MongoDB connection failed', error);

            throw new Error(
                `Unable to establish MongoDB connection: ${
                error instanceof Error ? error.message : 'Unknown error'
                }`,
            );
        }
    }

    /**
     * Disconnect MongoDB
     */
    async disconnect(): Promise<void> {
        if (mongoose.connection.readyState === 0) {
            this.logger.log('MongoDB already disconnected');
            return;
        }

        await mongoose.disconnect();

        this.logger.log('MongoDB disconnected successfully');
    }

    /**
     * Health Check
     */
    async health() {
        const state = mongoose.connection.readyState;

        const states = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting',
        };

        return {
            database: 'MongoDB',
            status: states[state],
            readyState: state,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            databaseName: mongoose.connection.name,
        };
    }
}