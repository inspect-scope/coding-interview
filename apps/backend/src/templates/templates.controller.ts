import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Template } from '@scope/shared';
import { TemplatesService } from './templates.service';
import { validateReport } from './validation';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll(): Template[] {
    return this.templatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Template {
    return this.templatesService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Template>): Template {
    return this.templatesService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Template>,
  ): Template {
    return this.templatesService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): { success: boolean } {
    this.templatesService.delete(id);
    return { success: true };
  }

  @Post(':id/generate')
  generate(
    @Param('id') id: string,
    @Body() body: { values: Record<string, any> },
  ) {
    const template = this.templatesService.findOne(id);

    // Backend validation - separate from frontend validation
    const errors = validateReport(template.blocks, body.values);
    if (errors.length > 0) {
      throw new BadRequestException({ errors });
    }

    const report = this.templatesService.createReport(id, body.values);
    return { report };
  }
}
