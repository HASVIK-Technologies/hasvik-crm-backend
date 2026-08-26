import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';

@Injectable()
export class CacheService {
  private cache: NodeCache;

  constructor() {
    // stdTTL: default TTL for every generated cache element (0 = unlimited)
    // checkperiod: automatic delete check interval in seconds (0 = disabled)
    this.cache = new NodeCache({ stdTTL: 0, checkperiod: 600 });
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value);
    }
  }

  async get(key: string): Promise<string | undefined> {
    return this.cache.get(key);
  }

  async del(key: string): Promise<void> {
    this.cache.del(key);
  }

  // 🔢 OTP methods

  async sendOtp(phoneNumber: string) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await this.set(`otp:${phoneNumber}`, otp, 300); // 5 min expiry

    return { message: 'OTP sent' };
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    const stored = await this.get(`otp:${phoneNumber}`);

    if (!stored || stored !== otp) {
      return false;
    }

    await this.del(`otp:${phoneNumber}`);
    return true;
  }

  async increment(key: string, ttl: number): Promise<number> {
    let count = this.cache.get<number>(key) || 0;
    count += 1;
    this.cache.set(key, count, ttl);
    return count;
  }
}
