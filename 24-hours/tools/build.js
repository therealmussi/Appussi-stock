const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>');

html = html.replace(/<script src="js\/([^"]+)"><\/script>/g, (m, f) =>
  '<script>\n' + fs.readFileSync(path.join(root, 'js', f), 'utf8') + '\n</script>'
);

const out = path.join(root, 'dist', '24-hours-standalone.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('standalone bytes:', html.length, '->', out);
