import { Zap, Wrench, Hammer, PaintRoller, Car, Sparkles, Snowflake, Refrigerator, Truck, Trees, Grid3x3, Blocks } from 'lucide-react';

export const categories = [
  { id: 'electrician', name: 'Electrician', icon: Zap, desc: 'Wiring, fittings & repairs', workers: 128 },
  { id: 'plumber', name: 'Plumber', icon: Wrench, desc: 'Leaks, pipes & fixtures', workers: 96 },
  { id: 'carpenter', name: 'Carpenter', icon: Hammer, desc: 'Furniture & woodwork', workers: 74 },
  { id: 'painter', name: 'Painter', icon: PaintRoller, desc: 'Interior & exterior painting', workers: 61 },
  { id: 'mechanic', name: 'Mechanic', icon: Car, desc: 'Two & four wheeler repair', workers: 83 },
  { id: 'cleaner', name: 'Cleaner', icon: Sparkles, desc: 'Home & office cleaning', workers: 142 },
  { id: 'ac-repair', name: 'AC Repair', icon: Snowflake, desc: 'Service, gas fill & install', workers: 57 },
  { id: 'appliance-repair', name: 'Appliance Repair', icon: Refrigerator, desc: 'Washing machines, fridges', workers: 49 },
  { id: 'mason', name: 'Mason', icon: Blocks, desc: 'Construction & tiling', workers: 38 },
  { id: 'driver', name: 'Driver', icon: Truck, desc: 'Local & outstation driving', workers: 67 },
  { id: 'gardener', name: 'Gardener', icon: Trees, desc: 'Lawn & garden upkeep', workers: 29 },
  { id: 'other', name: 'Other Services', icon: Grid3x3, desc: 'Everything else', workers: 21 },
];
