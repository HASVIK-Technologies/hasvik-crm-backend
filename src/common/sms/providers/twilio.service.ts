import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TwilioService{

  private readonly logger = new Logger(TwilioService.name);
  
  constructor(private config: ConfigService) {}

  async sendSms(to: string, body: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_PHONE_NUMBER!;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    try{
      const form = new URLSearchParams({
        To: `+91${to}`,
        From: from,
        Body: body,
      });

      const { data } = await axios.post(url, form, {
        auth: {
          username: accountSid,
          password: authToken,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return data;
    } catch (error) {
      this.logger.error('Error sending SMS via Twilio', JSON.stringify(error), TwilioService.name);
      throw new Error('Failed to send SMS via Twilio');
    }
  }
}