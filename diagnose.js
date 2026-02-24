const { exec } = require('child_process');
const fs = require('fs');

console.log('Running diagnostics...');

exec('npm run lint', (error, stdout, stderr) => {
    const output = `--- LINT OUTPUT ---\n${stdout}\n${stderr}\n`;
    fs.appendFileSync('diagnostic_log.txt', output);
    if (error) {
        console.log('Lint failed with code ' + error.code);
    } else {
        console.log('Lint succeeded');
    }
});

exec('npm run build', (error, stdout, stderr) => {
    const output = `--- BUILD OUTPUT ---\n${stdout}\n${stderr}\n`;
    fs.appendFileSync('diagnostic_log.txt', output);
    if (error) {
        console.log('Build failed with code ' + error.code);
    } else {
        console.log('Build succeeded');
    }
});
