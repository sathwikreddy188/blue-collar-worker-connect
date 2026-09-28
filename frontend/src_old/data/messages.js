export const conversations = [
  {
    id: 'c1', name: 'Raj Kumar', profession: 'Electrician', online: true,
    messages: [
      { from: 'customer', text: 'Hi, are you available tomorrow?', time: '9:12 AM' },
      { from: 'worker', text: 'Yes, I am available after 10 AM.', time: '9:15 AM' },
      { from: 'customer', text: 'Great, can you come around 11?', time: '9:16 AM' },
      { from: 'worker', text: 'Sure, I will reach by 11 AM.', time: '9:20 AM' },
    ],
  },
  {
    id: 'c2', name: 'Suresh Kumar', profession: 'Plumber', online: false,
    messages: [
      { from: 'customer', text: 'The leak is still there after your visit.', time: 'Yesterday' },
      { from: 'worker', text: 'I will come back tomorrow morning to check it, no charge.', time: 'Yesterday' },
    ],
  },
  {
    id: 'c3', name: 'Lakshmi Devi', profession: 'Cleaner', online: true,
    messages: [
      { from: 'worker', text: 'Thank you for the booking! See you Saturday.', time: '2 days ago' },
    ],
  },
];
