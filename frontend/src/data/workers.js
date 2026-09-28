export const workers = [
  {
    id: 'w1', name: 'Raj Kumar', profession: 'Electrician', categoryId: 'electrician',
    location: 'Ameerpet, Hyderabad', distanceKm: 2.3, experience: 6, rating: 4.8, jobsDone: 214,
    startingPrice: 500, available: true, avatar: 'RK',
    about: 'Licensed electrician with six years of experience in residential and commercial wiring. I focus on safe, code-compliant work and clean finishing.',
    services: ['House wiring', 'Switchboard repair', 'Fan & light installation', 'MCB & fuse issues', 'Inverter setup'],
    skills: ['Wiring', 'Circuit repair', 'Panel installation', 'Safety inspection'],
    photos: [1, 2, 3],
    reviews: [
      { customer: 'Arun', rating: 5, text: 'Very professional and completed the work quickly.', date: '3 days ago' },
      { customer: 'Priya', rating: 5, text: 'Fixed a tricky short circuit that two other electricians missed.', date: '2 weeks ago' },
      { customer: 'Vikram', rating: 4, text: 'Good work, arrived slightly late but called ahead.', date: '1 month ago' },
    ],
  },
  {
    id: 'w2', name: 'Suresh Kumar', profession: 'Plumber', categoryId: 'plumber',
    location: 'Kukatpally, Hyderabad', distanceKm: 4.1, experience: 9, rating: 4.6, jobsDone: 312,
    startingPrice: 400, available: true, avatar: 'SK',
    about: 'Experienced plumber handling everything from small leaks to full bathroom fittings. I carry my own tools and quote upfront.',
    services: ['Leak repair', 'Bathroom fitting', 'Pipe replacement', 'Water tank cleaning', 'Drainage work'],
    skills: ['Pipe fitting', 'Leak detection', 'Sanitary installation'],
    photos: [1, 2],
    reviews: [
      { customer: 'Meena', rating: 5, text: 'Solved a leak that had been going on for weeks. Highly recommend.', date: '1 week ago' },
      { customer: 'Rahul', rating: 4, text: 'Fair pricing and honest about what needed fixing.', date: '3 weeks ago' },
    ],
  },
  {
    id: 'w3', name: 'Ravi Sharma', profession: 'Carpenter', categoryId: 'carpenter',
    location: 'Madhapur, Hyderabad', distanceKm: 5.6, experience: 12, rating: 4.9, jobsDone: 189,
    startingPrice: 600, available: false, avatar: 'RS',
    about: 'Custom furniture and woodwork specialist. I build wardrobes, modular kitchens, and handle general carpentry repairs.',
    services: ['Custom furniture', 'Door & window repair', 'Modular kitchen', 'Wardrobe fitting'],
    skills: ['Woodworking', 'Furniture design', 'Polishing', 'Modular fitting'],
    photos: [1, 2, 3],
    reviews: [
      { customer: 'Deepak', rating: 5, text: 'Built a wardrobe that fit our odd-shaped room perfectly.', date: '5 days ago' },
    ],
  },
  {
    id: 'w4', name: 'Mahesh Kumar', profession: 'Painter', categoryId: 'painter',
    location: 'Miyapur, Hyderabad', distanceKm: 7.2, experience: 8, rating: 4.5, jobsDone: 156,
    startingPrice: 350, available: true, avatar: 'MK',
    about: 'Interior and exterior painting with attention to surface prep. I work with a small team for faster turnaround on larger jobs.',
    services: ['Interior painting', 'Exterior painting', 'Waterproofing', 'Texture work'],
    skills: ['Surface prep', 'Spray painting', 'Waterproofing', 'Color consultation'],
    photos: [1, 2],
    reviews: [
      { customer: 'Sunita', rating: 4, text: 'Neat work, finished in the promised time.', date: '2 weeks ago' },
    ],
  },
  {
    id: 'w5', name: 'Anil Kumar', profession: 'AC Technician', categoryId: 'ac-repair',
    location: 'Gachibowli, Hyderabad', distanceKm: 3.8, experience: 5, rating: 4.7, jobsDone: 241,
    startingPrice: 450, available: true, avatar: 'AK',
    about: 'AC servicing, gas refilling, and new unit installation for split and window ACs. Same-day service in most cases.',
    services: ['AC servicing', 'Gas refilling', 'New installation', 'Repair & diagnostics'],
    skills: ['Split AC', 'Window AC', 'Gas charging', 'Compressor repair'],
    photos: [1, 2, 3],
    reviews: [
      { customer: 'Kiran', rating: 5, text: 'Came within two hours and fixed the cooling issue.', date: '4 days ago' },
      { customer: 'Anita', rating: 5, text: 'Explained the problem clearly before starting work.', date: '1 month ago' },
    ],
  },
  {
    id: 'w6', name: 'Lakshmi Devi', profession: 'Cleaner', categoryId: 'cleaner',
    location: 'Begumpet, Hyderabad', distanceKm: 1.9, experience: 4, rating: 4.9, jobsDone: 402,
    startingPrice: 300, available: true, avatar: 'LD',
    about: 'Thorough home and office deep cleaning. I bring my own eco-friendly supplies and can do recurring weekly visits.',
    services: ['Deep cleaning', 'Kitchen cleaning', 'Bathroom cleaning', 'Office cleaning'],
    skills: ['Deep cleaning', 'Sanitization', 'Organizing'],
    photos: [1, 2],
    reviews: [
      { customer: 'Farah', rating: 5, text: 'The most thorough cleaning we have had. Booking her again.', date: '2 days ago' },
    ],
  },
];

export function getWorkerById(id) {
  return workers.find((w) => w.id === id);
}
