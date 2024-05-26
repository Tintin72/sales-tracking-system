import { TestingModule, Test } from '@nestjs/testing';
import { EmailService } from './email.service';
import { EmailContent } from './email.interface';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let mailerService: MailerService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send email', async () => {
    const content: EmailContent = {
      subject: 'Test',
      html: '<b>test</b>',
      email: 'tintin72.dev@gmail.com',
    };

    await service.sendEmail(content);
    expect(mailerService.sendMail).toHaveBeenCalled();
  });
});
