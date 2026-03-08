const { MongoClient } = require('mongodb');

/**
 * MongoDB Migration Script
 * 
 * Usage:
 * node migrate-db.js --source "SOURCE_URI" --target "TARGET_URI"
 * 
 * Example:
 * node migrate-db.js --source "mongodb://localhost:27017/source_db" --target "mongodb://localhost:27017/target_db"
 */

async function migrate() {
  const args = process.argv.slice(2);
  let sourceUri = 'mongodb+srv://subh:HsqSpAktWLKwVfwu@cluster0.1eude.mongodb.net/test?retryWrites=true&w=majority';
  let targetUri = 'mongodb+srv://subh:meow_meow@main.hss5fwb.mongodb.net/?appName=main';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source') sourceUri = args[i + 1];
    if (args[i] === '--target') targetUri = args[i + 1];
  }

  if (!sourceUri || !targetUri) {
    console.error('Usage: node migrate-db.js --source <SOURCE_URI> --target <TARGET_URI>');
    process.exit(1);
  }

  const sourceClient = new MongoClient(sourceUri);
  const targetClient = new MongoClient(targetUri);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    console.log('Connected to source and target databases.');

    const sourceDbName = sourceUri.split('/').pop().split('?')[0] || 'admin';
    const targetDbName = targetUri.split('/').pop().split('?')[0] || 'admin';

    const sourceDb = sourceClient.db(sourceDbName);
    const targetDb = targetClient.db(targetDbName);

    const collections = await sourceDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to migrate.`);

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\nMigrating collection: ${collectionName}`);

      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);

      // Copy indexes
      const indexes = await sourceCollection.indexes();
      if (indexes.length > 0) {
        console.log(`- Copying ${indexes.length} indexes...`);
        try {
          await targetCollection.createIndexes(indexes);
        } catch (err) {
          console.warn(`- Warning: Could not copy some indexes for ${collectionName}: ${err.message}`);
        }
      }

      // Copy documents (using bulk operations)
      const totalDocs = await sourceCollection.countDocuments();
      console.log(`- Copying ${totalDocs} documents...`);

      if (totalDocs > 0) {
        const cursor = sourceCollection.find();
        let batch = [];
        const batchSize = 1000;
        let processed = 0;

        while (await cursor.hasNext()) {
          const doc = await cursor.next();
          batch.push({
            replaceOne: {
              filter: { _id: doc._id },
              replacement: doc,
              upsert: true
            }
          });

          if (batch.length === batchSize) {
            await targetCollection.bulkWrite(batch);
            processed += batch.length;
            console.log(`  - Progress: ${processed}/${totalDocs}`);
            batch = [];
          }
        }

        if (batch.length > 0) {
          await targetCollection.bulkWrite(batch);
          processed += batch.length;
          console.log(`  - Progress: ${processed}/${totalDocs}`);
        }
      }

      console.log(`- Successfully migrated ${collectionName}`);
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

migrate();
