import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  "src/pages/user/UserDashboard.jsx",
  "src/pages/user/Register.jsx",
  "src/pages/user/ProductListing.jsx",
  "src/pages/user/ProductDetails.jsx",
  "src/pages/user/Login.jsx",
  "src/pages/user/Home.jsx",
  "src/pages/user/ForgotPassword.jsx",
  "src/pages/user/Checkout.jsx",
  "src/pages/user/Cart.jsx",
  "src/pages/admin/DashboardProducts.jsx",
  "src/pages/admin/DashboardProductDetails.jsx",
  "src/pages/admin/DashboardCategoryDetails.jsx",
  "src/pages/admin/DashboardCategories.jsx",
  "src/layouts/user/UserDashboardLayout.jsx",
  "src/layouts/PublicLayout.jsx",
  "src/layouts/admin/DashboardLayout.jsx",
  "src/components/user/SearchAutocomplete.jsx",
  "src/components/user/GlobalHeader.jsx",
  "src/components/user/CategoryGrid.jsx",
  "src/components/user/CategoryCard.jsx",
  "src/components/user/cart/CartDrawer.jsx",
  "src/components/user/BreadcrumbNavigation.jsx",
  "src/components/common/Navbar.jsx",
  "src/components/common/SecurityGuards.jsx"
];

const basePath = 'd:/Archana Inventry Management/frontend';

filesToUpdate.forEach(relativePath => {
  const filePath = path.join(basePath, relativePath);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add "use client" if it has react hooks or react-router stuff
  if (!content.includes('"use client"') && !content.includes("'use client'")) {
    content = `"use client";\n` + content;
  }

  // 2. Handle specific react-router-dom imports
  
  // Link
  content = content.replace(/import\s+\{([^}]*)\bLink\b([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, (match, before, after) => {
      // If it only imported Link, replace entire statement
      if (before.trim() === '' && after.trim() === '') {
          return `import Link from 'next/link';`;
      }
      // Otherwise replace and prepend Link
      return `import Link from 'next/link';\nimport {${before}${after}} from 'react-router-dom';`;
  });
  
  // Link as RouterLink (like in ProductDetails)
  content = content.replace(/import\s+\{([^}]*)\bLink\s+as\s+RouterLink\b([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, (match, before, after) => {
    if (before.trim() === '' && after.trim() === '') {
        return `import RouterLink from 'next/link';`;
    }
    return `import RouterLink from 'next/link';\nimport {${before}${after}} from 'react-router-dom';`;
  });

  // useNavigate -> useRouter
  content = content.replace(/\buseNavigate\b/g, 'useRouter');
  content = content.replace(/const navigate = useRouter\(\)/g, 'const router = useRouter()');
  content = content.replace(/navigate\(/g, 'router.push(');

  // Group all navigation imports
  const nextNavImports = [];
  if (content.includes('useRouter')) nextNavImports.push('useRouter');
  if (content.includes('useParams')) nextNavImports.push('useParams');
  if (content.includes('useLocation')) nextNavImports.push('usePathname');
  
  if (nextNavImports.length > 0) {
      content = `import { ${nextNavImports.join(', ')} } from 'next/navigation';\n` + content;
  }

  // Clean up react-router-dom remaining empty imports
  content = content.replace(/import\s+\{\s*\}\s+from\s+['"]react-router-dom['"];?\n?/g, '');
  // Clean up useParams/useNavigate from react-router-dom
  content = content.replace(/useRouter/g, 'useRouter'); // already done above but ensuring it's not in the destructured import
  content = content.replace(/import\s+\{([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, (match, p1) => {
      let inner = p1.replace(/useRouter|useParams|useLocation/g, '').replace(/,\s*,/g, ',').trim();
      if (inner.startsWith(',')) inner = inner.substring(1);
      if (inner.endsWith(',')) inner = inner.substring(0, inner.length - 1);
      
      if (!inner.trim()) return '';
      return `import { ${inner} } from 'react-router-dom';`;
  });

  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${relativePath}`);
});

console.log('Migration of react-router-dom imports completed successfully.');
