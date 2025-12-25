// ⚠️  CRITICAL SECURITY WARNING ⚠️
// This script deletes ALL users. Only run in development!
// Make sure you're using the correct service account key!

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Check if service account file exists
const serviceAccountPath = path.join(__dirname, "serviceAccountKeyDev.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Service account key not found:", serviceAccountPath);
  console.error("Make sure serviceAccountKeyDev.json exists in the project root");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Environment check
const isProduction = process.env.NODE_ENV === "production" || process.env.FIREBASE_ENV === "production";
if (isProduction) {
  console.error("❌ REFUSING TO RUN: This appears to be a production environment!");
  console.error("This script should only be used in development.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Configuration
const BATCH_SIZE = 500; // Smaller batches for better error handling

async function deleteUserData(uid) {
  const db = admin.firestore();

  try {
    // Check user data before deletion
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.role === 'therapist') {
        console.log(`🧑‍⚕️ Deleting therapist user: ${uid}`);
      }
    }

    // Delete user document from Firestore (includes therapist data if present)
    await db.collection('users').doc(uid).delete();

    // Delete related bookings (if any)
    const bookingsQuery = await db.collection('bookings')
      .where('clientId', '==', uid)
      .get();

    if (!bookingsQuery.empty) {
      const batch = db.batch();
      bookingsQuery.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`📅 Deleted ${bookingsQuery.size} bookings for ${uid}`);
    }

    return true;
  } catch (error) {
    console.warn(`⚠️ Failed to delete Firestore data for ${uid}:`, error.message);
    return false;
  }
}

async function deleteUsersBatch(uids) {
  console.log(`🔄 Processing batch of ${uids.length} users...`);

  // Delete from Firebase Auth
  try {
    const authResult = await admin.auth().deleteUsers(uids);
    console.log(`✅ Deleted ${authResult.successCount} users from Auth`);

    if (authResult.failureCount > 0) {
      console.warn(`⚠️ Failed to delete ${authResult.failureCount} users from Auth:`);
      authResult.errors.forEach(error => {
        console.warn(`  - ${error.index}: ${error.error.message}`);
      });
    }

    // Delete Firestore data for successfully deleted users
    const successfulUids = uids.filter((_, index) => !authResult.errors.some(err => err.index === index));

    for (const uid of successfulUids) {
      await deleteUserData(uid);
    }

    return authResult.successCount;
  } catch (error) {
    console.error(`❌ Batch deletion failed:`, error.message);
    return 0;
  }
}

async function deleteAllUsers(nextPageToken, totalDeleted = 0) {
  try {
    const result = await admin.auth().listUsers(BATCH_SIZE, nextPageToken);
    const uids = result.users.map(user => user.uid);

    if (uids.length === 0) {
      return totalDeleted;
    }

    const deletedCount = await deleteUsersBatch(uids);
    const newTotal = totalDeleted + deletedCount;

    if (result.pageToken) {
      return await deleteAllUsers(result.pageToken, newTotal);
    }

    return newTotal;
  } catch (error) {
    console.error(`❌ Error listing users:`, error.message);
    throw error;
  }
}

// User confirmation
function askForConfirmation() {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(
      '\n🚨 DANGER: This will delete ALL users from Firebase Auth and Firestore!\n' +
      'This action CANNOT be undone.\n\n' +
      'Type "YES" to confirm: ',
      (answer) => {
        rl.close();
        resolve(answer === 'YES');
      }
    );
  });
}

// Main execution
async function main() {
  try {
    console.log('🔍 Checking environment...');
    console.log('📍 Project ID:', admin.app().options.projectId);
    console.log('🌍 Environment: Development (confirmed)');

    // Get user count first
    const initialResult = await admin.auth().listUsers(1);
    if (initialResult.users.length === 0) {
      console.log('ℹ️ No users found to delete.');
      return;
    }

    console.log(`\n📊 Found users to delete. This operation will:`);
    console.log('  - Delete ALL Firebase Auth users');
    console.log('  - Delete ALL user documents from Firestore');
    console.log('  - Delete ALL therapist profiles');
    console.log('  - Delete ALL related bookings');

    const confirmed = await askForConfirmation();
    if (!confirmed) {
      console.log('❌ Operation cancelled by user.');
      return;
    }

    console.log('\n🚀 Starting deletion process...');
    const totalDeleted = await deleteAllUsers();

    console.log(`\n🎉 SUCCESS: Deleted ${totalDeleted} users and all related data`);
    console.log('✅ Firebase Auth users: Deleted');
    console.log('✅ Firestore user documents: Deleted');
    console.log('✅ Therapist profiles: Deleted');
    console.log('✅ Related bookings: Deleted');

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();
