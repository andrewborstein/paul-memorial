import { NextRequest } from 'next/server';
import { serverFetch } from '@/lib/utils';

const testMemories = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    title: 'Coffee and Conversations',
    body: "I'll never forget our weekly coffee meetups. Paul always had the most interesting stories about his travels and would listen so intently to everyone else's. He had this way of making you feel like the most important person in the room. Those conversations shaped so many of my life decisions.",
    photo_count: 0,
    created_at: '2024-01-15T10:30:00.000Z',
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    title: 'The Fishing Trip',
    body: "Remember that weekend at the lake? Paul insisted we go fishing even though none of us knew what we were doing. We spent more time untangling lines than actually fishing, but he was so patient and encouraging. We ended up catching nothing but had the best time laughing and sharing stories. That's when I realized what a great teacher he was.",
    photo_count: 2,
    photos: [
      {
        public_id: 'paul-memorial/fishing-trip-1',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
        caption: 'Fishing at the lake',
      },
      {
        public_id: 'paul-memorial/fishing-trip-2',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
        caption: 'Sunset by the water',
      },
    ],
    created_at: '2024-01-10T14:20:00.000Z',
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    body: "Paul was the kind of person who would drop everything to help a friend. When my car broke down in the middle of nowhere, he drove an hour to pick me up without hesitation. That's just who he was - always there when you needed him, no questions asked.",
    photo_count: 0,
    created_at: '2024-01-08T09:15:00.000Z',
  },
  {
    name: 'David Thompson',
    email: 'david.t@example.com',
    title: 'Late Night Philosophy',
    body: "Our late-night conversations about life, the universe, and everything in between were legendary. Paul had this incredible ability to see the bigger picture while still appreciating the small moments. He taught me that wisdom isn't about having all the answers, but about asking the right questions.",
    photo_count: 1,
    photos: [
      {
        public_id: 'paul-memorial/late-night-1',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
        caption: 'Late night coffee and conversation',
      },
    ],
    created_at: '2024-01-05T22:45:00.000Z',
  },
  {
    name: 'Lisa Park',
    email: 'lisa.park@example.com',
    title: 'The Birthday Surprise',
    body: "Paul organized the most thoughtful birthday surprise for me. He remembered something I mentioned months ago about wanting to try that new restaurant downtown. He coordinated with all our friends and made it happen. That's the kind of attention to detail and care he put into every relationship.",
    photo_count: 3,
    photos: [
      {
        public_id: 'paul-memorial/birthday-1',
        url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&h=600&fit=crop',
        caption: 'Birthday celebration',
      },
      {
        public_id: 'paul-memorial/birthday-2',
        url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&h=600&fit=crop',
        caption: 'Friends gathered around',
      },
      {
        public_id: 'paul-memorial/birthday-3',
        url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&h=600&fit=crop',
        caption: 'Cake and candles',
      },
    ],
    created_at: '2024-01-03T16:30:00.000Z',
  },
  {
    name: 'James Wilson',
    email: 'james.w@example.com',
    body: 'I met Paul at a local community event and we instantly connected over our shared love of hiking. He was always up for an adventure, no matter the weather or difficulty. His enthusiasm was contagious - he made every trail feel like an expedition.',
    photo_count: 0,
    created_at: '2023-12-28T11:00:00.000Z',
  },
  {
    name: 'Rachel Green',
    email: 'rachel.g@example.com',
    title: 'The Book Club',
    body: 'Paul started our neighborhood book club and it became the highlight of my month. He had such diverse taste in literature and could discuss any genre with passion and insight. He taught me to appreciate books I never would have picked up on my own.',
    photo_count: 1,
    photos: [
      {
        public_id: 'paul-memorial/book-club-1',
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
        caption: 'Book club meeting',
      },
    ],
    created_at: '2023-12-25T13:20:00.000Z',
  },
  {
    name: 'Alex Martinez',
    email: 'alex.m@example.com',
    body: 'Paul was my mentor when I first started in the industry. He never made me feel stupid for asking questions and always took the time to explain things thoroughly. His guidance shaped my entire career path. I still use the advice he gave me every day.',
    photo_count: 0,
    created_at: '2023-12-20T08:45:00.000Z',
  },
  {
    name: 'Jennifer Lee',
    email: 'jennifer.lee@example.com',
    title: 'The Garden Project',
    body: 'When Paul heard I wanted to start a community garden, he immediately offered to help. He spent every weekend for months helping me plan, build, and plant. His knowledge of plants was incredible, and he taught me so much about sustainable gardening. The garden is still thriving today.',
    photo_count: 4,
    photos: [
      {
        public_id: 'paul-memorial/garden-1',
        url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
        caption: 'Community garden',
      },
      {
        public_id: 'paul-memorial/garden-2',
        url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
        caption: 'Planting vegetables',
      },
      {
        public_id: 'paul-memorial/garden-3',
        url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
        caption: 'Harvest time',
      },
      {
        public_id: 'paul-memorial/garden-4',
        url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
        caption: 'Beautiful flowers',
      },
    ],
    created_at: '2023-12-15T15:10:00.000Z',
  },
  {
    name: 'Robert Kim',
    email: 'robert.kim@example.com',
    body: "Paul had this amazing ability to bring people together. He was always organizing potlucks, game nights, and other gatherings. He made sure everyone felt included and welcome. Our friend group wouldn't exist without his efforts to connect people.",
    photo_count: 0,
    created_at: '2023-12-10T19:30:00.000Z',
  },
  {
    name: 'Amanda Foster',
    email: 'amanda.f@example.com',
    title: 'The Road Trip',
    body: 'That spontaneous road trip to the coast was one of the best experiences of my life. Paul suggested it on a Friday afternoon and by Saturday morning we were on the road. He had this sense of adventure that was infectious. We discovered so many amazing places and had deep conversations that lasted for hours.',
    photo_count: 2,
    photos: [
      {
        public_id: 'paul-memorial/road-trip-1',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        caption: 'Scenic coastal view',
      },
      {
        public_id: 'paul-memorial/road-trip-2',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        caption: 'Road trip memories',
      },
    ],
    created_at: '2023-12-05T12:00:00.000Z',
  },
  {
    name: 'Chris Davis',
    email: 'chris.davis@example.com',
    body: 'Paul was the first person to really believe in my writing. He read every draft, gave thoughtful feedback, and encouraged me to keep going when I wanted to give up. His support meant everything to me. I dedicated my first published piece to him.',
    photo_count: 0,
    created_at: '2023-11-30T17:45:00.000Z',
  },
  {
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    title: 'The Cooking Lessons',
    body: "Paul taught me how to cook his grandmother's recipes. He was so patient and made the whole process fun. His kitchen was always open to friends, and he loved sharing meals and stories. I still make his pasta sauce recipe every Sunday.",
    photo_count: 1,
    created_at: '2023-11-25T20:15:00.000Z',
  },
  {
    name: 'Tom Anderson',
    email: 'tom.a@example.com',
    body: "I'll never forget how Paul helped me through my divorce. He listened without judgment, offered practical advice, and reminded me of my worth when I was at my lowest. He was the friend I needed most during that difficult time.",
    photo_count: 0,
    created_at: '2023-11-20T14:30:00.000Z',
  },
  {
    name: 'Nina Patel',
    email: 'nina.patel@example.com',
    title: 'The Photography Workshop',
    body: 'Paul organized a photography workshop for our community and it was incredible. He had such an eye for composition and light. He taught us to see beauty in everyday moments. I still carry my camera everywhere because of his influence.',
    photo_count: 3,
    created_at: '2023-11-15T10:00:00.000Z',
  },
  {
    name: "Kevin O'Brien",
    email: 'kevin.obrien@example.com',
    body: "Paul was my running partner for years. We trained for marathons together, shared our life stories during long runs, and celebrated each other's victories. He pushed me to be better while always being supportive. Running isn't the same without him.",
    photo_count: 0,
    created_at: '2023-11-10T06:30:00.000Z',
  },
  {
    name: 'Sophie Turner',
    email: 'sophie.t@example.com',
    title: 'The Music Nights',
    body: 'Paul had an incredible vinyl collection and would host music listening nights. He introduced me to so many amazing artists I never would have discovered on my own. His passion for music was inspiring, and he could talk about any genre with knowledge and enthusiasm.',
    photo_count: 2,
    created_at: '2023-11-05T21:00:00.000Z',
  },
  {
    name: 'Daniel Brown',
    email: 'daniel.brown@example.com',
    body: 'Paul was my neighbor for 15 years and became like family. He was always there to help with home repairs, lend tools, or just chat over the fence. He made our neighborhood feel like a real community. I miss seeing him working in his garden.',
    photo_count: 0,
    created_at: '2023-10-30T16:45:00.000Z',
  },
  {
    name: 'Jessica White',
    email: 'jessica.white@example.com',
    title: 'The Volunteer Project',
    body: "Paul organized our community's volunteer program at the local food bank. He was so committed to helping others and inspired so many people to get involved. His leadership and compassion made a real difference in our community.",
    photo_count: 1,
    created_at: '2023-10-25T13:20:00.000Z',
  },
  {
    name: 'Ryan Clark',
    email: 'ryan.clark@example.com',
    body: "Paul was my college roommate and best friend. We stayed up late talking about our dreams, supported each other through tough times, and celebrated every success together. He was the kind of friend who becomes family. I'm grateful for every moment we shared.",
    photo_count: 0,
    created_at: '2023-10-20T18:10:00.000Z',
  },
  // Adding very short memories for height variation
  {
    name: 'Kate Miller',
    email: 'kate.m@example.com',
    body: 'Paul always made me laugh.',
    photo_count: 0,
    created_at: '2023-10-15T09:30:00.000Z',
  },
  {
    name: 'Sam Johnson',
    email: 'sam.j@example.com',
    title: 'The Best Neighbor',
    body: 'He was the best neighbor anyone could ask for.',
    photo_count: 1,
    created_at: '2023-10-10T11:45:00.000Z',
  },
  {
    name: 'Emma Davis',
    email: 'emma.d@example.com',
    body: 'I miss his smile.',
    photo_count: 0,
    created_at: '2023-10-05T15:20:00.000Z',
  },
  {
    name: 'Mark Wilson',
    email: 'mark.w@example.com',
    title: 'A True Friend',
    body: 'Paul was always there when you needed him.',
    photo_count: 2,
    created_at: '2023-09-30T12:00:00.000Z',
  },
  {
    name: 'Anna Chen',
    email: 'anna.chen@example.com',
    body: 'His kindness knew no bounds.',
    photo_count: 0,
    created_at: '2023-09-25T14:30:00.000Z',
  },
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    title: 'Unforgettable',
    body: 'I will never forget his generosity.',
    photo_count: 1,
    created_at: '2023-09-20T17:15:00.000Z',
  },
  {
    name: 'Lisa Wong',
    email: 'lisa.wong@example.com',
    body: 'He taught me so much.',
    photo_count: 0,
    created_at: '2023-09-15T10:45:00.000Z',
  },
  {
    name: 'Mike Rodriguez',
    email: 'mike.r@example.com',
    title: 'A Mentor',
    body: 'Paul guided me through difficult times.',
    photo_count: 3,
    created_at: '2023-09-10T20:00:00.000Z',
  },
  {
    name: 'Sarah Kim',
    email: 'sarah.kim@example.com',
    body: 'His wisdom changed my life.',
    photo_count: 0,
    created_at: '2023-09-05T08:30:00.000Z',
  },
  {
    name: 'David Lee',
    email: 'david.lee@example.com',
    title: 'A Great Man',
    body: 'Paul was one of the kindest people I ever knew.',
    photo_count: 1,
    created_at: '2023-09-01T16:20:00.000Z',
  },
  // Adding very long memories to test truncation
  {
    name: 'Jennifer Adams',
    email: 'jennifer.adams@example.com',
    title: 'The Long Story',
    body: "This is a very long memory that should definitely trigger the truncation functionality. Paul was such an incredible person who touched so many lives in so many different ways. I remember the first time I met him at that community event downtown. He was standing by the refreshments table, and I was nervous about approaching anyone. But Paul had this amazing ability to make everyone feel welcome and comfortable. He noticed me standing alone and immediately came over to introduce himself. We ended up talking for hours that night, and I learned so much about his life, his passions, and his philosophy on friendship and community. He told me stories about his travels around the world, his experiences working with different cultures, and his belief that every person has something valuable to contribute to the world. That conversation changed my perspective on so many things. I started volunteering more in my community, I became more open to meeting new people, and I began to see the beauty in everyday interactions. Paul had this way of making you feel like you were the most important person in the room, even when he was surrounded by dozens of other people. He would remember details about conversations we had months ago, ask about things I was working on, and genuinely care about how my life was going. His memory for people and their stories was incredible, and it made everyone feel valued and seen. I think that's what made him such a special person - he didn't just listen, he truly heard you. He remembered what mattered to you, and he would follow up on things you mentioned in passing. It wasn't just polite conversation with Paul; it was genuine connection. He taught me that friendship isn't about the quantity of time you spend together, but the quality of the moments you share. Even brief interactions with him could leave you feeling inspired and motivated for days. His wisdom came from a place of deep empathy and understanding of human nature. He had experienced so much in his life - both joy and sorrow - and he used those experiences to help others navigate their own challenges. When I was going through a difficult time in my career, Paul was the one who helped me see the bigger picture. He reminded me that setbacks are often opportunities in disguise, and that every experience, good or bad, contributes to who we become. His perspective was always grounded in reality but infused with hope and possibility. I miss his laughter, his stories, his advice, and most of all, his friendship. But I carry the lessons he taught me every day, and I try to live my life in a way that would make him proud. Paul showed me what it means to be truly present for others, to listen with your heart, and to find joy in the simple moments of connection that make life meaningful.",
    photo_count: 2,
    created_at: '2023-08-25T12:00:00.000Z',
  },
  {
    name: 'Michael Thompson',
    email: 'michael.t@example.com',
    title: 'Another Long Memory',
    body: "This is another very long memory that should definitely trigger the truncation functionality. Paul was such an incredible person who touched so many lives in so many different ways. I remember the first time I met him at that community event downtown. He was standing by the refreshments table, and I was nervous about approaching anyone. But Paul had this amazing ability to make everyone feel welcome and comfortable. He noticed me standing alone and immediately came over to introduce himself. We ended up talking for hours that night, and I learned so much about his life, his passions, and his philosophy on friendship and community. He told me stories about his travels around the world, his experiences working with different cultures, and his belief that every person has something valuable to contribute to the world. That conversation changed my perspective on so many things. I started volunteering more in my community, I became more open to meeting new people, and I began to see the beauty in everyday interactions. Paul had this way of making you feel like you were the most important person in the room, even when he was surrounded by dozens of other people. He would remember details about conversations we had months ago, ask about things I was working on, and genuinely care about how my life was going. His memory for people and their stories was incredible, and it made everyone feel valued and seen. I think that's what made him such a special person - he didn't just listen, he truly heard you. He remembered what mattered to you, and he would follow up on things you mentioned in passing. It wasn't just polite conversation with Paul; it was genuine connection. He taught me that friendship isn't about the quantity of time you spend together, but the quality of the moments you share. Even brief interactions with him could leave you feeling inspired and motivated for days. His wisdom came from a place of deep empathy and understanding of human nature. He had experienced so much in his life - both joy and sorrow - and he used those experiences to help others navigate their own challenges. When I was going through a difficult time in my career, Paul was the one who helped me see the bigger picture. He reminded me that setbacks are often opportunities in disguise, and that every experience, good or bad, contributes to who we become. His perspective was always grounded in reality but infused with hope and possibility. I miss his laughter, his stories, his advice, and most of all, his friendship. But I carry the lessons he taught me every day, and I try to live my life in a way that would make him proud. Paul showed me what it means to be truly present for others, to listen with your heart, and to find joy in the simple moments of connection that make life meaningful.",
    photo_count: 0,
    created_at: '2023-08-20T14:30:00.000Z',
  },
];

export async function POST(req: NextRequest) {
  try {
    let createdCount = 0;

    for (const memory of testMemories) {
      // Add some randomization to the time within the same day
      const baseDate = new Date(memory.created_at);
      const randomMinutes = Math.floor(Math.random() * 1440); // Random minutes in a day
      const randomSeconds = Math.floor(Math.random() * 60);
      const randomMilliseconds = Math.floor(Math.random() * 1000);

      baseDate.setMinutes(baseDate.getMinutes() + randomMinutes);
      baseDate.setSeconds(baseDate.getSeconds() + randomSeconds);
      baseDate.setMilliseconds(baseDate.getMilliseconds() + randomMilliseconds);

      const memoryWithRandomTime = {
        ...memory,
        created_at: baseDate.toISOString(),
      };

      const response = await serverFetch('/api/memory', {
        method: 'POST',
        body: JSON.stringify(memoryWithRandomTime),
      });

      if (response.ok) {
        createdCount++;
      }
    }

    return Response.json({
      success: true,
      count: createdCount,
      message: `Created ${createdCount} test memories`,
    });
  } catch (error) {
    console.error('Error creating test memories:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
