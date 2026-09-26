import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  pagePath: string;
}

export default function SEO({ title, description, pagePath }: SEOProps) {
  useEffect(() => {
    // Dynamically set document title and meta description
    document.title = `${title} | Shivay Cafe - Luxury Coffee & Gastronomy`;
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update or create Open Graph tags
    const ogTags = {
      'og:title': `${title} | Shivay Cafe`,
      'og:description': description,
      'og:type': 'website',
      'og:url': `https://shivaycafe.com${pagePath}`,
      'og:image': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
      'og:site_name': 'Shivay Cafe',
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    });

    // Inject Schema.org Structured Data for Local Business
    const schemaMarkup = {
      '@context': 'https://schema.org',
      '@type': 'CafeOrCoffeeShop',
      'name': 'Shivay Cafe',
      'image': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
      '@id': 'https://shivaycafe.com/#cafe',
      'url': 'https://shivaycafe.com',
      'telephone': '+1-800-SHIVAY-CAF',
      'priceRange': '$$',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '72 Golden Bean Boulevard, Suite A',
        'addressLocality': 'San Francisco',
        'addressRegion': 'CA',
        'postalCode': '94105',
        'addressCountry': 'US'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 37.7894,
        'longitude': -122.3942
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ],
          'opens': '07:00',
          'closes': '22:00'
        }
      ],
      'menu': 'https://shivaycafe.com/menu',
      'sameAs': [
        'https://instagram.com/shivaycafe',
        'https://facebook.com/shivaycafe',
        'https://twitter.com/shivaycafe'
      ]
    };

    let scriptElement = document.getElementById('jsonld-schema');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.setAttribute('id', 'jsonld-schema');
      scriptElement.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptElement);
    }
    scriptElement.innerHTML = JSON.stringify(schemaMarkup, null, 2);

    return () => {
      // Cleanup is optional, but we keep it here to avoid duplication
    };
  }, [title, description, pagePath]);

  return null;
}
