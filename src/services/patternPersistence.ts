import { db } from '@/lib/firebase-admin';
import { ImageAttributes } from '@/app/actions';

export class PatternPersistence {
    static async savePattern(attributes: ImageAttributes) {
        try {
            // Create a deterministic ID based on attributes to track unique combinations
            const patternId = [
                attributes.category,
                attributes.shape,
                attributes.stoneDensity,
                attributes.metalVisibility,
                attributes.finish
            ].join('-').toLowerCase().replace(/\s+/g, '-');

            const patternRef = db.collection('patterns').doc(patternId);
            const doc = await patternRef.get();

            if (doc.exists) {
                // Increment frequency if pattern exists
                await patternRef.update({
                    frequency: (doc.data()?.frequency || 1) + 1,
                    lastSeenAt: new Date().toISOString()
                });
            } else {
                // Create new pattern entity
                await patternRef.set({
                    id: patternId,
                    attributes, // Store the full attribute set
                    frequency: 1,
                    createdAt: new Date().toISOString(),
                    lastSeenAt: new Date().toISOString()
                });
            }


        } catch (error) {
            console.error("Failed to persist pattern:", error);
            // Non-blocking error
        }
    }
}
