import { MongoClient, Db } from 'mongodb';

let connectDbString = process.env.DB!;

let db: Db;
MongoClient.connect(connectDbString)
  .then(client => {
    console.log('DB mongo client connected!!');
    db = client.db();
  })
  .catch(error => console.log('DB failed', error));

export { db };
