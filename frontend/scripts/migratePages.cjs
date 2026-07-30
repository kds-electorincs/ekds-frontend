const fs = require('fs');
const path = require('path');

const userDir = 'src/app/(user)';
const adminDir = 'src/app/(admin)';

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name === 'page.jsx' || entry.name === 'layout.jsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Add "use client" if not present
      if (!content.includes('"use client"') && !content.includes("'use client'")) {
        content = '"use client";\n' + content;
        changed = true;
      }

      // Replace react-router-dom Link with next/link
      if (content.includes("import { Link as RouterLink")) {
        content = content.replace(/import\s+\{[^}]*Link\s+as\s+RouterLink[^}]*\}\s+from\s+['"]react-router-dom['"];?/g, "import NextLink from 'next/link';\nimport { Link as RouterLink } from 'react-router-dom';"); // Quick hack to add next link, we will manually replace RouterLink below. Actually let's do a better replace.
      }
      
      // Let's do string replacement for common hooks
      content = content.replace(/import\s+\{([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, (match, p1) => {
        let newImports = [];
        let nextImports = [];
        let routerDomImports = [];
        
        const imports = p1.split(',').map(i => i.trim());
        for (const imp of imports) {
          if (imp === 'Link as RouterLink' || imp === 'Link') {
            nextImports.push("import NextLink from 'next/link';");
          } else if (imp === 'useNavigate' || imp === 'useLocation' || imp === 'useParams' || imp === 'useSearchParams') {
            // These will go to next/navigation
          } else {
            routerDomImports.push(imp);
          }
        }
        
        let res = '';
        if (nextImports.length > 0) res += nextImports[0] + '\n';
        if (p1.includes('useNavigate') || p1.includes('useLocation') || p1.includes('useParams') || p1.includes('useSearchParams')) {
          res += "import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';\n";
        }
        if (routerDomImports.length > 0) {
          res += `import { ${routerDomImports.join(', ')} } from 'react-router-dom';\n`;
        }
        return res;
      });

      // Fix relative imports: since they moved from src/_pages/user/X to src/app/(user)/X/page.jsx, we need one more level of nesting (../../ -> ../../../)
      // Actually src/_pages/user/X.jsx was at depth 2. src/app/(user)/X/page.jsx is at depth 3. So we add one `../`.
      if (changed || true) {
        // Find imports starting with `../` and add one more `../`
        content = content.replace(/from\s+['"](\.\.\/[^'"]+)['"]/g, (match, p1) => {
          return `from '../../${p1}'`;
        });
        
        // Also fix `useNavigate()` -> `useRouter()`
        content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\);/g, "const router = useRouter();");
        content = content.replace(/navigate\(/g, "router.push(");
        content = content.replace(/component=\{RouterLink\}/g, "component={NextLink}");
        content = content.replace(/\s+to=/g, " href=");
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Processed: ${fullPath}`);
    }
  }
}

processDir(userDir);
processDir(adminDir);
