import { NextResponse } from 'next/server';
import { searchCache } from '@/lib/searchCache';

export async function POST() {
  try {
    searchCache.clear();
    return NextResponse.json({ 
      success: true, 
      message: 'Search cache cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}