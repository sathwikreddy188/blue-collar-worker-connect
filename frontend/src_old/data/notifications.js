import { Briefcase, CheckCircle2, MessageCircle, CalendarCheck, Star, ClipboardCheck } from 'lucide-react';

export const notifications = [
  { id: 'n1', icon: Briefcase, title: 'New job request', text: 'Raj Kumar sent a quote for your electrician job.', time: '10 min ago', unread: true },
  { id: 'n2', icon: CheckCircle2, title: 'Worker accepted your request', text: 'Suresh Kumar accepted your plumbing job.', time: '1 hour ago', unread: true },
  { id: 'n3', icon: MessageCircle, title: 'New message', text: 'Lakshmi Devi sent you a message.', time: '3 hours ago', unread: true },
  { id: 'n4', icon: CalendarCheck, title: 'Booking confirmed', text: 'Your cleaning service is confirmed for Oct 15.', time: '1 day ago', unread: false },
  { id: 'n5', icon: ClipboardCheck, title: 'Job completed', text: 'Your carpentry job has been marked complete.', time: '3 days ago', unread: false },
  { id: 'n6', icon: Star, title: 'New review', text: 'You received a 5-star review from Arun.', time: '4 days ago', unread: false },
];
