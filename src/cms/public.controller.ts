import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { SitemapService } from './services/sitemap.service';

@Controller('cms')
export class CmsPublicController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/xml')
  async sitemap(@Res() res: Response) {
    const xml = await this.sitemapService.generateSitemap();
    res.send(xml);
  }

  @Get('robots.txt')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/plain')
  async robots(@Res() res: Response) {
    const txt = await this.sitemapService.generateRobotsTxt();
    res.send(txt);
  }

  @Get('rss.xml')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/rss+xml')
  async rss(@Res() res: Response) {
    const rss = await this.sitemapService.generateRSSFeed();
    res.send(rss);
  }

  @Get('sitemap.html')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/html')
  async sitemapHtml(@Res() res: Response) {
    const html = await this.sitemapService.generateHTMLSitemap();
    res.send(html);
  }
}
