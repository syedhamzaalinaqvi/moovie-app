import { NextRequest, NextResponse } from 'next/server';
import { getAdZonesAction } from '../../../../admin/actions';

export async function GET(request: NextRequest) {
    try {
        const page = request.nextUrl.searchParams.get('page');
        const zones = await getAdZonesAction(page || undefined);
        return NextResponse.json(zones);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch zones' }, { status: 500 });
    }
}
