import { Module } from '@nestjs/common';
import { ProducerService } from '../queues/producer.queue';
import { ConsumerService } from '../queues/consumer.queue';
import { EmailModule } from '../email/email.module';
@Module({
    providers: [ProducerService, ConsumerService],
    exports: [ProducerService],
    imports: [EmailModule],
})
export class QueuesModule {}