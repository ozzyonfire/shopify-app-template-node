import { Shopify, AuthQuery } from "@shopify/shopify-api";
import { gdprTopics } from "@shopify/shopify-api/dist/webhooks/registry";

import ensureBilling from "../helpers/ensure-billing";
import redirectToAuth from "../helpers/redirect-to-auth";

import { Express } from "express";
import { IVerifyRequestOptions } from "./verify-request";

export default function applyAuthMiddleware(
  app: Express,
  billingOptions: IVerifyRequestOptions
) {
  const {
    billing
  } = billingOptions;

  app.get("/api/auth", async (req, res) => {
    return redirectToAuth(req, res)
  });

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query as unknown as AuthQuery
      );

      if (!session || !session.accessToken) {
        return res.status(403).send("Could not validate auth callback");
      }

      const responses = await Shopify.Webhooks.Registry.registerAll({
        shop: session.shop,
        accessToken: session.accessToken,
      });

      Object.entries(responses).map(([topic, response]) => {
        // The response from registerAll will include errors for the GDPR topics.  These can be safely ignored.
        // To register the GDPR topics, please set the appropriate webhook endpoint in the
        // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.
        if (!response.success && !gdprTopics.includes(topic)) {
          const responseResult = response.result as any;
          if (responseResult.errors) {
            console.log(
              `Failed to register ${topic} webhook: ${responseResult.errors[0].message}`
            );
          } else {
            console.log(
              `Failed to register ${topic} webhook: ${JSON.stringify(responseResult.data, undefined, 2)
              }`
            );
          }
        }
      });

      // If billing is required, check if the store needs to be charged right away to minimize the number of redirects.
      if (billing && billing.required && billing.options) {
        const [hasPayment, confirmationUrl] = await ensureBilling(
          session,
          billing.options
        );

        if (!hasPayment) {
          return res.redirect(confirmationUrl);
        }
      }

      const host = Shopify.Utils.sanitizeHost(req.query.host as string);
      if (!host) {
        return res.status(400).send("Missing host parameter");
      }

      const redirectUrl = Shopify.Context.IS_EMBEDDED_APP
        ? Shopify.Utils.getEmbeddedAppUrl(req)
        : `/?shop=${session.shop}&host=${encodeURIComponent(host)}`;

      res.redirect(redirectUrl);
    } catch (e: any) {
      console.warn(e);
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          res.status(400);
          res.send(e.message);
          break;
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          return redirectToAuth(req, res);
          break;
        default:
          res.status(500);
          res.send(e.message);
          break;
      }
    }
  });
}
