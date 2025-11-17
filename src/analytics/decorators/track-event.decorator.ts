import { SetMetadata } from '@nestjs/common';

export const TRACK_EVENT_KEY = 'track_event';

export interface TrackEventMetadata {
  eventName: string;
  properties?: Record<string, any>;
}

/**
 * Decorator to automatically track events when a controller method is called
 * @param eventName - Name of the event to track
 * @param properties - Optional static properties to include
 */
export const TrackEvent = (
  eventName: string,
  properties?: Record<string, any>,
) =>
  SetMetadata(TRACK_EVENT_KEY, { eventName, properties } as TrackEventMetadata);
