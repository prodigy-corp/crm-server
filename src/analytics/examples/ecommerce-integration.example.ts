/**
 * Example: E-commerce Analytics Integration
 *
 * This file shows how to track e-commerce events like purchases,
 * cart actions, and product views.
 */

import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics.service';

@Injectable()
export class EcommerceServiceExample {
  constructor(private readonly analytics: AnalyticsService) {}

  /**
   * Track product view
   */
  async trackProductView(userId: string, productId: string, productData: any) {
    await this.analytics.trackEvent({
      eventName: 'view_item',
      userId,
      properties: {
        item_id: productId,
        item_name: productData.name,
        item_category: productData.category,
        price: productData.price,
        currency: 'USD',
      },
    });
  }

  /**
   * Track add to cart
   */
  async trackAddToCart(userId: string, item: any) {
    await this.analytics.trackEvent({
      eventName: 'add_to_cart',
      userId,
      properties: {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        currency: 'USD',
      },
    });
  }

  /**
   * Track purchase/conversion
   */
  async trackPurchase(userId: string, email: string, order: any) {
    await this.analytics.trackConversion({
      conversionName: 'purchase',
      value: order.total,
      currency: 'USD',
      userId,
      userEmail: email,
      properties: {
        transaction_id: order.id,
        items: order.items.map((item: any) => ({
          item_id: item.productId,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shipping: order.shippingCost,
        tax: order.tax,
      },
    });
  }

  /**
   * Track checkout initiation
   */
  async trackBeginCheckout(userId: string, cartData: any) {
    await this.analytics.trackEvent({
      eventName: 'begin_checkout',
      userId,
      properties: {
        value: cartData.total,
        currency: 'USD',
        items: cartData.items.length,
      },
    });
  }

  /**
   * Track search
   */
  async trackSearch(userId: string, searchTerm: string, resultsCount: number) {
    await this.analytics.trackEvent({
      eventName: 'search',
      userId,
      properties: {
        search_term: searchTerm,
        results_count: resultsCount,
      },
    });
  }
}
