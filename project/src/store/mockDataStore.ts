import { create } from 'zustand';

interface Equipment {
  id: string;
  title: string;
  type: string;
  description: string;
  location: string;
  rate: number;
  status: 'available' | 'booked' | 'inactive';
  image_url: string;
}

interface Booking {
  id: string;
  equipment_id: string;
  equipment: Equipment;
  user_id: string;
  user_email: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  total_amount: number;
}

interface MockDataState {
  equipment: Equipment[];
  bookings: Booking[];
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    title: 'CAT 320 Excavator',
    type: 'Excavator',
    description: 'Powerful excavator suitable for large construction projects',
    location: 'Johannesburg',
    rate: 4500,
    status: 'available',
    image_url: 'https://images.unsplash.com/photo-1610477865545-37711c53144d?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '2',
    title: 'Komatsu D61 Bulldozer',
    type: 'Bulldozer',
    description: 'Reliable bulldozer for earthmoving operations',
    location: 'Cape Town',
    rate: 5200,
    status: 'booked',
    image_url: 'https://images.unsplash.com/photo-1630288214032-2c4cc2c080ca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QnVsbGRvemVyfGVufDB8fDB8fHww'
  },
  {
    id: '3',
    title: 'JCB 3CX Backhoe',
    type: 'Backhoe',
    description: 'Versatile backhoe loader for multiple applications',
    location: 'Durban',
    rate: 3800,
    status: 'inactive',
    image_url: 'https://images.unsplash.com/photo-1646297970360-94c9f6d8903c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

const mockBookings: Booking[] = [
  {
    id: '1',
    equipment_id: '1',
    equipment: mockEquipment[0],
    user_id: 'user1',
    user_email: 'john@example.com',
    start_date: '2025-05-20',
    end_date: '2025-05-25',
    status: 'pending',
    total_amount: 22500
  },
  {
    id: '2',
    equipment_id: '2',
    equipment: mockEquipment[1],
    user_id: 'user2',
    user_email: 'sarah@example.com',
    start_date: '2025-05-18',
    end_date: '2025-05-28',
    status: 'active',
    total_amount: 52000
  },
  {
    id: '3',
    equipment_id: '3',
    equipment: mockEquipment[2],
    user_id: 'user3',
    user_email: 'mike@example.com',
    start_date: '2025-05-15',
    end_date: '2025-05-17',
    status: 'completed',
    total_amount: 11400
  }
];

export const useMockDataStore = create<MockDataState>(() => ({
  equipment: mockEquipment,
  bookings: mockBookings
}));