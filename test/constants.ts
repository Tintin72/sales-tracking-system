import 'dotenv/config';
import { MongooseModule } from '@nestjs/mongoose';

export const database = process.env.MONGODB_URI;

export const imports = [
    MongooseModule.forRoot(database),
];