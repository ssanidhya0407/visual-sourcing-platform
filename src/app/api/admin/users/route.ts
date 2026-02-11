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
            role: (user.customClaims?.role as string) || 'viewer', // Default to viewer
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
        const { email, password, displayName, role } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
        }

        const userRecord = await auth.createUser({
            email,
            password,
            displayName,
        });

        // Assign Role via Custom Claims
        if (role) {
            await auth.setCustomUserClaims(userRecord.uid, { role });
        }

        await AuditService.log('USER_CREATED', `Created new user: ${email} with role: ${role}`, 'admin');

        return NextResponse.json({ success: true, user: userRecord });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create user'
        }, { status: 500 });
    }
}
// Delete User
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json({ success: false, error: 'User UID required' }, { status: 400 });
        }

        await auth.deleteUser(uid);
        await AuditService.log('USER_DELETED', `Deleted user: ${uid}`, 'admin');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete user'
        }, { status: 500 });
    }
}
