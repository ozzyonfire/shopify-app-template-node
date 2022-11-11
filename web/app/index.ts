import Shopify, { LATEST_API_VERSION } from '@shopify/shopify-api';
import express from 'express';
import next from 'next';
import { AppInstallations } from './app_installations';
import redirectToAuth from './helpers/redirect-to-auth';
import applyAuthMiddleware from './middleware/auth';
import helloAPI from './api/hello';
import { setupGDPRWebHooks } from './gdpr';
import config from './config.json';

const USE_ONLINE_TOKENS = config.onlineTokens;

const PORT = process.env.PORT || 9000;
const DB_PATH = `${process.cwd()}/database.sqlite`;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY || '',
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET || '',
  SCOPES: process.env.SCOPES?.split(",") || ['write_products'],
  HOST_NAME: process.env.HOST?.replace(/https?:\/\//, "") || '',
  HOST_SCHEME: process.env.HOST?.split("://")[0] || '',
  API_VERSION: LATEST_API_VERSION,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  // See note below regarding using CustomSessionStorage with this template.
  SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
  ...(process.env.SHOP_CUSTOM_DOMAIN && { CUSTOM_SHOP_DOMAINS: [process.env.SHOP_CUSTOM_DOMAIN] }),
});

// NOTE: If you choose to implement your own storage strategy using
// Shopify.Session.CustomSessionStorage, you MUST implement the optional
// findSessionsByShopCallback and deleteSessionsCallback methods.  These are
// required for the app_installations.js component in this template to
// work properly.

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/api/webhooks",
  webhookHandler: async (_topic, shop, _body) => {
    await AppInstallations.delete(shop);
  },
});

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

const nextApp = next({
  dev: process.env.NODE_ENV !== 'production',
  dir: './frontend',
});

const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  app.set("use-online-tokens", USE_ONLINE_TOKENS);

  applyAuthMiddleware(app, {
    billing: {
      required: false
    }
  });

  // Let the core next.js files through
  app.get('/_next/*', (req, res) => {
    return handle(req, res);
  });

  // Define server api routes
  app.use('/api/hello', helloAPI);

  // Setup graphql proxy
  app.use('/graphql', async (req, res) => {
    const response = await Shopify.Utils.graphqlProxy(req, res);
    res.send(response.body);
  });

  app.use((req, res, next) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop as string);
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  app.use('/*', async (req, res) => {
    if (typeof req.query.shop !== "string") {
      console.log('No shop found in session or query');
      res.status(500);
      return res.send("No shop provided");
    }

    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (!shop) {
      res.status(500);
      return res.send("Invalid shop provided");
    }
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled && !req.originalUrl.match(/^\/exitiframe/i)) {
      return redirectToAuth(req, res);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== "1") {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);

      return res.redirect(embeddedUrl + req.path);
    }

    return handle(req, res);
  });

  app.get('/auth', async (req, res) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop as string);
    if (!shop) {
      res.status(500);
      return res.send("Invalid shop provided");
    }
    const appInstalled = await AppInstallations.includes(shop);
    if (!appInstalled && !req.originalUrl.match(/^\/exitiframe/i)) {
      return redirectToAuth(req, res);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== "1") {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);
      return res.redirect(embeddedUrl + req.path);
    }
  });

  // app.get('*', (req, res) => handle(req, res));

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});