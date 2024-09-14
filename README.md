# Posthouse

send email `>` `@`

## Local development
Clone git repo: `git clone git@github.com:topologies1/Posthouse.git`

Install: `npm install`

Run: `npm run dev`

## `.env` for `development/deployment`

```.env
SECRET_KEY=mySecretKey123    # Shared secret key
ENCRYPTION_KEY=your-32-byte-encryption-key  # Encryption key for AES-256
PORT=8080

EMAIL=
EMAIL_PASS=
EMAIL_HOST=mail.privateemail.com
EMAIL_PORT=465
MAX_CAPACITY=50

ORIGIN=http://localhost:3000
```

## Send single email from client

```js
async function test() {
    await fetch("http://localhost:8080", {
        method: "POST",
        headers: {
        "x-auth-iv": iv,
        "x-auth-encrypt": encryptedSecretKey,
        "x-auth-tag": authTag,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        to: "test-gviftrnnv@srv1.mail-tester.com",
        subject: "Working subject",
        // optional props
        props:{
            name: 'Recipient name' 
        }
        template:
            "<html><body><h1>Hello Tester</h1><p>This is the text content</p><a href='http://localhost:3000'>Get Started</a></body></html>",
        }),
    });
}
test();
```

## Send multiple email from client

```js
async function test() {
    await fetch("http://localhost:8080/multiple", {
        method: "POST",
        headers: {
        "x-auth-iv": iv,
        "x-auth-encrypt": encryptedSecretKey,
        "x-auth-tag": authTag,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        recipients: [
            {
                to: 'example@domain.com',
                // optional props
                props:{
                    name: 'Recipient name' 
                }
            }
        ],
        subject: "Working subject",
        template:
            "<html><body><h1>Hello Tester</h1><p>This is the text content {{name}}</p><a href='http://localhost:3000'>Get Started</a></body></html>",
        }),
    });
}
test();
```



## Generate `iv`, `encryptedSecretKey` and `authTag` for authentication
`.env` for sender
```js
SECRET_KEY=mySecretKey123    # Shared secret key
ENCRYPTION_KEY=your-32-byte-encryption-key  # Encryption key for AES-256
```

`enerateEncryptedSecretKey.js`
```js
"use server";
import crypto from "crypto";
import { validateRequest } from "~/server/auth";

async function getKeyFromPassphrase() {
  const enc = new TextEncoder();
  const keyMaterial = enc.encode(process.env.ENCRYPTION_KEY);

  const key = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("salt"), // Use a salt here
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function generateEncryptedSecretKey() {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM IV of 12 bytes
  const key = await getKeyFromPassphrase();

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    new TextEncoder().encode(process.env.SECRET_KEY)
  );

  // Split the encrypted data and tag (16 bytes at the end of the result)
  const encryptedArray = new Uint8Array(encryptedData);
  const authTag = encryptedArray.slice(-16); // Last 16 bytes is the authentication tag
  const encryptedPayload = encryptedArray.slice(0, -16); // Rest is the encrypted data

  // Send encrypted data, IV, and authTag to the server via WebSocket

  return JSON.stringify({
    encryptedSecretKey: Buffer.from(encryptedPayload).toString("hex"),
    iv: Buffer.from(iv).toString("hex"),
    authTag: Buffer.from(authTag).toString("hex") // Send the auth tag separately
  });
}
```

#### Your contributions are always appreciated!