import React from 'react';
import { renderToString } from 'react-dom/server';
import { BrowserRouter } from 'react-router-dom';
import App from './src/App.tsx';
import * as cheerio from 'cheerio';

// We need to mock some things or just use cheerio on the built HTML?
// Better: let's build the app, then use cheerio on a built chunk if possible.
