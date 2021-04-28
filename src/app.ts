import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import driveRouter from './routes/drive-router';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(cookieParser());
app.use(cors());

app.use('/drive', driveRouter);

app.use((req, res) => {
    return res.status(500).send({ message: `Url ${req.url} Not found` });
});

export default app;