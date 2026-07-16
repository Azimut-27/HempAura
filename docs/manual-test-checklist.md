# HempAura manual test checklist

## Navigation and accessibility

- Test desktop and mobile navigation on current Chrome, Edge, Firefox, and Safari.
- Navigate the entire site with keyboard only.
- Confirm visible focus, logical heading order, and Escape-to-close behavior.
- Confirm mobile menu and cart drawer do not leave body scrolling enabled.
- Test at 320 px, 375 px, 768 px, 1024 px, and 1440 px widths.
- Enable reduced motion and confirm animations are effectively disabled.

## Catalogue and cart

- Open every product route directly and through the catalogue.
- Test unavailable, low-stock, and active product states.
- Add, increment, decrement, directly edit, and remove cart quantities.
- Confirm quantity never exceeds stock or drops below one.
- Refresh and confirm cart persistence and safe stale-product removal.
- Test empty cart and clear-cart states.

## Checkout

- Confirm disabled checkout creates no Stripe session.
- In Stripe test mode, test successful and cancelled checkout.
- Confirm client-supplied prices are rejected.
- Confirm unsupported countries cannot complete checkout.
- Deliver the same webhook twice and confirm one order only.
- Test delayed success and failure events.
- Confirm redirect alone never produces a false payment confirmation.

## Contact and newsletter

- Submit valid and invalid contact forms.
- Confirm honeypot and rate limits.
- Confirm database storage, internal notification, and customer acknowledgement.
- Test Resend failure and confirm the submission remains stored for retry.
- Test newsletter explicit consent, duplicate pending, duplicate confirmed, expiry,
  confirmation, and unsubscribe.

## Resilience

- Test slow network and offline failures.
- Test invalid API payloads and unavailable server configuration.
- Confirm no raw stack traces or secrets appear in browser responses.
- Run `npm audit` and review all production dependency findings before launch.
