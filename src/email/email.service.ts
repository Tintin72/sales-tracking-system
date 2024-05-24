import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailContent } from './email.interface';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(content: EmailContent) {
    const { subject, html, email } = content;
    await this.mailService.sendMail({
      to: email,
      subject: subject,
      html: html,
      from: this.configService.get('MAIL_FROM'),
    });
  }
}
