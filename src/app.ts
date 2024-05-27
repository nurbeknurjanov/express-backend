import express, { Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import authRoute from './routes/auth';
import productsRoute from './routes/products';
import filesRoute from './routes/files';
import usersRoute from './routes/users';
//import bodyParser from 'body-parser';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import './db/mongoose';
import { isAuthorized } from './middlewares';

const app = express();

//support standard parsing of application/x-www-form-urlencoded post data
/*app.use(bodyParser.urlencoded({
    extended: true
}));*/
// support parsing of application/json type post data
//app.use( bodyParser.json() );

//the same as parsing of application/json type post data
app.use(express.json());
//the same as support standard parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors());

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (_, res) => {
  res.send('Express + TypeScript Server');
});

app.get('/about', (_, res) => {
  res.send('About');
});

app.use('/auth', authRoute);
app.use('/products', productsRoute);
app.use('/files', isAuthorized).use('/files', filesRoute);
app.use('/users', isAuthorized).use('/users', usersRoute);

app.use((req, res) => {
  res.status(404).send({ url: req.originalUrl + ' not found' });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export { app };
