import { log } from './log';

window.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector<HTMLFormElement>('#signup')!;
  form.onsubmit = () => {
    try {
      fetch('/signup', {
        method: 'POST',
        body: new FormData(form),
      });
    } catch {
      log('ユーザ情報の登録に失敗しました');
    }
  }
})
