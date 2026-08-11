import fs from 'fs';
import { parse } from 'node-html-parser';

// The easiest way is to build the app and check the initial HTML? No, it's a SPA so HTML is empty.
// What if I just use a quick regex or manual trace on the OLD Header.tsx (before my last removal) vs NEW Header.tsx.
