import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

export async function POST(request: Request) {
  try {
    const { query, filters } = await request.json();
    const { categories, minPrice, maxPrice, location } = filters || {};

    const supabase = createClient();

    // Start building the query
    let queryBuilder = supabase
      .from('products')
      .select(`
        *,
        ads!inner(*),
        shops!inner(
          *,
          profiles!inner(*)
        )
      `)
      .ilike('name', `%${query || ''}%`)
      .order('created_at', { ascending: false });

    // Apply category filter
    if (categories?.length) {
      queryBuilder = queryBuilder.contains('other', { category: categories });
    }

    // Apply price range filter
    if (minPrice !== undefined) {
      queryBuilder = queryBuilder.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
      queryBuilder = queryBuilder.lte('price', maxPrice);
    }

    // Apply location filter
    if (location) {
      queryBuilder = queryBuilder.ilike('shops.other->>location', `%${location}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Failed to perform search' },
        { status: 500 }
      );
    }

    return NextResponse.json({ results: data || [] });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
