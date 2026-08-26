import { Injectable, Logger } from '@nestjs/common';
import { SmsProvider } from '../interfaces/sms.interface';
import axios from 'axios';

@Injectable()
export class GupshupService implements SmsProvider {
  private readonly logger = new Logger(GupshupService.name);

  async sendSms(to: string, message: string) {

    this.logger.log(`Sending via Gupshup: ${to} ${message}`);
    const url = 'https://api.gupshup.io/sm/api/v1/msg';
    
    
    const payload = {
      channel: 'whatsapp',
      source: process.env.GUPSHUP_PHONE_NUMBER,
      destination: to,
      message: JSON.stringify({
        type: 'text',
        text: message,
      }),
    };
    try {
      const response =  await axios.post(
        url,
        payload,
        {
          headers: {
            apikey: process.env.GUPSHUP_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
        );
      return response.data;
    } catch (error) {
      this.logger.error('Error sending SMS via Gupshup', JSON.stringify(error), GupshupService.name);
      throw new Error('Failed to send SMS');
    }
  }
}