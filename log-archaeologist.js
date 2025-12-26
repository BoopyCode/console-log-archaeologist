#!/usr/bin/env node

// Console Log Archaeologist - Digging up forgotten debug statements since today
// Because your console output shouldn't look like a developer's diary

const fs = require('fs');
const path = require('path');

function scanForConsoleLogs(dirPath) {
    const results = [];
    
    function walk(currentPath) {
        const items = fs.readdirSync(currentPath, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(currentPath, item.name);
            
            if (item.isDirectory()) {
                // Skip node_modules unless you want to see how many logs OTHER people forgot
                if (item.name !== 'node_modules') {
                    walk(fullPath);
                }
            } else if (item.name.endsWith('.js')) {
                examineFile(fullPath, results);
            }
        }
    }
    
    walk(dirPath);
    return results;
}

function examineFile(filePath, results) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        // Looking for console.log, console.warn, console.error - the usual suspects
        const trimmed = line.trim();
        if (trimmed.includes('console.log(') || 
            trimmed.includes('console.warn(') || 
            trimmed.includes('console.error(')) {
            
            // Skip commented lines (unless they're debugging comments about debugging)
            if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
                results.push({
                    file: filePath,
                    line: index + 1,
                    code: trimmed.length > 60 ? trimmed.substring(0, 57) + '...' : trimmed
                });
            }
        }
    });
}

function displayFindings(findings) {
    console.log('\n🔍 CONSOLE LOG ARCHAEOLOGIST REPORT 🔍');
    console.log('Found', findings.length, 'forgotten console statements\n');
    
    if (findings.length === 0) {
        console.log('Congratulations! Your code is cleaner than a cat that just bathed.');
        return;
    }
    
    console.log('These artifacts were discovered:');
    console.log('='.repeat(60));
    
    findings.forEach((finding, index) => {
        console.log(`\n${index + 1}. ${finding.file}:${finding.line}`);
        console.log(`   ${finding.code}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Tip: Consider removing these before deploying.');
    console.log('   Or leave them as a time capsule for future developers.');
}

// Main execution - because every script needs a dramatic entrance
const targetDir = process.argv[2] || '.';
console.log(`\n🧭 Scanning ${targetDir} for console.log fossils...`);

const findings = scanForConsoleLogs(targetDir);
displayFindings(findings);
