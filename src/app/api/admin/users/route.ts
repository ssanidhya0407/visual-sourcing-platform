import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { AuditService } from '@/services/auditService';

// List Users
export async function GET() {
    try {
        const listUsersResult = await auth.listUsers(100);
        const users = listUsersResult.users.map(user => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
        }));

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error("Error listing users:", error);
        return NextResponse.json({ success: false, error: 'Failed to list users' }, { status: 500 });
    }
}

// Create User
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, displayName } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
        }

        const userRecord = await auth.createUser({
            email,
            password,
            displayName,
        });

        await AuditService.log('USER_CREATED', `Created new user: ${email}`, 'admin');

        return NextResponse.json({ success: true, user: userRecord });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create user'
        }, { status: 500 });
    }
}
