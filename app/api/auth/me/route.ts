import { NextResponse } from 'next/server';
import { getUserFromCookie } from '@/shared/server/auth';

export async function GET() {
    const user = await getUserFromCookie();

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        inn: user.inn,
        isActive: user.isActive,
        emailConfirmed: user.emailConfirmed,
    });
}
