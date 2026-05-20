import 'dotenv/config.js';
import fetch from 'node-fetch';

async function test() {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  const models = data.models.map(m => m.name).filter(n => n.includes('gemini'));
  console.log(models);
}

test();
