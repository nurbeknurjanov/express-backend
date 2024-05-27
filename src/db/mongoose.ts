import mongoose from 'mongoose';

let connectDbString = process.env.DB!;

mongoose
  .connect(connectDbString)
  .then(response => console.log('DB connected!'))
  .catch(error => console.log('DB failed', error));
