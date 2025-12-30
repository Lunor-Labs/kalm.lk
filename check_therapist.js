const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKeyDev.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'kalm-dev-907c9'
});

const db = admin.firestore();

async function checkTherapist() {
  try {
    const therapistId = 'hfdKsaa6mQOgN6dTd9FGcv7efgv1';
    const therapistRef = db.collection('users').doc(therapistId);
    const therapistSnap = await therapistRef.get();

    if (!therapistSnap.exists) {
      console.log('Therapist not found');
      return;
    }

    const data = therapistSnap.data();
    console.log('Therapist data:', JSON.stringify(data, null, 2));

    // Check availability conditions
    const isActive = data.isActive;
    const therapistProfile = data.therapistProfile;
    const profileActive = therapistProfile?.isActive;
    const profileAvailable = therapistProfile?.isAvailable;

    console.log('Availability checks:');
    console.log('isActive:', isActive);
    console.log('therapistProfile.isActive:', profileActive);
    console.log('therapistProfile.isAvailable:', profileAvailable);

    if (isActive === false) {
      console.log('❌ FAIL: Therapist is deactivated (isActive = false)');
    } else if (profileActive === false) {
      console.log('❌ FAIL: Therapist profile is deactivated (therapistProfile.isActive = false)');
    } else if (profileAvailable === false) {
      console.log('❌ FAIL: Therapist is not available (therapistProfile.isAvailable = false)');
    } else {
      console.log('✅ PASS: Therapist is available for booking');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    admin.app().delete();
  }
}

checkTherapist();
