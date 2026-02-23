import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Template, Report } from '@scope/shared';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

@Injectable()
export class TemplatesService {
  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readTemplates(): Template[] {
    this.ensureDataDir();
    if (!fs.existsSync(TEMPLATES_FILE)) return [];
    const data = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
    return JSON.parse(data);
  }

  private writeTemplates(templates: Template[]): void {
    this.ensureDataDir();
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
  }

  private readReports(): Report[] {
    this.ensureDataDir();
    if (!fs.existsSync(REPORTS_FILE)) return [];
    const data = fs.readFileSync(REPORTS_FILE, 'utf-8');
    return JSON.parse(data);
  }

  private writeReports(reports: Report[]): void {
    this.ensureDataDir();
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
  }

  findAll(): Template[] {
    return this.readTemplates();
  }

  findOne(id: string): Template {
    const template = this.readTemplates().find((t) => t.id === id);
    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    return template;
  }

  create(data: Partial<Template>): Template {
    const templates = this.readTemplates();
    const template: Template = {
      id: uuidv4(),
      name: data.name || 'Untitled Template',
      description: data.description || '',
      blocks: data.blocks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templates.push(template);
    this.writeTemplates(templates);
    return template;
  }

  update(id: string, data: Partial<Template>): Template {
    const templates = this.readTemplates();
    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    templates[index] = {
      ...templates[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.writeTemplates(templates);
    return templates[index];
  }

  delete(id: string): void {
    const templates = this.readTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    if (filtered.length === templates.length) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    this.writeTemplates(filtered);
  }

  createReport(
    templateId: string,
    values: Record<string, any>,
  ): Report {
    const template = this.findOne(templateId);
    const reports = this.readReports();
    const report: Report = {
      id: uuidv4(),
      templateId,
      templateName: template.name,
      values,
      createdAt: new Date().toISOString(),
    };
    reports.push(report);
    this.writeReports(reports);
    return report;
  }
}
