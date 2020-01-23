import express from 'express';
import { log } from './log';
import fs from 'fs';

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/signup', (req) => {
  try {
    fs.appendFileSync('/tmp/users.db', JSON.stringify(req.body) + '\n');
  } catch {
    log('ユーザ情報の保存に失敗しました');
  }
});

app.listen(3000);
