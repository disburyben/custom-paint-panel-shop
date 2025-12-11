# Google Analytics 4 Setup Guide

This guide explains how to set up and use Google Analytics 4 (GA4) tracking on the Caspers Paintworks website.

## Setup Instructions

### 1. Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Create" or select an existing Google Analytics account
3. Create a new property with these settings:
   - **Property name**: Caspers Paintworks
   - **Reporting timezone**: Australia/Adelaide
   - **Currency**: AUD
4. Create a web data stream:
   - **Platform**: Web
   - **Website URL**: https://casperspaintworks.com.au
   - **Stream name**: Website

### 2. Get Your Measurement ID

After creating the web stream, you'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Add the Measurement ID to Environment Variables

Add the GA4 Measurement ID to your `.env` file:

```
VITE_GA4_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### 4. Restart the Development Server

```bash
pnpm dev
```

GA4 will now automatically track:
- Page views on all routes
- Scroll depth (25%, 50%, 75%, 100%)
- Time spent on each page
- User interactions

## Tracking Events

The website automatically tracks several key events:

### Contact Form Submission
When a user submits the contact form, GA4 tracks:
- `contact_form_submit` - Form submission event
- `conversion` - Conversion event (type: contact_form)

### Quote Request
When a user requests a quote, GA4 tracks:
- `quote_request` - Quote request event
- `conversion` - Conversion event (type: quote_request)

### Gallery Views
- `gallery_view` - User views the gallery page

### Service Views
- `service_view` - User views a specific service

### Custom Events

To track custom events in your code:

```typescript
import { trackEvent } from '@/lib/ga';

// Track a custom event
trackEvent('custom_event_name', {
  property_1: 'value_1',
  property_2: 'value_2',
});
```

## Using the useGA4 Hook

In React components, use the `useGA4` hook to access all tracking functions:

```typescript
import { useGA4 } from '@/hooks/useGA4';

export default function MyComponent() {
  const { trackEvent, trackButtonClick } = useGA4();

  const handleClick = () => {
    trackButtonClick('my_button', 'my_location');
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Available Tracking Functions

### Page Views
- `trackPageView(pagePath, pageTitle)` - Manually track a page view

### Events
- `trackEvent(eventName, eventParams)` - Track a custom event
- `trackFormSubmission(formName, formData)` - Track form submission
- `trackContactFormSubmission(email, subject)` - Track contact form (conversion)
- `trackQuoteRequest(serviceType)` - Track quote request (conversion)
- `trackButtonClick(buttonName, buttonLocation)` - Track button clicks
- `trackLinkClick(linkName, linkUrl)` - Track link clicks
- `trackGalleryView(category)` - Track gallery views
- `trackServiceView(serviceName)` - Track service views
- `trackTestimonialView()` - Track testimonial views
- `trackSearch(searchQuery, searchResults)` - Track searches
- `trackError(errorMessage, errorCode)` - Track errors

### Performance
- `trackScrollDepth(depth)` - Track scroll depth percentage
- `trackTimeOnPage(pageName, timeInSeconds)` - Track time on page
- `trackVideoPlay(videoName)` - Track video plays

### User Properties
- `setUserProperties(properties)` - Set custom user properties
- `setUserId(userId)` - Set user ID for tracking

## Viewing Analytics Data

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your Caspers Paintworks property
3. View real-time data under **Reports** → **Real-time**
4. View conversion data under **Reports** → **Conversions**
5. View user behavior under **Reports** → **Engagement**

## Key Metrics to Monitor

1. **Traffic Sources** - Where visitors come from
2. **Page Views** - Most visited pages
3. **Conversions** - Contact form submissions and quote requests
4. **User Engagement** - Time on page, scroll depth
5. **Device Types** - Desktop vs mobile traffic
6. **Geographic Data** - Where visitors are located

## Troubleshooting

### GA4 Not Tracking

1. Check that `VITE_GA4_ID` is set correctly in `.env`
2. Verify the Measurement ID format (should start with `G-`)
3. Check browser console for errors
4. Ensure GA4 script is loaded (check Network tab)
5. Wait 24-48 hours for data to appear in GA4 dashboard

### Events Not Showing

1. Check that event names match GA4 naming conventions (lowercase, underscores)
2. Verify events are being fired (check console logs)
3. Events may take up to 24 hours to appear in GA4
4. Use Real-time reports to verify events immediately

## Best Practices

1. **Event Naming** - Use descriptive, consistent event names
2. **Event Parameters** - Include relevant context (user action, location, etc.)
3. **Privacy** - Don't track sensitive personal information
4. **Testing** - Test tracking in development before deploying
5. **Monitoring** - Regularly check GA4 dashboard for insights

## Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9322688)
- [GA4 Best Practices](https://support.google.com/analytics/answer/11091082)
