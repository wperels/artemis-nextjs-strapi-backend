
"Set up login and registration
Enable Strapi’s Users & Permissions plugin and build Next.js sign-up, login, logout, and protected-route flows. Use Strapi’s /api/auth/local/register and /api/auth/local endpoints; keep the returned JWT in an HTTP-only cookie rather than browser storage."
give me detailed instructions on the above. is "Strapi’s Users & Permissions plugin" free?
Completed 2 steps
Yes — Strapi's Users & Permissions plugin is completely free. It ships as a core, built-in plugin with every Strapi project (open-source Community Edition and Enterprise/Cloud tiers alike), enabled by default when you create a new project, and has no usage limits or paid gate. There's nothing extra to install or license.

Enabling and Configuring the Plugin
The plugin is installed automatically, but you need to configure it for your app:

In the Strapi admin panel, go to Settings → Users & Permissions plugin → Roles. Two roles exist by default: Public (unauthenticated) and Authenticated (logged-in users).

Under Advanced Settings, set "Enable sign-ups" to TRUE so /api/auth/local/register accepts new accounts, and choose the default role assigned to new users (usually Authenticated).

Under Roles → Public, grant only what unauthenticated users should see (e.g., find/findOne on public content). Under Roles → Authenticated, grant the content permissions logged-in users need.

In config/plugins.js (or .ts), you can tune JWT behavior:

js
module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtManagement: 'legacy-support', // or 'refresh' for short-lived tokens + refresh tokens
      jwt: { expiresIn: '7d' }, // avoid >30d
    },
  },
});
Keep JWT_SECRET in your .env file.

Register and Login from Next.js
Call Strapi's built-in auth endpoints directly — no custom controllers needed for basic register/login:

ts
// data/services/auth.ts
const baseUrl = process.env.STRAPI_URL!;

export async function registerUserService(userData: { username: string; email: string; password: string }) {
  const res = await fetch(`${baseUrl}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json(); // { jwt, user } on success, { error } on failure
}

export async function loginUserService(userData: { identifier: string; password: string }) {
  const res = await fetch(`${baseUrl}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
}
identifier can be either username or email; the register endpoint requires username, email, and password.

Storing the JWT in an HTTP-Only Cookie
Since these are plain REST calls, do them from a Next.js Server Action (or Route Handler) so the JWT never touches the browser. Use next/headers cookies API server-side:

ts
// data/actions/auth.ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { services } from "@/data/services";

const cookieConfig = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export async function registerUserAction(prevState: any, formData: FormData) {
  const fields = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const responseData = await services.auth.registerUserService(fields);
  if (!responseData || "error" in responseData) {
    return { success: false, strapiErrors: responseData?.error ?? null };
  }

  (await cookies()).set("jwt", responseData.jwt, cookieConfig);
  redirect("/dashboard");
}

export async function loginUserAction(prevState: any, formData: FormData) {
  const fields = {
    identifier: formData.get("identifier") as string,
    password: formData.get("password") as string,
  };

  const responseData = await services.auth.loginUserService(fields);
  if (!responseData || "error" in responseData) {
    return { success: false, strapiErrors: responseData?.error ?? null };
  }

  (await cookies()).set("jwt", responseData.jwt, cookieConfig);
  redirect("/dashboard");
}
Wire these into signup-form.tsx / signin-form.tsx via useActionState and a <form action={formAction}>, exactly as shown in Strapi's official Next.js tutorial series. Validate fields with Zod before hitting Strapi to surface clean errors.

Logout
Logout is just clearing the cookie server-side — Strapi has no server-side session to invalidate for standard JWT mode:

ts
// data/actions/auth.ts
"use server";
export async function logoutAction() {
  (await cookies()).delete("jwt");
  redirect("/signin");
}
Protected Routes
Use Next.js middleware to gate routes based on cookie presence, and validate the token server-side when fetching data:

ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

export function middleware(req: NextRequest) {
  const jwt = req.cookies.get("jwt")?.value;
  const isProtected = protectedRoutes.some((p) => req.nextUrl.pathname.startsWith(p));

  if (isProtected && !jwt) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
For actual data fetches, read the cookie server-side and forward it as Authorization: Bearer <jwt> to Strapi — never expose it via document.cookie or client JS, since httpOnly: true already blocks that by design.

Notes on JWT-in-Cookie Approach
Because Strapi's default /api/auth/local and /api/auth/local/register return the JWT in the response body, not as a Set-Cookie header, the cookie-setting logic lives entirely in your Next.js server code (as above) rather than in Strapi. If you'd rather have Strapi itself issue the httpOnly cookie (useful if you have non-Next.js clients), you'd extend the plugin's Auth.js controller with ctx.cookies.set(...), but for a pure Next.js frontend the approach above is simpler and is what Strapi's own tutorials recommend.

Prepared using Claude Sonnet 5 Thinking
Under Roles → Authenticated, grant the content permissions logged-in users need.
no permissions are set for Authentication. How do I know which ones to set?

This makes sense — "no permissions set" is the default, secure state. There's no universal preset list; you decide by mapping which API endpoints your logged-in Next.js users need to call, then flipping on exactly those.

Why It's Empty by Default
Strapi ships both Public and Authenticated roles with zero content permissions checked, on purpose — it forces you to explicitly opt in rather than accidentally exposing data. The only things enabled out of the box are the plugin's own auth routes (register, connect, callback) on the Public role.

How to Decide What to Enable
Go to Settings → Users & Permissions plugin → Roles → Authenticated, and for each content type/collection you see listed there, ask: "does a logged-in user need to do this from my Next.js app?" Concretely:

List your Strapi content types that logged-in users touch — e.g., Article, Order, Profile, Comment — and for each, the actions your Next.js UI actually calls: find (list), findOne (detail), create, update, delete, count.

Match to real user flows. If a user views their dashboard listing their own orders, you need find/findOne on Order. If they can edit their profile, you need update on User (under the Users-permissions category, not a custom content type). If they can post comments, you need create on Comment, etc.

Always enable the core Users-Permissions → User actions most apps need: me (returns the logged-in user's data — critical, since your Next.js app will call /api/users/me after login to verify the session) and often update if users edit their own profile.

Leave everything else off. Don't enable delete on content types unless users can actually delete that data; don't grant find on admin-only collections.

Practical Example
If your app lets authenticated users view and create their own "Projects":

Content type	Action	Enable for Authenticated?
Users-permissions (User)	me	Yes — needed to fetch current user after login
Users-permissions (User)	update	Yes, if users edit their profile
Project	find, findOne	Yes — users view their projects
Project	create	Yes — users can add projects
Project	update, delete	Only if users edit/remove their own projects
Any admin-only type	(all)	No
Row-Level Security Caveat
Enabling find on a content type lets any authenticated user query all records of that type by default — Strapi's role permissions are endpoint-level, not row-level. If users should only see their own data (e.g., their own orders), you must also add a custom controller/policy that filters by ctx.state.user.id, since the checkbox alone won't restrict it to "owned" records.

Where to Click
Settings → Users & Permissions plugin → Roles → Authenticated → expand each category (e.g., your content type name, or "Users-permissions") → tick the specific action checkboxes → Save. Test immediately: log in via /api/auth/local, take the returned JWT, and hit your endpoint with Authorization: Bearer <jwt> to confirm it now returns data instead of a 403.

Prepared using Claude Sonnet 5 Thinking
is there any way you can review the what is enabled for authenticated to see if I got the correct?

I don't have direct access to your Strapi admin panel or database, so I can't log in and inspect your instance myself — the only connector available to me right now is finance, and there's no Strapi/CMS connector configured. But I can absolutely review your setup if you give me the details in one of these ways:

Option 1: Paste What's Currently Checked
List out, category by category, which checkboxes are ticked under Settings → Users & Permissions plugin → Roles → Authenticated. For example:

text
Users-permissions (User): me, update
Article: find, findOne, create
Comment: find, create
I'll compare that against your app's actual data needs (which endpoints your Next.js pages/components call) and flag anything missing, unnecessary, or risky (like delete being enabled where it shouldn't be).

Option 2: Test It Programmatically
A more reliable check than eyeballing checkboxes is to actually hit the endpoints with a real JWT and see what responds. In your terminal:


Run this against your Strapi instance:

bash
# 1. Get a JWT
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser@example.com","password":"YourPassword123"}'

# 2. Test each endpoint your app relies on, using the returned jwt
curl http://localhost:1337/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_HERE"

curl http://localhost:1337/api/projects \
  -H "Authorization: Bearer YOUR_JWT_HERE"

curl -X POST http://localhost:1337/api/projects \
  -H "Authorization: Bearer YOUR_JWT_HERE" \
  -H "Content-Type: application/json" \
  -d '{"data":{"title":"Test"}}'
403 Forbidden → that permission isn't enabled for Authenticated and you need to add it.

200/201 → correctly enabled.

Repeat for every content type/action combo your Next.js app actually calls (list, detail, create, update, delete).

If you paste me either the list of checked boxes or the results of these curl tests, I'll tell you precisely what to add, remove, or double check — including flagging the row-level-security gap noted earlier (e.g., if find is on but should be scoped to "only the logged-in user's own records," a checkbox alone won't do that).

Prepared using Claude Sonnet 5 Thinking
what should be selected under "auth" for Authenticated?
Under the Authenticated role's AUTH section, here's what to check:

Action	Enable?	Reason
logout	Yes	Lets a logged-in user explicitly end their session
changePassword	Yes	Lets a logged-in user change their own password while authenticated
refresh	Only if using refresh-token mode	Not needed with the default legacy JWT setup; skip it if you're using the simple jwt.expiresIn config
register	No	Registration happens before login — this belongs on Public, not Authenticated
callback	No	OAuth callback handling, also a pre-login/public-facing route
connect	No	Initiates OAuth flow, also pre-login/public
forgotPassword	No	Used by logged-out users who forgot their password — belongs on Public
resetPassword	No	Same — part of the logged-out password-reset flow, belongs on Public
emailConfirmation	No	Confirms email after registration, before the user is fully authenticated — belongs on Public
sendEmailConfirmation	No	Same reasoning — pre-authentication flow, belongs on Public
Bottom line: for a standard email/password setup like yours, Authenticated only needs logout and changePassword checked in the AUTH section. Everything else in that section is a pre-login or logged-out-user flow and stays on Public instead.

Prepared using Claude Sonnet 5 Thinking
In config/plugins.js (or .ts), you can tune JWT behavior:js
this is in the backend. do I need to create a new branch for this?
Whether to branch is really a matter of your own Git workflow discipline, not a technical requirement — but yes, best practice says treat it like any other code change.

Should You Branch?
Since this is a backend config file (config/plugins.js), it's source code that lives in your Strapi repo just like everything else, so it deserves the same treatment:

Yes, create a branch — something like feature/jwt-config or chore/configure-jwt-auth, following whatever naming convention you already use.

Commit the change, test it locally (does login/register still return a valid JWT with the new expiresIn?), then merge into your main/dev branch via PR as usual.

Why It Matters Here Specifically
A couple of practical reasons this one is worth isolating in its own branch rather than bundling into unrelated work:

JWT config changes can break active sessions. If you change jwtManagement from legacy-support to refresh mode, or shorten expiresIn significantly, any users already logged in with old tokens may get logged out unexpectedly once deployed. Isolating it in a branch makes it easy to review, test, and roll back independently.

Environment-specific behavior. You'll likely want different values in dev vs. production (e.g., shorter expiresIn for testing, longer for prod), so keep this change reviewable on its own rather than mixed into feature work.

Quick Workflow
bash
git checkout main
git pull
git checkout -b chore/configure-jwt-auth
# edit config/plugins.js
git add config/plugins.js
git commit -m "Configure JWT expiration and management mode for users-permissions plugin"
git push -u origin chore/configure-jwt-auth
# open PR, test in a preview/staging deploy, then merge
One more thing worth double-checking: make sure JWT_SECRET and any other secrets stay in your .env file (which should already be gitignored) rather than hardcoded in config/plugins.js — you don't want that committed to the branch or repo history at all.

Prepared using Claude Sonnet 5 Thinking
"In config/plugins.js (or .ts), you can tune JWT behavior:"

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
      security: {
        allowedFileTypes: ['image/*'],
        maxSize: 10 * 1024 * 1024, // 10MB
      },
    },
  },
});

add in "module.exports = ({ env }) => ({
'users-permissions': {
config: {
jwtManagement: 'legacy-support', // or 'refresh' for short-lived tokens + refresh tokens
jwt: { expiresIn: '7d' }, // avoid >30d
},
},
});"

give me back the updated code
Here's the merged config/plugins.js with both plugin configs combined into a single module.exports:



plugins.js
JavaScript
I've generated the updated plugins.js file. Both plugin blocks now sit inside the same top-level module.exports = ({ env }) => ({ ... }) object, as separate keys — upload and users-permissions — since a module can only have one module.exports.

A couple of things to double check after dropping this in:

Restart Strapi after editing this file — plugin config changes require a server restart to take effect, hot-reload won't pick it up.

If you switch jwtManagement to 'refresh' later, you'll also need to configure refresh token settings (cookie name, expiry, rotation) — that mode isn't a drop-in replacement, so stick with 'legacy-support' for now unless you're specifically implementing refresh-token rotation.

Confirm CLOUDINARY_NAME, CLOUDINARY_KEY, and CLOUDINARY_SECRET are already set in your .env — this merge doesn't change that part, just makes sure it stays intact alongside the new JWT block.

Prepared using Claude Sonnet 5 Thinking


module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
      security: {
        allowedFileTypes: ['image/*'],
        maxSize: 10 * 1024 * 1024, // 10MB
      },
    },
  },
  'users-permissions': {
    config: {
      jwtManagement: 'legacy-support', // or 'refresh' for short-lived tokens + refresh tokens
      jwt: { expiresIn: '7d' }, // avoid >30d
    },
  },
});
