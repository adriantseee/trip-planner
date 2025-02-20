import { NextResponse } from 'next/server';
import { getFinal } from '@/utils/Planner';

export async function POST(request) {
  try {
    const { userInput, city, numberOfDays } = await request.json();
    const itinerary = await getFinal(userInput, city, numberOfDays);
    return NextResponse.json(itinerary);
  } catch (error) {
    console.error('Error in itinerary route:', error);
    return NextResponse.json({ error: 'Failed to generate itinerary' }, { status: 500 });
  }
}