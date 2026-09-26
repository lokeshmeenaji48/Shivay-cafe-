import { Product, Testimonial, BlogPost, FAQItem } from './types';

export const PRODUCTS: Product[] = [
  // BURGERS (2 items)
  {
    id: 'b1',
    name: 'Jaipur Crispy Aloo Tikki Burger',
    description: 'Crispy seasoned potato patty, fresh tomato slices, crunchy onions, premium melting cheese, and special tandoori mayo in a toasted bun.',
    price: 20.00,
    category: 'Burger',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'b2',
    name: 'Double Cheese Veggie Burger',
    description: 'Double vegetable patties, extra liquid cheese slice, jalapeños, and fresh lettuce with sweet onion dressing.',
    price: 20.00,
    category: 'Burger',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80'
  },

  // PIZZAS (2 items)
  {
    id: 'p1',
    name: 'Paneer Tikka Wood-Fired Pizza',
    description: 'Fresh hand-stretched base, topped with spiced marinated paneer cubes, capsicum, red onions, coriander, and premium mozzarella cheese.',
    price: 120.00,
    category: 'Pizza',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'p2',
    name: 'Spicy Sweet Corn & Cheese Pizza',
    description: 'Delectable pizza loaded with golden sweet corn kernels, jalapeños, thick mozzarella string, and classic Italian marinara sauce.',
    price: 120.00,
    category: 'Pizza',
    badge: '',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80'
  },

  // COLD COFFEE (2 items)
  {
    id: 'cc1',
    name: 'Classic Jaipur Cold Coffee with Ice Cream',
    description: 'Rich whipped cold espresso blended with fresh thick milk, topped with a scoop of premium vanilla ice cream and chocolate drizzle.',
    price: 60.00,
    category: 'Cold Coffee',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'cc2',
    name: 'Cadbury Chocolate Hazelnut Cold Coffee',
    description: 'Smooth blended cold coffee featuring rich Cadbury cocoa, double ristretto espresso, and classic roasted hazelnut syrup.',
    price: 60.00,
    category: 'Cold Coffee',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80'
  },

  // DRINKS (1 item)
  {
    id: 'dr3',
    name: 'Sprite Sparkle Chilled Can',
    description: 'Crisp and clear lemon-lime refreshing soda, chilled to perfection for a perfect spicy pairing.',
    price: 40.00,
    category: 'Drinks',
    badge: '',
    image: 'https://images.unsplash.com/photo-1534687941688-651cac47071e?w=600&auto=format&fit=crop&q=80'
  },

  // SHAKES (3 items)
  {
    id: 'sh1',
    name: 'Fresh Royal Papaya Shake',
    description: 'Thick organic shake made with sweet ripened local papayas, blended with fresh cold milk, and loaded with almonds & cashews.',
    price: 60.00,
    category: 'Shakes',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sh2',
    name: 'Healthy Almond Banana Shake',
    description: 'Rich energy blend of sweet yellow bananas, honey, fresh cream, milk, and finely crushed almonds and pistachios.',
    price: 50.00,
    category: 'Shakes',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1526424382096-74a93e105682?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sh3',
    name: 'Special Dry Fruit Badam Shake',
    description: 'Premium chilled shake blended with high-grade almonds, green cardamom, pure saffron strands, and thick milk.',
    price: 50.00,
    category: 'Shakes',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80'
  },

  // SANDWICH (2 items)
  {
    id: 'sd1',
    name: 'Jaipur Club Grilled Cheese Sendvich',
    description: 'Triple-layer sandwich stuffed with green mint chutney, sliced boiled potatoes, onions, cucumbers, tomatoes, and melting cheese.',
    price: 30.00,
    category: 'Sandwich',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sd2',
    name: 'Spicy Corn & Paneer Grilled Sendvich',
    description: 'Crisp toasted bread stuffed with rich spiced paneer tikka crumbs, sweet corn kernels, capsicum, and creamy tandoori dressing.',
    price: 30.00,
    category: 'Sandwich',
    badge: '',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80'
  },

  // SNACKS (Namkeen, Biscuits)
  {
    id: 'sn4',
    name: 'Jaipur Special Masala Sev Bhujia नमकीन',
    description: 'Crispy fried noodles made from high-quality chickpea flour, flavored with a royal blend of native Rajasthani spices.',
    price: 30.00,
    category: 'Snacks',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1613721410685-7af24faecee1?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'sn5',
    name: 'Handmade Cumin Jeera Biscuit बिस्किट',
    description: 'freshly baked salty & sweet cumin cookies, crispy and light, perfectly paired with our chai or cold coffees.',
    price: 30.00,
    category: 'Snacks',
    badge: '',
    image: 'https://images.unsplash.com/photo-1558961317-19df1afc03bd?w=600&auto=format&fit=crop&q=80'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Aishwarya Roy',
    role: 'Food & Lifestyle Critic',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Shivay Cafe is an absolute masterclass in coffee refinement. The Spanish Rose Gold Latte is not just a drink; it is a full sensory performance. The warm, gold-accented atmosphere feels incredibly exclusive and welcoming.',
    date: 'June 18, 2026'
  },
  {
    id: 't2',
    name: 'Marcus Vance',
    role: 'Branding Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'As someone obsessed with minimalist aesthetics, the interior design, typography, and glassmorphic branding details of Shivay blew me away. It has the precision of Apple combined with a luxury, traditional coffee heart.',
    date: 'June 25, 2026'
  },
  {
    id: 't3',
    name: 'Dr. Siddharth Sharma',
    role: 'Local Resident & Regular',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'My weekend ritual is booking a quiet corner table via their seamless system. The Wagyu burger and Kyoto wood-drip coffee keep me coming back. It is an indispensable gem in our community.',
    date: 'July 01, 2026'
  },
  {
    id: 't4',
    name: 'Elena Rostova',
    role: 'Pastry Chef & Writer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'I am highly critical of laminated doughs, but the Pistachio Cardamom Croissant at Shivay is flaky perfection. Layering is outstanding, and the balance of cardamon spice is exceptionally graceful.',
    date: 'May 14, 2026'
  },
  {
    id: 't5',
    name: 'Kabir Mehta',
    role: 'Tech Entrepreneur',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'An exceptional spot to hold casual partner discussions. High-speed network, comfortable bento seating, and divine cold brew. They execute every micro-detail with incredible precision.',
    date: 'June 05, 2026'
  },
  {
    id: 't6',
    name: 'Sophia Lindqvist',
    role: 'Travel Journalist',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'I have traveled through 40 countries sampling third-wave coffee shops, and Shivay Cafe sits firmly in my global top three. From beans sourcing to the final hospitality, it is an sublime adventure.',
    date: 'April 28, 2026'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'The Alchemy of Single-Origin Bean Sourcing',
    excerpt: 'Explore how we traverse the high-altitude volcanic ridges of Ethiopia and Colombia to secure our unique organic micro-lots.',
    content: 'At Shivay Cafe, coffee is not just a commodity; it is an botanical quest. Our head roaster travels quarterly to source coffee directly from small family-owned plantations. By cutting out intermediaries, we ensure the farmers are paid premium wages, and we secure first rights to the most complex, unblemished micro-lots. In this post, we discuss the chemical and geological profiles that give our Ethiopia Yirgacheffe its distinct jasmine aroma and tea-like light body...',
    category: 'Coffee Craft',
    author: {
      name: 'Rohan Devendra',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'Master Roaster'
    },
    date: 'June 24, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'b2',
    title: 'Artisanal Lamination: Secrets of the Perfect Croissant',
    excerpt: 'Our pastry chef reveals the scientific ratio of dry butter, ambient room humidity, and slow proofing required to achieve 27 crisp layers.',
    content: 'Laminated dough is a delicate dance between temperature and patience. A perfect croissant requires high-fat European-style butter, custom flour blend, and 72 hours of meticulous temperature-controlled proofing. Our kitchen team keeps the lamination salon at exactly 16°C to prevent butter melt-in. Each fold increases the flaky stratification, resulting in the gorgeous honeycomb interior our customers love...',
    category: 'Bakery Science',
    author: {
      name: 'Claire Moreau',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      role: 'Head Pastry Chef'
    },
    date: 'June 12, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'b3',
    title: 'Introducing Our Evening Gastro Menu: Blending Coffee & Fine Dining',
    excerpt: 'A behind-the-scenes look at our new savory creations including wood-fired truffle pizzas, gold leaf A5 Wagyu, and espresso-based savory reductions.',
    content: 'We believe a modern cafe should seamlessly transition from an active morning sanctuary to an intimate, relaxed evening escape. Our culinary design team spent six months developing a high-end food menu that pays homage to our coffee heritage. Every pizza crust undergoes a 48-hour slow ferment, and our sauces utilize coffee cherry syrups and espresso infusions to bring deep complex umami flavors...',
    category: 'Gastronomy',
    author: {
      name: 'Chef Amit Khurana',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80',
      role: 'Executive Chef'
    },
    date: 'July 03, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'b4',
    title: 'The Art of Milk Texturing: Microfoam vs. Macrofoam',
    excerpt: 'Unveiling the molecular science behind proteins in dairy and oat milks that yield the glossy, sweet, pouring surface for elite latte art.',
    content: 'Steaming milk is not simply heating it; it is an act of mechanical denaturation. When steam enters milk, it traps air inside whey protein cocoons. For a true flat white or cortado, we require microfoam—tiny, invisible bubbles that create a liquid-silk mouthfeel and catch light like polished marble. In this guide, our baristas demonstrate how to position the steam wand to hit 63°C...',
    category: 'Barista Skills',
    author: {
      name: 'Tara Mehra',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: 'Chief Barista'
    },
    date: 'May 29, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'f1',
    question: 'What are the signature features of Shivay Cafe?',
    answer: 'Shivay Cafe is a premium, luxury modern coffee-shop and fast food restaurant located in Mandawari, Lalsot, Dausa, Rajasthan. We specialize in exceptional cold coffees, fresh papaya and banana shakes, premium wood-fired pizzas, delicious burgers, grilled sandwiches, and traditional Indian tea-time snacks like namkeen and jeera biscuits.',
    category: 'General'
  },
  {
    id: 'f2',
    question: 'How do I secure a reservation for special events or meetings?',
    answer: 'You can easily reserve your preferred seating category (such as our Glass Lounge, Leather Booths, or Work Pods) using our online Reservation portal. We support customized guest seating numbers, specific date/time scheduling, and special request forms.',
    category: 'Reservations'
  },
  {
    id: 'f3',
    question: 'Are there gluten-free and vegan choices on the menu?',
    answer: 'Absolutely. Over 30% of our menu consists of plant-based and gluten-sensitive choices. This includes oat, almond, and macadamia milk options, our roasted pistachio items, vegan almond ricotta sandwiches, and gluten-free pastries baked daily in a dedicated oven.',
    category: 'Dietary'
  },
  {
    id: 'f4',
    question: 'Where do you source your organic coffee beans?',
    answer: 'We source exclusively from organic-certified micro-lots in Colombia, Ethiopia, and Sumatra. Our direct-trade partnerships ensure all farmers are compensated ethically well above market rates, allowing us access to top-tier, hand-harvested beans.',
    category: 'Sourcing'
  },
  {
    id: 'f5',
    question: 'Do you offer high-speed internet and working space?',
    answer: 'Yes. Shivay Cafe is fully equipped with enterprise-grade gigabit Wi-Fi, numerous high-power charging docks at every seat, and ergonomic layout configurations, making it a premier spot for local entrepreneurs and creatives.',
    category: 'Services'
  },
  {
    id: 'f6',
    question: 'Can I purchase your house-roasted coffee beans?',
    answer: 'Yes, we sell whole and freshly ground bean pouches (250g and 1kg) at our counter and in the online menu section. Each bag features detailed crop location, roasting date, altitude, and tasting profile notes.',
    category: 'Products'
  },
  {
    id: 'f7',
    question: 'What are your standard opening hours?',
    answer: 'We are open Daily from 07:00 AM to 10:00 PM. Our afternoon and evening menu shifts from light bakery breakfast into premium pizzas, burgers, and hot desserts starting at 12:00 PM.',
    category: 'General'
  },
  {
    id: 'f8',
    question: 'Do you host private culinary events or coffee workshops?',
    answer: 'Yes. We host intimate multi-course culinary dinners, professional latte art training, and single-origin coffee tasting masterclasses. Details of upcoming events are listed under our blog and events sections.',
    category: 'Services'
  }
];

export const GALLERY_IMAGES = [
  {
    id: 'g1',
    src: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&auto=format&fit=crop&q=80',
    title: 'Gourmet Espresso Pouring',
    category: 'Espresso Craft'
  },
  {
    id: 'g2',
    src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    title: 'Warm Glassmorphic Lounge',
    category: 'Ambiance'
  },
  {
    id: 'g3',
    src: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
    title: 'Fresh Cardamom Pastries',
    category: 'Bakery'
  },
  {
    id: 'g4',
    src: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
    title: 'Artisanal Golden Latte Art',
    category: 'Espresso Craft'
  },
  {
    id: 'g5',
    src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    title: 'Slow Ferment Truffle Pizza',
    category: 'Culinary'
  },
  {
    id: 'g6',
    src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    title: 'The Signature A5 Wagyu Burger',
    category: 'Culinary'
  },
  {
    id: 'g7',
    src: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop&q=80',
    title: 'Cozy Fireside Seating',
    category: 'Ambiance'
  },
  {
    id: 'g8',
    src: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=80',
    title: 'Matcha Molten lava Soufflé',
    category: 'Desserts'
  },
  {
    id: 'g9',
    src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
    title: 'Exterior Modern Architecture',
    category: 'Ambiance'
  }
];
