const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKeyDev.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'kalm-dev-907c9'
});

const db = admin.firestore();

async function fixTherapistAvailability() {
  try {
    const therapistId = 'hfdKsaa6mQOgN6dTd9FGcv7efgv1';
    const therapistRef = db.collection('users').doc(therapistId);

    console.log('Making therapist available for booking...');

    await therapistRef.update({
      'therapistProfile.isAvailable': true,
      'therapistProfile.isActive': true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Therapist is now available for booking');

    // Verify the fix
    const updatedDoc = await therapistRef.get();
    const data = updatedDoc.data();
    console.log('Updated therapist data:');
    console.log('isActive:', data.isActive);
    console.log('therapistProfile.isActive:', data.therapistProfile?.isActive);
    console.log('therapistProfile.isAvailable:', data.therapistProfile?.isAvailable);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    admin.app().delete();
  }
}

fixTherapistAvailability();
