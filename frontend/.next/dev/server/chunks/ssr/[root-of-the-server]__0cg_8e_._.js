module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/src/api/axiosClient.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "injectTokenAccessors",
    ()=>injectTokenAccessors
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-toastify/dist/index.mjs [app-ssr] (ecmascript)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("src/api/axiosClient.js")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
// Create base instance
const axiosClient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: __TURBOPACK__import$2e$meta__.env?.VITE_API_BASE_URL || 'https://d33txvk614c5de.cloudfront.net',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null)=>{
    failedQueue.forEach((prom)=>{
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};
// Memory-store accessor functions
let getAccessTokenFn = ()=>null;
let setAccessTokenFn = ()=>null;
const injectTokenAccessors = (getAccessToken, setAccessToken)=>{
    getAccessTokenFn = getAccessToken;
    setAccessTokenFn = setAccessToken;
};
// Request Interceptor: Inject Access Token
axiosClient.interceptors.request.use((config)=>{
    const token = getAccessTokenFn();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error)=>Promise.reject(error));
// Response Interceptor: Handle 401s and token refreshes
axiosClient.interceptors.response.use((response)=>{
    // Return the response data directly
    return response.data;
}, async (error)=>{
    const originalRequest = error.config;
    if (!error.response) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error('Network Error: Cannot connect to backend server.');
        return Promise.reject(error);
    }
    const { status, data } = error.response;
    // Handle 401 Unauthorized (Token Expiry)
    if (status === 401 && !originalRequest._retry) {
        if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
            // Refresh token itself is expired, or login credentials invalid
            return Promise.reject(error);
        }
        if (isRefreshing) {
            return new Promise((resolve, reject)=>{
                failedQueue.push({
                    resolve,
                    reject
                });
            }).then((token)=>{
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosClient(originalRequest);
            }).catch((err)=>Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
            // Retrieve explicit refreshToken
            const storedRefreshToken = sessionStorage.getItem('refreshToken');
            if (!storedRefreshToken) throw new Error('No refresh token available');
            // Call backend token refresh endpoint with body payload
            const refreshResponse = await axiosClient.post('/auth/refresh', {
                refreshToken: storedRefreshToken
            });
            const { accessToken, refreshToken } = refreshResponse;
            setAccessTokenFn(accessToken);
            if (refreshToken) {
                sessionStorage.setItem('refreshToken', refreshToken);
            }
            sessionStorage.setItem('token', accessToken);
            processQueue(null, accessToken);
            isRefreshing = false;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;
            setAccessTokenFn(null);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            // Dispatch custom event to trigger logout redirect in context
            window.dispatchEvent(new Event('auth-expired'));
            return Promise.reject(refreshError);
        }
    }
    // Pass custom backend validation messages
    const errorMsg = data?.message || 'Request failed';
    if (status === 403) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error('Access Denied: You do not have permission.');
    } else if (status === 422 || status === 400) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].warning(errorMsg);
    } else if (status >= 500) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error('Server Error: Please try again later.');
    }
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = axiosClient;
}),
"[project]/src/constants/roles.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ROLES",
    ()=>ROLES
]);
const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    PRODUCT_MANAGER: 'PRODUCT_MANAGER',
    SUPPORT_STAFF: 'SUPPORT_STAFF',
    ORDER_MANAGER: 'ORDER_MANAGER',
    ANALYTICS_MANAGER: 'ANALYTICS_MANAGER'
};
}),
"[project]/src/constants/permissions.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PERMISSIONS",
    ()=>PERMISSIONS,
    "ROLE_PERMISSIONS",
    ()=>ROLE_PERMISSIONS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$roles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/constants/roles.js [app-ssr] (ecmascript)");
;
const PERMISSIONS = {
    VIEW_DASHBOARD: 'view_dashboard',
    MANAGE_CATEGORIES: 'manage_categories',
    MANAGE_PRODUCTS: 'manage_products',
    MANAGE_ORDERS: 'manage_orders',
    UPDATE_ORDER_STATUS: 'update_order_status',
    VIEW_USERS: 'view_users',
    MANAGE_USERS: 'manage_users',
    MANAGE_MEDIA: 'manage_media',
    VIEW_ANALYTICS: 'view_analytics',
    MANAGE_STAFF: 'manage_staff',
    VIEW_LOGS: 'view_logs',
    MANAGE_CONFIG: 'manage_config',
    MANAGE_MAINTENANCE: 'manage_maintenance'
};
const ROLE_PERMISSIONS = {
    [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$roles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].SUPER_ADMIN]: Object.values(PERMISSIONS),
    'ADMIN': Object.values(PERMISSIONS),
    [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$roles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].PRODUCT_MANAGER]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_CATEGORIES,
        PERMISSIONS.MANAGE_PRODUCTS,
        PERMISSIONS.MANAGE_MEDIA,
        PERMISSIONS.MANAGE_CONFIG,
        PERMISSIONS.MANAGE_MAINTENANCE
    ],
    [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$roles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].SUPPORT_STAFF]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_ORDERS,
        PERMISSIONS.UPDATE_ORDER_STATUS,
        PERMISSIONS.VIEW_USERS
    ],
    [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$roles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].ORDER_MANAGER]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_ORDERS,
        PERMISSIONS.UPDATE_ORDER_STATUS
    ],
    [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$roles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLES"].ANALYTICS_MANAGER]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_ANALYTICS
    ]
};
}),
"[project]/src/context/AuthContext.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/api/axiosClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$permissions$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/constants/permissions.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-toastify/dist/index.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
const AuthProvider = ({ children })=>{
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [accessToken, setAccessToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Sync Axios Client memory accessor functions
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["injectTokenAccessors"])(()=>accessToken, (token)=>setAccessToken(token));
    const silentRefresh = async ()=>{
        try {
            const storedRefreshToken = sessionStorage.getItem('refreshToken');
            if (!storedRefreshToken) throw new Error("No refresh token");
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post('/auth/refresh', {
                refreshToken: storedRefreshToken
            });
            setAccessToken(response.accessToken);
            if (response.refreshToken) {
                sessionStorage.setItem('refreshToken', response.refreshToken);
            }
            let userData = response.user;
            if (!userData) {
                const profileResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get('/users/me', {
                    headers: {
                        Authorization: `Bearer ${response.accessToken}`
                    }
                });
                userData = profileResponse.data || profileResponse;
            }
            // Normalize backend roles array to frontend role string
            if (userData && Array.isArray(userData.roles) && userData.roles.length > 0) {
                let primaryRole = userData.roles[0];
                if (typeof primaryRole === 'object' && primaryRole.name) {
                    primaryRole = primaryRole.name;
                }
                if (typeof primaryRole === 'string' && primaryRole.startsWith('ROLE_')) {
                    primaryRole = primaryRole.substring(5); // Strip 'ROLE_'
                }
                userData.role = primaryRole || 'CUSTOMER';
            } else if (userData && !userData.role) {
                userData.role = 'CUSTOMER';
            }
            setUser(userData);
            sessionStorage.setItem('token', response.accessToken);
            sessionStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
            console.error('Silent refresh failed:', err.message);
            setAccessToken(null);
            setUser(null);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Attempt silent refresh on startup
        silentRefresh();
        // Catch session expiration events from Axios interceptor
        const handleAuthExpired = ()=>{
            setAccessToken(null);
            setUser(null);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error('Session expired. Please log in again.');
        };
        window.addEventListener('auth-expired', handleAuthExpired);
        return ()=>window.removeEventListener('auth-expired', handleAuthExpired);
    }, []);
    const login = async (credentialsOrEmail, passwordParam)=>{
        let email, password;
        if (typeof credentialsOrEmail === 'object' && credentialsOrEmail !== null) {
            email = credentialsOrEmail.email;
            password = credentialsOrEmail.password;
        } else {
            email = credentialsOrEmail;
            password = passwordParam;
        }
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post('/auth/login', {
                email,
                password
            });
            setAccessToken(response.accessToken);
            let userData = response.user;
            if (!userData) {
                const profileResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get('/users/me', {
                    headers: {
                        Authorization: `Bearer ${response.accessToken}`
                    }
                });
                userData = profileResponse.data || profileResponse;
            }
            // Normalize backend roles array to frontend role string
            if (userData && Array.isArray(userData.roles) && userData.roles.length > 0) {
                // Get the highest privilege role (or just the first one for now)
                let primaryRole = userData.roles[0];
                if (typeof primaryRole === 'object' && primaryRole.name) {
                    primaryRole = primaryRole.name;
                }
                if (typeof primaryRole === 'string' && primaryRole.startsWith('ROLE_')) {
                    primaryRole = primaryRole.substring(5); // Strip 'ROLE_'
                }
                userData.role = primaryRole || 'CUSTOMER';
            } else if (userData && !userData.role) {
                userData.role = 'CUSTOMER';
            }
            setUser(userData);
            sessionStorage.setItem('token', response.accessToken);
            if (response.refreshToken) {
                sessionStorage.setItem('refreshToken', response.refreshToken);
            }
            sessionStorage.setItem('user', JSON.stringify(userData));
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(`Welcome back, ${userData?.name || userData?.fullName || 'User'}`);
            return userData;
        } catch (error) {
            console.error('API login failed:', error.message);
            throw error; // Let the UI handle the error (e.g. show toast)
        }
    };
    const logout = async ()=>{
        try {
            const storedRefreshToken = sessionStorage.getItem('refreshToken');
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post('/auth/logout', {
                refreshToken: storedRefreshToken
            });
        } catch (e) {
            console.warn('Backend logout invalidation failed');
        } finally{
            setAccessToken(null);
            setUser(null);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info('Logged out successfully.');
        }
    };
    const hasPermission = (permission)=>{
        if (!user) return false;
        const permissions = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$permissions$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLE_PERMISSIONS"][user.role] || [];
        return permissions.includes(permission);
    };
    const hasRole = (role)=>{
        return user?.role === role;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            login,
            logout,
            hasPermission,
            hasRole,
            accessToken
        },
        children: !loading && children
    }, void 0, false, {
        fileName: "[project]/src/context/AuthContext.jsx",
        lineNumber: 160,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useAuth = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
}),
"[project]/src/utils/notification.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-toastify/dist/index.mjs [app-ssr] (ecmascript)");
;
const notification = {
    success: (message)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(message),
    error: (message)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(message || 'Something went wrong'),
    info: (message)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info(message),
    warning: (message)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].warning(message)
};
const __TURBOPACK__default__export__ = notification;
}),
"[project]/src/context/CartContext.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartProvider",
    ()=>CartProvider,
    "useCart",
    ()=>useCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$notification$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/notification.js [app-ssr] (ecmascript)");
;
;
;
const CartContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])();
const CartProvider = ({ children })=>{
    const [cartItems, setCartItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isCartOpen, setIsCartOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Load cart from local storage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const savedCart = sessionStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to parse cart from local storage', error);
            }
        }
    }, []);
    // Save cart to local storage whenever it changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        sessionStorage.setItem('cart', JSON.stringify(cartItems));
    }, [
        cartItems
    ]);
    const addToCart = (product, quantity = 1)=>{
        const existingItem = cartItems.find((item)=>item.id === product.id);
        if (existingItem) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$notification$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].success(`Updated ${product.name} quantity in cart`);
            setCartItems((prev)=>prev.map((item)=>item.id === product.id ? {
                        ...item,
                        quantity: item.quantity + quantity
                    } : item));
        } else {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$notification$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].success(`Added ${product.name} to cart`);
            setCartItems((prev)=>[
                    ...prev,
                    {
                        ...product,
                        quantity
                    }
                ]);
        }
    };
    const removeFromCart = (productId)=>{
        setCartItems((prev)=>prev.filter((item)=>item.id !== productId));
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$notification$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].info('Item removed from cart');
    };
    const updateQuantity = (productId, quantity)=>{
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems((prev)=>prev.map((item)=>item.id === productId ? {
                    ...item,
                    quantity
                } : item));
    };
    const clearCart = ()=>{
        setCartItems([]);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$notification$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].info('Cart cleared');
    };
    const toggleCartDrawer = ()=>{
        setIsCartOpen((prev)=>!prev);
    };
    const cartTotal = cartItems.reduce((total, item)=>total + item.price * item.quantity, 0);
    const cartItemCount = cartItems.reduce((count, item)=>count + item.quantity, 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CartContext.Provider, {
        value: {
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartItemCount,
            isCartOpen,
            toggleCartDrawer,
            setIsCartOpen
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/CartContext.jsx",
        lineNumber: 73,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useCart = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
}),
"[project]/src/context/CurrencyContext.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CurrencyProvider",
    ()=>CurrencyProvider,
    "useCurrency",
    ()=>useCurrency
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
;
;
;
const CurrencyContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
const CurrencyProvider = ({ children })=>{
    const [currency, setCurrency] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        return sessionStorage.getItem('currency') || 'USD';
    });
    const [rates, setRates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        USD: 1.0,
        INR: 83.5,
        EUR: 0.92,
        GBP: 0.78
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchRates = async ()=>{
            try {
                // Fetching live USD exchange rates from a completely free, open CORS exchange rate API
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get('https://open.er-api.com/v6/latest/USD');
                if (response.data && response.data.rates) {
                    setRates(response.data.rates);
                    console.log('Live currency rates fetched successfully:', response.data.rates);
                }
            } catch (error) {
                console.warn('Failed to fetch live exchange rates from open.er-api.com, using fallback rates:', error.message);
            }
        };
        fetchRates();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        sessionStorage.setItem('currency', currency);
    }, [
        currency
    ]);
    const formatPrice = (priceVal)=>{
        if (priceVal === undefined || priceVal === null) return '';
        let amount = 0;
        if (typeof priceVal === 'number') {
            amount = priceVal;
        } else if (typeof priceVal === 'string') {
            // Strips currency symbols ($, ₹, €, £) and commas, parsing the base value in USD
            amount = parseFloat(priceVal.replace(/[^0-9.-]+/g, '')) || 0;
        }
        const rate = rates[currency] || 1.0;
        const converted = amount * rate;
        const symbols = {
            USD: '$',
            INR: '₹',
            EUR: '€',
            GBP: '£'
        };
        const symbol = symbols[currency] || '$';
        return `${symbol}${converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };
    const convertPrice = (priceVal)=>{
        let amount = 0;
        if (typeof priceVal === 'number') {
            amount = priceVal;
        } else if (typeof priceVal === 'string') {
            amount = parseFloat(priceVal.replace(/[^0-9.-]+/g, '')) || 0;
        }
        const rate = rates[currency] || 1.0;
        return amount * rate;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CurrencyContext.Provider, {
        value: {
            currency,
            setCurrency,
            rates,
            formatPrice,
            convertPrice
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/CurrencyContext.jsx",
        lineNumber: 75,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useCurrency = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
}),
"[project]/src/app/ClientProviders.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClientProviders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$CartContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/CartContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$CurrencyContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/CurrencyContext.jsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function ClientProviders({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$CurrencyContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CurrencyProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$CartContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartProvider"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/src/app/ClientProviders.jsx",
                lineNumber: 14,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/ClientProviders.jsx",
            lineNumber: 13,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/ClientProviders.jsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0cg_8e_._.js.map