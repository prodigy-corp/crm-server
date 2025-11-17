import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  TrackEventDto,
  TrackPageViewDto,
  TrackConversionDto,
} from './dto/track-event.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get analytics configuration status' })
  @ApiResponse({
    status: 200,
    description: 'Analytics configuration retrieved',
  })
  getConfig() {
    return {
      enabled: this.analyticsService.isEnabled(),
      providers: {
        googleAnalytics:
          this.analyticsService.getConfig().googleAnalytics?.enabled || false,
        facebookPixel:
          this.analyticsService.getConfig().facebookPixel?.enabled || false,
      },
    };
  }

  @Post('track/event')
  @ApiOperation({ summary: 'Track a custom event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  async trackEvent(@Body() dto: TrackEventDto) {
    await this.analyticsService.trackEvent(dto);
    return { success: true, message: 'Event tracked' };
  }

  @Post('track/pageview')
  @ApiOperation({ summary: 'Track a page view' })
  @ApiResponse({ status: 201, description: 'Page view tracked successfully' })
  async trackPageView(@Body() dto: TrackPageViewDto) {
    await this.analyticsService.trackPageView(dto);
    return { success: true, message: 'Page view tracked' };
  }

  @Post('track/conversion')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Track a conversion event (requires authentication)',
  })
  @ApiResponse({ status: 201, description: 'Conversion tracked successfully' })
  async trackConversion(@Body() dto: TrackConversionDto) {
    await this.analyticsService.trackConversion(dto);
    return { success: true, message: 'Conversion tracked' };
  }
}
