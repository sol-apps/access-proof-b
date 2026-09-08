/// <reference path="../pb_data/types.d.ts" />
/*
 * main.pb.js — server-side hooks for access-proof-b.
 *
 * Two read-only routes, both returning invented demonstration content. They exist to
 * prove that the access decision happens HERE, on the server, and not in the page:
 *
 *   GET /api/proof/message   any authenticated caller           401 otherwise
 *   GET /api/proof/admin     authenticated callers whose        403 for ordinary users,
 *                            server-set role is "admin"         401 for unauthenticated
 *
 * `e.auth` is the record PocketBase resolved from the bearer token, and `role` on it is
 * written by pb_hooks/identity.pb.js from the identity provider's claim at each login.
 * Nothing in the request can influence either, which is the only reason this is a
 * control rather than a decoration.
 *
 * Refusals are logged without identifying who was refused: the spec's audience is test
 * users, and a demo app has no business accumulating a record of who pressed what.
 */

routerAdd("GET", "/api/proof/message", (e) => {
  if (!e.auth) {
    console.log("[proof] refusing /api/proof/message — no authenticated caller");
    throw new UnauthorizedError("sign in to read this message");
  }

  return e.json(200, {
    message: "Invented demonstration content: the depot kettle passed its safety check on Tuesday.",
    visible_to: "any signed-in user of this app",
  });
});

routerAdd("GET", "/api/proof/admin", (e) => {
  if (!e.auth) {
    console.log("[proof] refusing /api/proof/admin — no authenticated caller");
    throw new UnauthorizedError("sign in to read this message");
  }
  if (e.auth.get("role") !== "admin") {
    console.log("[proof] refusing /api/proof/admin — caller is not an admin of this app");
    throw new ForbiddenError("this message is for admins of this app");
  }

  return e.json(200, {
    message: "Invented demonstration content: the imaginary depot's biscuit budget is twelve tins a quarter.",
    visible_to: "admins of this app only",
  });
});
