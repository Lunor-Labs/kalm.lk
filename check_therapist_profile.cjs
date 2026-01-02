const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKeyDev.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'kalm-dev-907c9'
});

const db = admin.firestore();

async function checkTherapistProfiles() {
  try {
    console.log('Checking therapist profiles for old isAvailable fields...');

    const usersRef = db.collection('users');
    const q = admin.firestore().collection('users').where('role', '==', 'therapist');
    const snapshot = await q.get();

    let updatedCount = 0;

    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const therapistProfile = userData.therapistProfile;

      if (therapistProfile && (therapistProfile.isAvailable !== undefined || therapistProfile.isActive !== undefined)) {
        console.log(`Updating therapist ${doc.id}:`, {
          hasIsAvailable: therapistProfile.isAvailable !== undefined,
          hasIsActive: therapistProfile.isActive !== undefined,
          isAvailable: therapistProfile.isAvailable,
          isActive: therapistProfile.isActive
        });

        // Remove the old fields
        const updatedProfile = { ...therapistProfile };
        delete updatedProfile.isAvailable;
        delete updatedProfile.isActive;

        await doc.ref.update({
          therapistProfile: updatedProfile,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} therapist profiles, removed old availability fields`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    admin.app().delete();
  }
}

checkTherapistProfiles();
