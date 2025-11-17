/**
 * Example: How to integrate Analytics in Auth Module
 *
 * This file shows how to add analytics tracking to your authentication flow.
 * Copy the relevant parts to your actual auth.service.ts
 */

import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics.service';

@Injectable()
export class AuthServiceExample {
  constructor(
    private readonly analytics: AnalyticsService,
    // ... other dependencies
  ) {}

  /**
   * Example: Track user signup
   */
  async signup(email: string, password: string, metadata?: any) {
    // Your signup logic
    const user = { id: 'user-123', email };

    // Track signup event
    await this.analytics.trackSignup(user.id, user.email, {
      provider: 'email',
      source: metadata?.source || 'web',
      referrer: metadata?.referrer,
    });

    return user;
  }

  /**
   * Example: Track user login
   */
  async login(email: string, password: string) {
    // Your login logic
    const user = { id: 'user-123', email };

    // Track login event
    await this.analytics.trackLogin(user.id, user.email, {
      provider: 'email',
      device: 'desktop',
    });

    return user;
  }

  /**
   * Example: Track OAuth login
   */
  async googleLogin(profile: any) {
    const user = { id: profile.id, email: profile.email };

    // Track OAuth login
    await this.analytics.trackLogin(user.id, user.email, {
      provider: 'google',
      isNewUser: profile.isNewUser,
    });

    return user;
  }

  /**
   * Example: Track password reset
   */
  async resetPassword(email: string) {
    // Your reset logic

    // Track password reset request
    await this.analytics.trackEvent({
      eventName: 'password_reset_requested',
      userEmail: email,
      properties: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Example: Track email verification
   */
  async verifyEmail(userId: string, email: string) {
    // Your verification logic

    // Track email verification
    await this.analytics.trackEvent({
      eventName: 'email_verified',
      userId,
      userEmail: email,
      properties: {
        verifiedAt: new Date().toISOString(),
      },
    });
  }
}
