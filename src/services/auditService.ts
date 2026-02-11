import { db } from '@/lib/firebase-admin';

export interface AuditLog {
    action: string;
    details: string;
    userId: string;
    timestamp: string;
    metadata?: any;
}

export class AuditService {
    static async log(action: string, details: string, userId: string = 'system', metadata: any = {}) {
        try {
            await db.collection('audit_logs').add({
                action,
                details,
                userId,
                timestamp: new Date().toISOString(),
                metadata
            });
        } catch (error) {
            console.error("Failed to write audit log:", error);
        }
    }
}
