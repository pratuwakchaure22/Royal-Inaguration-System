# Firebase Setup Guide

Follow these steps to run the project on your own Firebase project (free Spark plan is enough).

1. **Create a project** – [Firebase Console](https://console.firebase.google.com/) → *Add project*.
2. **Create the database** – *Build → Realtime Database → Create database*. Choose the region closest to your event and start in **locked mode**.
3. **Publish rules** – open the *Rules* tab, paste [`firebase/database.rules.json`](../firebase/database.rules.json) and click **Publish**.
4. **Register a web app** – *Project settings → Your apps → Web (`</>`)*. Copy the `firebaseConfig` values.
5. **Paste the config** – edit `src/assets/js/firebase-config.js` (template: `firebase-config.example.js`). Make sure `databaseURL` is included.
6. **(Recommended) Restrict the API key** – Google Cloud Console → *APIs & Services → Credentials* → HTTP referrers → add `https://<username>.github.io/*` and `http://localhost:*`.
7. **Test** – open `display.html` and `controller.html` in two tabs. The controller should show 🟢 *Connected*.

## Verify the data

In the console's *Data* tab you should see:

```text
smartCurtain
├── command
└── state
```
