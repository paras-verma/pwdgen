#!/usr/bin/env ts-node
import { encrypt } from './pwd';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: ts-node index.ts <input> <password> [count]

  input     Service / vendor name
  password  Master passphrase
  count     Number of passwords to generate (default: 5)

Example:
  ts-node index.ts github my-passphrase 5
`);
    process.exit(0);
  }

  const input    = args[0];
  const password = args[1];
  const count    = args[2] ? parseInt(args[2], 10) : 5;

  const passwords: string[] = [];
  let iter = 100000;
  const pattern = /[0-9]/;
  const special = /[@#$%^*_+\-:,?/\\]/;

  console.log(`Generating passwords for: ${input}\n`);

  for (let i = 0; i < count;) {
    // echo adds a trailing \n before piping to OpenSSL — match that here
    const candidate = encrypt(input + '\n', password, iter);
    if (pattern.test(candidate) && special.test(candidate)) {
      i++;
      passwords.push(candidate);
    }
    iter++;
  }

  passwords.forEach((pwd, idx) => console.log(`${idx + 1}: ${pwd}`));
}

main().catch(err => { console.error(err.message); process.exit(1); });
