import { JSDOM } from 'jsdom';

(async () => {
  const dom = await JSDOM.fromURL('https://haema.xyz/game', {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true
  });
  
  dom.window.console.error = (...args) => console.log('ERROR:', ...args);
  dom.window.console.warn = (...args) => console.log('WARN:', ...args);
  dom.window.console.log = (...args) => console.log('LOG:', ...args);
  
  // Wait a bit for scripts to load and execute
  setTimeout(() => {
    console.log('Finished waiting');
    process.exit(0);
  }, 5000);
})();
