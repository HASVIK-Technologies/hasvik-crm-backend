import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SmsProvider } from '../interfaces/sms.interface';

@Injectable()
export class Msg91Service implements SmsProvider {
  private readonly logger = new Logger(Msg91Service.name);

  constructor(private config: ConfigService) {}

  async sendSms(to: string, message: string) {
    const url = 'https://api.msg91.com/api/v5/flow/';

    try {
      return axios.post(
        url,
        {
          flow_id: this.config.get('MSG91_FLOW_ID'),
          sender: this.config.get('MSG91_SENDER_ID'),
          mobiles: `91${to}`, // India format
          message,
        },
        {
          headers: {
            authkey: this.config.get('MSG91_AUTH_KEY'),
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      this.logger.error('Error sending SMS via MSG91', JSON.stringify(error), Msg91Service.name);
      throw new Error('Failed to send SMS');
    }
    
  }
}