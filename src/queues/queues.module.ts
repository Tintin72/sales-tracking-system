import { Module } from '@nestjs/common';
import { ProducerService } from 'src/queues/producer.queue';
import { ConsumerService } from 'src/queues/consumer.queue';
import { EmailModule } from 'src/email/email.module';
@Module({
    providers: [ProducerService, ConsumerService],
    exports: [ProducerService],
    imports: [EmailModule],
})
export class QueuesModule {}