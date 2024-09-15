# Posthouse

#### post { ... } `>` send email <span style="transform: scale(3);">📧</span>

<br />


### Development 
_____

**Clone Repository**

```
git clone git@github.com:topologies1/Posthouse.git
```
<br >

**Create `.env` file at the root**

_edit as you needed_
```
SECRET_KEY=mySecretKey123
ENCRYPTION_KEY=your-32-byte-encryption-key

EMAIL=hello@otask.club
EMAIL_PASS=password123
EMAIL_HOST=mail.privateemail.com
EMAIL_PORT=465
MAX_CAPACITY=50

ORIGIN=http://localhost:3000
```

<br />

**Commands _>**

_open the repository on your terminal_

Install `node_modules`
```
npm install
```
Run server
```
npm run dev
```
<br />

**🌐 endpoint 👉  `http://localhost:8080`**

<br />

### Properties of `headers` & `body`

****

**`headers`**

_Accept for Authorization_

```js
{
  "x-auth-iv": _your_generate_iv,
  "x-auth-encrypt": _your_generate_encrypted_key,
  "x-auth-tag": _your_generate_auth_tag
}
```
<br />

**`body`**

_Send an email_
```js
{
  to: _destination_email (e.g. hello@otask.club),
  subject: _email_subject,
  template: _html_email_template  (e.g. "<html><body><h1>Hello {{name}}</h1><p>This is the text content</p><a href='http://localhost:3000'>Get Started</a></body></html>"),

  // optional
  props:{
    name: 'Recipient name'
  },
}

```
<br />

**`body`**

_Send multiple email_
```js
{
  // 'recipients' (Array of emailes )
  recipients: [
    {
      to: 'example@domain.com',
      props:{
        name: 'Recipient name' 
      }
    }
  ],
  subject: "Working subject",
  template:
      "<html><body><h1>Hello {{name}}</h1><p>This is the text content</p><a href='http://localhost:3000'>Get Started</a></body></html>",
}
```
<br />

### Generate `headers` keys for Authorization
**`x-auth-iv: iv`, `x-auth-encrypt: encrypt`, `x-auth-tag: authTag`**
****

**Use server's same `.env` value as password!**
 
```
SECRET_KEY=mySecretKey123
ENCRYPTION_KEY=your-32-byte-encryption-key
```
<br />

**`getKeyFromPassphrase()`**

```js
import crypto from "crypto";

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

```

<br />

**`generateEncryptedSecretKey()`**

```js
import crypto from "crypto";
import getKeyFromPassphrase from "./getKeyFromPassphrase";

function getUTCTimestamp() {
  return Math.floor(new Date().getTime() / 1000); // Unix timestamp in seconds
}

async function generateEncryptedSecretKey() {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM IV of 12 bytes
  const key = await getKeyFromPassphrase();

  const timestamp = getUTCTimestamp(); // Get the current UTC timestamp
  const secretWithTimestamp = `${timestamp}:${process.env.SECRET_KEY}`; // Add the timestamp to the secret key

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    new TextEncoder().encode(secretWithTimestamp)
  );

  // Split the encrypted data and tag (16 bytes at the end of the result)
  const encryptedArray = new Uint8Array(encryptedData);
  const authTag = encryptedArray.slice(-16); // Last 16 bytes is the authentication tag
  const encryptedPayload = encryptedArray.slice(0, -16); // Rest is the encrypted data

  return {
    iv: Buffer.from(iv).toString("hex"),
    encrypt: Buffer.from(encryptedPayload).toString("hex"),
    authTag: Buffer.from(authTag).toString("hex")
  };
}
```
<br />

### Post email
_Post Single or Multiple email_
****


**Post An Email**

```js
import generateEncryptedSecretKey from "./generateEncryptedSecretKey";

const { iv, encrypt, authTag } = await generateEncryptedSecretKey()

await fetch("http://localhost:8080", {
  method: "POST",
  headers: {
    "x-auth-iv": iv,
    "x-auth-encrypt": encrypt,
    "x-auth-tag": authTag,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    to: "hello@otask.club",
    subject: "Development test subject",
    // optional props
    props:{
      name: 'Recipient name' 
    },
    template:
        "<html><body><h1>Hello {{name}}</h1><p>This is the text content</p><a href='http://localhost:3000'>Get Started</a></body></html>",
  }),
});
```
<br />

**Post Multiple Email**

```js
import generateEncryptedSecretKey from "./generateEncryptedSecretKey";

const { iv, encrypt, authTag } = await generateEncryptedSecretKey()

await fetch("http://localhost:8080", {
  method: "POST",
  headers: {
    "x-auth-iv": iv,
    "x-auth-encrypt": encrypt,
    "x-auth-tag": authTag,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    recipients: [
      {
        to: 'example@domain.com',
        props:{
          name: 'Recipient name' 
        }
      },
      {
        to: 'example2@domain.com',
        props:{
          name: 'Otask' 
        }
      }
    ],
    subject: "Development test subject",
    template:
        "<html><body><h1>Hello {{name}}</h1><p>This is the text content</p><a href='http://localhost:3000'>Get Started</a></body></html>",
  }),
});
```
<br />

#### 🤝 Your contributions are always appreciated!