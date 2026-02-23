import { Module } from '@nestjs/common';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [TemplatesModule],
})
export class AppModule {}
