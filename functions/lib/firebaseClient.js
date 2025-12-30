"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseApp = void 0;
const app_1 = require("firebase/app");
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};
exports.firebaseApp = (0, app_1.initializeApp)(firebaseConfig);
//# sourceMappingURL=firebaseClient.js.map