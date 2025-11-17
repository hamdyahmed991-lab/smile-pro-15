<script type="module" src="/src/main.tsx"></script>
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Smile Pro</title>
  </head>
  <body>
    <div id="root"></div>

    <!-- Correct Vite React entry file -->
    <script type="module" src="/src/main.tsx"></script>

  </body>
</html>
