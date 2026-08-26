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
;
;
// Create base instance
const axiosClient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: ("TURBOPACK compile-time value", "https://d33txvk614c5de.cloudfront.net/api") || 'https://d33txvk614c5de.cloudfront.net',
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
"[project]/src/store/authStore.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/api/axiosClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$permissions$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/constants/permissions.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-toastify/dist/index.mjs [app-ssr] (ecmascript)");
;
;
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        user: null,
        accessToken: null,
        loading: true,
        setTokens: (accessToken, refreshToken)=>{
            set({
                accessToken
            });
            if (accessToken) {
                sessionStorage.setItem('token', accessToken);
                document.cookie = `token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
            } else {
                sessionStorage.removeItem('token');
                document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            }
            if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
            else if (refreshToken === null) sessionStorage.removeItem('refreshToken');
        },
        setUser: (user)=>{
            set({
                user
            });
            if (user) {
                sessionStorage.setItem('user', JSON.stringify(user));
                document.cookie = `role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
            } else {
                sessionStorage.removeItem('user');
                document.cookie = `role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            }
        },
        setLoading: (loading)=>set({
                loading
            }),
        silentRefresh: async ()=>{
            try {
                const storedRefreshToken = sessionStorage.getItem('refreshToken');
                if (!storedRefreshToken) throw new Error("No refresh token");
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post('/auth/refresh', {
                    refreshToken: storedRefreshToken
                });
                get().setTokens(response.accessToken, response.refreshToken || undefined);
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
                get().setUser(userData);
            } catch (err) {
                console.error('Silent refresh failed:', err.message);
                get().setTokens(null, null);
                get().setUser(null);
            } finally{
                get().setLoading(false);
            }
        },
        login: async (credentialsOrEmail, passwordParam)=>{
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
                get().setTokens(response.accessToken, response.refreshToken);
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
                get().setUser(userData);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(`Welcome back, ${userData?.name || userData?.fullName || 'User'}`);
                return userData;
            } catch (error) {
                console.error('API login failed:', error.message);
                throw error;
            }
        },
        logout: async ()=>{
            try {
                const storedRefreshToken = sessionStorage.getItem('refreshToken');
                if (storedRefreshToken) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post('/auth/logout', {
                        refreshToken: storedRefreshToken
                    });
                }
            } catch (e) {
                console.warn('Backend logout invalidation failed');
            } finally{
                get().setTokens(null, null);
                get().setUser(null);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$toastify$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info('Logged out successfully.');
            }
        },
        hasPermission: (permission)=>{
            const user = get().user;
            if (!user) return false;
            const permissions = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$permissions$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLE_PERMISSIONS"][user.role] || [];
            return permissions.includes(permission);
        },
        hasRole: (role)=>{
            const user = get().user;
            return user?.role === role;
        }
    }));
// Set up token accessors outside the store hook
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$axiosClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["injectTokenAccessors"])(()=>useAuthStore.getState().accessToken, (token)=>useAuthStore.getState().setTokens(token));
// Listen for auth expiration events
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$authStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/authStore.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthProvider = ({ children })=>{
    const loading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$authStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((state)=>state.loading);
    const silentRefresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$authStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((state)=>state.silentRefresh);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        silentRefresh();
    }, [
        silentRefresh
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: !loading && children
    }, void 0, false);
};
const useAuth = ()=>{
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$authStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((state)=>state.user);
    const loading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$authStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((state)=>state.loading);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$authStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((state)=>state.login);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$authStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((state)=>state.logout);
    const hasPermission = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$authStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((state)=>state.hasPermission);
    const hasRole = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$authStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((state)=>state.hasRole);
    const accessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$authStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])((state)=>state.accessToken);
    return {
        user,
        loading,
        login,
        logout,
        hasPermission,
        hasRole,
        accessToken
    };
};
}),
"[project]/src/store/currencyStore.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCurrencyStore",
    ()=>useCurrencyStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
;
;
;
const useCurrencyStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        currency: 'USD',
        rates: {
            USD: 1.0,
            INR: 83.5,
            EUR: 0.92,
            GBP: 0.78
        },
        setCurrency: (currency)=>set({
                currency
            }),
        fetchRates: async ()=>{
            try {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get('https://open.er-api.com/v6/latest/USD');
                if (response.data && response.data.rates) {
                    set({
                        rates: response.data.rates
                    });
                    console.log('Live currency rates fetched successfully:', response.data.rates);
                }
            } catch (error) {
                console.warn('Failed to fetch live exchange rates from open.er-api.com, using fallback rates:', error.message);
            }
        },
        formatPrice: (priceVal)=>{
            if (priceVal === undefined || priceVal === null) return '';
            let amount = 0;
            if (typeof priceVal === 'number') {
                amount = priceVal;
            } else if (typeof priceVal === 'string') {
                amount = parseFloat(priceVal.replace(/[^0-9.-]+/g, '')) || 0;
            }
            const { currency, rates } = get();
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
        },
        convertPrice: (priceVal)=>{
            let amount = 0;
            if (typeof priceVal === 'number') {
                amount = priceVal;
            } else if (typeof priceVal === 'string') {
                amount = parseFloat(priceVal.replace(/[^0-9.-]+/g, '')) || 0;
            }
            const { currency, rates } = get();
            const rate = rates[currency] || 1.0;
            return amount * rate;
        }
    }), {
    name: 'currency-storage',
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>sessionStorage),
    partialize: (state)=>({
            currency: state.currency,
            rates: state.rates
        })
}));
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$currencyStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/currencyStore.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const CurrencyProvider = ({ children })=>{
    const fetchRates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$currencyStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrencyStore"])((state)=>state.fetchRates);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchRates();
    }, [
        fetchRates
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
};
const useCurrency = ()=>{
    const currency = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$currencyStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrencyStore"])((state)=>state.currency);
    const setCurrency = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$currencyStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrencyStore"])((state)=>state.setCurrency);
    const rates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$currencyStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrencyStore"])((state)=>state.rates);
    const formatPrice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$currencyStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrencyStore"])((state)=>state.formatPrice);
    const convertPrice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$currencyStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCurrencyStore"])((state)=>state.convertPrice);
    return {
        currency,
        setCurrency,
        rates,
        formatPrice,
        convertPrice
    };
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
"[project]/src/store/cartStore.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCartStore",
    ()=>useCartStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$notification$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/notification.js [app-ssr] (ecmascript)");
;
;
;
const useCartStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        cartItems: [],
        isCartOpen: false,
        addToCart: (product, quantity = 1)=>{
            const { cartItems } = get();
            const existingItem = cartItems.find((item)=>item.id === product.id);
            if (existingItem) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$notification$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].success(`Updated ${product.name} quantity in cart`);
                set({
                    cartItems: cartItems.map((item)=>item.id === product.id ? {
                            ...item,
                            quantity: item.quantity + quantity
                        } : item)
                });
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$notification$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].success(`Added ${product.name} to cart`);
                set({
                    cartItems: [
                        ...cartItems,
                        {
                            ...product,
                            quantity
                        }
                    ]
                });
            }
        },
        removeFromCart: (productId)=>{
            set((state)=>({
                    cartItems: state.cartItems.filter((item)=>item.id !== productId)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$notification$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].info('Item removed from cart');
        },
        updateQuantity: (productId, quantity)=>{
            if (quantity <= 0) {
                get().removeFromCart(productId);
                return;
            }
            set((state)=>({
                    cartItems: state.cartItems.map((item)=>item.id === productId ? {
                            ...item,
                            quantity
                        } : item)
                }));
        },
        clearCart: ()=>{
            set({
                cartItems: []
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$notification$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].info('Cart cleared');
        },
        toggleCartDrawer: ()=>{
            set((state)=>({
                    isCartOpen: !state.isCartOpen
                }));
        },
        setIsCartOpen: (isOpen)=>{
            set({
                isCartOpen: isOpen
            });
        },
        // Derived state getters
        getCartTotal: ()=>{
            return get().cartItems.reduce((total, item)=>total + item.price * item.quantity, 0);
        },
        getCartItemCount: ()=>{
            return get().cartItems.reduce((count, item)=>count + item.quantity, 0);
        }
    }), {
    name: 'cart-storage',
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>sessionStorage)
}));
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/cartStore.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const CartProvider = ({ children })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
};
const useCart = ()=>{
    const cartItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCartStore"])((state)=>state.cartItems);
    const isCartOpen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCartStore"])((state)=>state.isCartOpen);
    const addToCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCartStore"])((state)=>state.addToCart);
    const removeFromCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCartStore"])((state)=>state.removeFromCart);
    const updateQuantity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCartStore"])((state)=>state.updateQuantity);
    const clearCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCartStore"])((state)=>state.clearCart);
    const toggleCartDrawer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCartStore"])((state)=>state.toggleCartDrawer);
    const setIsCartOpen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCartStore"])((state)=>state.setIsCartOpen);
    // Use getters for derived state
    const cartTotal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCartStore"])((state)=>state.getCartTotal());
    const cartItemCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$cartStore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCartStore"])((state)=>state.getCartItemCount());
    return {
        cartItems,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCartDrawer,
        setIsCartOpen,
        cartTotal,
        cartItemCount
    };
};
}),
"[project]/src/theme.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/styles/createTheme.mjs [app-ssr] (ecmascript) <export default as createTheme>");
;
const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$createTheme$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__["createTheme"])({
    palette: {
        primary: {
            main: '#243A5E',
            light: '#5F86A6',
            dark: '#1a2a44',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#8FB6D8',
            light: '#CFE3F1',
            dark: '#6e9aba',
            contrastText: '#243A5E'
        },
        background: {
            default: '#EDF4FA',
            paper: '#ffffff'
        },
        text: {
            primary: '#243A5E',
            secondary: '#5F86A6'
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700
        },
        h2: {
            fontWeight: 700
        },
        h3: {
            fontWeight: 600
        },
        h4: {
            fontWeight: 600
        },
        button: {
            textTransform: 'none',
            fontWeight: 600
        }
    },
    shape: {
        borderRadius: 12
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 24px'
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                    borderRadius: 16
                }
            }
        }
    }
});
const __TURBOPACK__default__export__ = theme;
}),
"[project]/src/providers/Providers.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/styles/ThemeProvider.mjs [app-ssr] (ecmascript) <export default as ThemeProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$CssBaseline$2f$CssBaseline$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/CssBaseline/CssBaseline.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
// Contexts (will be migrated to Zustand later, but needed for initial layout)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$CurrencyContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/CurrencyContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$CartContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/CartContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$theme$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/theme.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
function Providers({ children }) {
    // Create a new QueryClient for each session to avoid data leakage
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClient"]({
            defaultOptions: {
                queries: {
                    staleTime: 60 * 1000
                }
            }
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$ThemeProvider$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__["ThemeProvider"], {
            theme: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$theme$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$CssBaseline$2f$CssBaseline$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/providers/Providers.jsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthProvider"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$CurrencyContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CurrencyProvider"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$CartContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartProvider"], {
                            children: children
                        }, void 0, false, {
                            fileName: "[project]/src/providers/Providers.jsx",
                            lineNumber: 30,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/providers/Providers.jsx",
                        lineNumber: 29,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/providers/Providers.jsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/providers/Providers.jsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/providers/Providers.jsx",
        lineNumber: 25,
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

//# sourceMappingURL=%5Broot-of-the-server%5D__0so-6hr._.js.map