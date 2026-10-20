'use client';
import React, { createContext, useContext, useTransition } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const RouterContext = createContext(null);

export const Link = React.forwardRef(function Link({ to, href, replace, children, className, style, onClick, ...props }, ref) {
  const target = to || href || '#';
  return (
    <NextLink 
      ref={ref} 
      href={target} 
      replace={replace} 
      className={className} 
      style={style} 
      onClick={onClick}
      {...props}
    >
      {children}
    </NextLink>
  );
});

export function useNavigate() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (to, options = {}) => {
    startTransition(() => {
      if (typeof to === 'number') {
        if (to === -1) router.back();
        else if (to === 1) router.forward();
      } else if (options.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    });
  };
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const search = searchParams ? searchParams.toString() : '';

  return {
    pathname,
    search: search ? `?${search}` : '',
    hash: '',
    state: null,
    key: pathname
  };
}

export function useParams() {
  // If next/navigation useParams is available
  try {
    const nextParams = require('next/navigation').useParams();
    return nextParams || {};
  } catch (e) {
    return {};
  }
}

export function useSearchParamsAdapter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setSearchParams = (nextParams, options = {}) => {
    let nextQuery = '';
    if (typeof nextParams === 'function') {
      const current = new URLSearchParams(searchParams?.toString() || '');
      const updated = nextParams(current);
      nextQuery = updated ? updated.toString() : '';
    } else if (nextParams instanceof URLSearchParams) {
      nextQuery = nextParams.toString();
    } else if (typeof nextParams === 'object') {
      const q = new URLSearchParams();
      Object.entries(nextParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null) q.set(k, String(v));
      });
      nextQuery = q.toString();
    }
    const fullUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    if (options.replace) {
      router.replace(fullUrl);
    } else {
      router.push(fullUrl);
    }
  };

  return [searchParams || new URLSearchParams(), setSearchParams];
}

export { useSearchParamsAdapter as useSearchParams };

export const RouterLink = Link;

export const Outlet = ({ children }) => <>{children}</>;

export const Navigate = ({ to, replace }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to, { replace });
  }, [to, replace, navigate]);
  return null;
};

