import fetch from 'node-fetch';

async function test() {
  const key = 'AIzaSyAsLUz3a3y_JIYhMmw_FJ7YblkrBGvZvvM';
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  const models = data.models.map(m => m.name).filter(n => n.includes('gemini'));
  console.log(models);
}

test();
