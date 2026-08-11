import fs from 'fs';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
// We can't easily render the app if there are a lot of dependencies.
