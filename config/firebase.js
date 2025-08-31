import admin, { initializeApp, credential as _credential } from "firebase-admin"
import serviceAccount from "./serviceAccountKey.json"

initializeApp({
    credential: _credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
})

export default admin